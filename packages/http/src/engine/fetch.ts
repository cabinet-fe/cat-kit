import type { HTTPResponse, ProgressInfo, RequestConfig } from '../types'
import { HTTPError } from '../types'
import { HttpEngine } from './engine'
import { buildRequestBody } from './shared'

function parseContentLength(response: Response): number {
  const raw = response.headers.get('content-length')
  if (raw === null || raw === '') {
    return 0
  }
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function buildProgressInfo(loaded: number, total: number): ProgressInfo {
  return {
    loaded,
    total,
    percent: total > 0 ? Math.min(100, Math.floor((loaded / total) * 100)) : 0
  }
}

function mergeUint8Chunks(chunks: Uint8Array[]): Uint8Array {
  let size = 0
  for (const c of chunks) {
    size += c.length
  }
  const out = new Uint8Array(size)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }
  return out
}

type SignalMerge = { signal: AbortSignal; cleanup: () => void }

function mergeAbortSignals(
  userSignal: AbortSignal | undefined,
  internalSignal: AbortSignal
): SignalMerge {
  const anyFn = (AbortSignal as unknown as { any?: (signals: AbortSignal[]) => AbortSignal }).any
  if (typeof anyFn === 'function') {
    const signals = userSignal ? [userSignal, internalSignal] : [internalSignal]
    return { signal: anyFn.call(AbortSignal, signals), cleanup: () => {} }
  }

  const merged = new AbortController()
  const cleanups: (() => void)[] = []

  const forward = (): void => {
    if (!merged.signal.aborted) {
      merged.abort()
    }
  }

  const watch = (sig: AbortSignal): void => {
    if (sig.aborted) {
      forward()
      return
    }
    const onAbort = (): void => forward()
    sig.addEventListener('abort', onAbort)
    cleanups.push(() => sig.removeEventListener('abort', onAbort))
  }

  if (userSignal) {
    watch(userSignal)
  }
  watch(internalSignal)

  return {
    signal: merged.signal,
    cleanup: (): void => {
      for (const c of cleanups) {
        c()
      }
    }
  }
}

export class FetchEngine extends HttpEngine {
  private controllers: Set<AbortController> = new Set()

  constructor() {
    super()
  }

  async request<T = any>(url: string, config: RequestConfig): Promise<HTTPResponse<T>> {
    const {
      method = 'GET',
      body,
      timeout,
      responseType,
      signal: userSignal,
      onDownloadProgress
    } = config

    if (userSignal?.aborted) {
      throw new HTTPError('请求被中止', { code: 'ABORTED', url, config })
    }

    const controller = new AbortController()
    this.controllers.add(controller)
    let isTimeoutAbort = false

    let timeoutId: number | undefined = undefined
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => {
        isTimeoutAbort = true
        controller.abort()
      }, timeout) as unknown as number
    }

    const { signal: fetchSignal, cleanup: signalCleanup } = mergeAbortSignals(
      userSignal,
      controller.signal
    )

    try {
      const fetchOptions: RequestInit = {
        method,
        signal: fetchSignal,
        credentials: config.credentials === false ? 'omit' : 'include',
        headers: { ...config.headers }
      }

      const headers = fetchOptions.headers as Record<string, string>
      const requestBody = buildRequestBody(method, body, headers)
      if (requestBody !== null) {
        fetchOptions.body = requestBody
      }

      const response = await fetch(url, fetchOptions)

      const useProgress =
        typeof onDownloadProgress === 'function' &&
        response.body &&
        typeof response.body.getReader === 'function'

      const data = useProgress
        ? await this.parseResponseWithDownloadProgress<T>(
            response,
            responseType,
            onDownloadProgress!
          )
        : await this.parseResponseData<T>(response, responseType)

      const httpResponse: HTTPResponse<T> = {
        data,
        code: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        raw: response
      }

      if (!response.ok) {
        throw new HTTPError(`请求失败，状态码: ${response.status}`, {
          code: 'NETWORK',
          url,
          config,
          response: httpResponse
        })
      }

      return httpResponse
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new HTTPError(isTimeoutAbort ? '请求超时' : '请求被中止', {
          code: isTimeoutAbort ? 'TIMEOUT' : 'ABORTED',
          url,
          config,
          cause: error
        })
      }

      if (error instanceof HTTPError) {
        throw error
      }

      throw new HTTPError('网络错误', { code: 'NETWORK', url, config, cause: error })
    } finally {
      signalCleanup()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      this.controllers.delete(controller)
    }
  }

  private async parseResponseWithDownloadProgress<T>(
    response: Response,
    responseType: RequestConfig['responseType'],
    onDownloadProgress: (info: ProgressInfo) => void
  ): Promise<T> {
    const total = parseContentLength(response)
    const reader = response.body!.getReader()
    const chunks: Uint8Array[] = []
    let loaded = 0

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        if (value && value.length > 0) {
          chunks.push(value)
          loaded += value.length
          onDownloadProgress(buildProgressInfo(loaded, total))
        }
      }
    } finally {
      reader.releaseLock?.()
    }

    onDownloadProgress(buildProgressInfo(loaded, total))

    const merged = mergeUint8Chunks(chunks)
    return this.decodeResponseBody<T>(merged, response, responseType)
  }

  private decodeResponseBody<T>(
    bytes: Uint8Array,
    response: Response,
    responseType: RequestConfig['responseType']
  ): T {
    const resolvedType = responseType || 'json'

    if (resolvedType === 'text') {
      return new TextDecoder().decode(bytes) as T
    }

    if (resolvedType === 'blob') {
      return new Blob([bytes]) as T
    }

    if (resolvedType === 'arraybuffer') {
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as T
    }

    const text = new TextDecoder().decode(bytes)
    if (!text) {
      return null as T
    }

    try {
      return JSON.parse(text) as T
    } catch (error) {
      throw new HTTPError('响应解析失败', {
        code: 'PARSE',
        response: {
          data: text,
          code: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          raw: response
        },
        cause: error
      })
    }
  }

  private async parseResponseData<T>(
    response: Response,
    responseType: RequestConfig['responseType']
  ): Promise<T> {
    const resolvedType = responseType || 'json'

    if (resolvedType === 'text') {
      return (await response.text()) as T
    }

    if (resolvedType === 'blob') {
      return (await response.blob()) as T
    }

    if (resolvedType === 'arraybuffer') {
      return (await response.arrayBuffer()) as T
    }

    const text = await response.text()
    if (!text) {
      return null as T
    }

    try {
      return JSON.parse(text) as T
    } catch (error) {
      throw new HTTPError('响应解析失败', {
        code: 'PARSE',
        response: {
          data: text,
          code: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          raw: response
        },
        cause: error
      })
    }
  }

  abort(): void {
    for (const controller of this.controllers) {
      controller.abort()
    }
    this.controllers.clear()
  }
}
