import type { HTTPResponse, ProgressInfo, RequestConfig } from '../types'
import { HTTPError } from '../types'
import { HttpEngine } from './engine'
import { buildRequestBody, inferResponseType } from './shared'

/** 从 Fetch Response 中解析 Content-Length，无效时返回 0 */
function parseContentLength(response: Response): number {
  const raw = response.headers.get('content-length')
  if (raw === null || raw === '') {
    return 0
  }
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/** 从已加载字节数和总字节数构建 ProgressInfo */
function buildProgressInfo(loaded: number, total: number): ProgressInfo {
  return {
    loaded,
    total,
    percent: total > 0 ? Math.min(100, Math.floor((loaded / total) * 100)) : 0
  }
}

/** 将多个 Uint8Array 分片合并为单个连续数组 */
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

/**
 * 将用户传入的 signal 和内部超时 signal 合并为一个
 * - 优先使用 AbortSignal.any()；不支持时通过 AbortController 手动实现
 */
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

function getResponseHeaders(response: Response) {
  const headers: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    headers[key] = value
  })

  const setCookie = response.headers.getSetCookie()
  if (setCookie && setCookie.length) {
    headers['set-cookie'] = setCookie.join('\n')
  }

  return headers
}

export class FetchEngine extends HttpEngine {
  private controllers: Set<AbortController> = new Set()

  async request<T = any>(url: string, config: RequestConfig = {}): Promise<HTTPResponse<T>> {
    const {
      method = 'GET',
      body: requestBody,
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
      }, timeout)
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
      const builtBody = buildRequestBody(method, requestBody, headers)
      if (builtBody !== null) {
        fetchOptions.body = builtBody
      }

      const response = await fetch(url, fetchOptions)

      const useProgress =
        typeof onDownloadProgress === 'function' &&
        response.body &&
        typeof response.body.getReader === 'function'

      const resolvedResponseType =
        responseType || inferResponseType(response.headers.get('content-type'))
      const responseBody = useProgress
        ? await this.parseResponseWithDownloadProgress<T>(
            response,
            resolvedResponseType,
            onDownloadProgress!
          )
        : await this.parseResponseData<T>(response, resolvedResponseType)

      const httpResponse: HTTPResponse<T> = {
        body: responseBody,
        code: response.status,
        headers: getResponseHeaders(response),
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

  /**
   * 以流式方式读取响应体并透传下载进度回调
   * - 分片累积后合并为完整 Uint8Array 再解码
   */
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
    return this.decodeBytes<T>(merged, response, responseType)
  }

  /**
   * 将文本解析为 JSON
   * - 空文本返回 null
   * - 解析失败抛 PARSE 错误（含响应上下文）
   */
  private parseJSONBody<T>(text: string, response: Response): T {
    if (!text) {
      return null as T
    }

    try {
      return JSON.parse(text) as T
    } catch (error) {
      throw new HTTPError('响应解析失败', {
        code: 'PARSE',
        response: {
          body: text,
          code: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          raw: response
        },
        cause: error
      })
    }
  }

  /**
   * 将原始字节数组按指定响应类型解码
   * - arraybuffer: 返回 .buffer slice
   * - blob: 构建 Blob 对象
   * - text/json: 先 TextDecoder 解码，json 再调用 parseJSONBody
   */
  private decodeBytes<T>(
    bytes: Uint8Array,
    response: Response,
    responseType: RequestConfig['responseType']
  ): T {
    const resolvedType = responseType || 'json'

    if (resolvedType === 'arraybuffer') {
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as T
    }

    if (resolvedType === 'blob') {
      return new Blob([bytes as BlobPart]) as T
    }

    const text = new TextDecoder().decode(bytes)
    if (resolvedType === 'text') {
      return text as T
    }

    return this.parseJSONBody<T>(text, response)
  }

  /**
   * 从 Response 中按指定类型直接解析数据（非流式路径）
   * - text: response.text()
   * - blob: response.blob()
   * - arraybuffer: response.arrayBuffer()
   * - json（默认）: 先 text() 再 JSON.parse
   */
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
    return this.parseJSONBody<T>(text, response)
  }

  abort(): void {
    for (const controller of this.controllers) {
      controller.abort()
    }
    this.controllers.clear()
  }
}
