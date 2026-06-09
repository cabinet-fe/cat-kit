import type { RequestConfig, HTTPResponse, ProgressInfo } from '../types'
import { HTTPError } from '../types'
import { HttpEngine } from './engine'
import { buildRequestBody, inferResponseType } from './shared'

/**
 * 从 XHR ProgressEvent 构建标准的 ProgressInfo
 * - total 不可靠时设为 0，percent 也返回 0
 */
function buildXHRProgressInfo(
  loaded: number,
  lengthComputable: boolean,
  totalRaw: number
): ProgressInfo {
  const total = lengthComputable ? totalRaw : 0
  const percent = total > 0 ? Math.min(100, Math.max(0, Math.floor((loaded / total) * 100))) : 0
  return { loaded, total, percent }
}

export class XHREngine extends HttpEngine {
  /** 请求中的实例 */
  private xhrSets = new Set<XMLHttpRequest>()

  request<T = any>(url: string, config: RequestConfig = {}): Promise<HTTPResponse<T>> {
    return new Promise<HTTPResponse<T>>((resolve, reject) => {
      if (config.signal?.aborted) {
        reject(new HTTPError('请求被中止', { code: 'ABORTED', url, config }))
        return
      }

      const { method = 'GET', timeout = 0, responseType, credentials = true } = config

      const xhr = new XMLHttpRequest()
      const headers = { ...config.headers }
      const requestBody = buildRequestBody(method, config.body, headers)

      this.xhrSets.add(xhr)

      const onSignalAbort = (): void => {
        xhr.abort()
      }

      if (config.signal) {
        config.signal.addEventListener('abort', onSignalAbort)
      }

      xhr.timeout = timeout
      xhr.responseType = (responseType || 'arraybuffer') as XMLHttpRequestResponseType
      xhr.withCredentials = credentials

      if (config.onUploadProgress && xhr.upload) {
        xhr.upload.onprogress = (e: ProgressEvent) => {
          config.onUploadProgress!(buildXHRProgressInfo(e.loaded, e.lengthComputable, e.total))
        }
      }

      if (config.onDownloadProgress) {
        xhr.onprogress = (e: ProgressEvent) => {
          if (e.lengthComputable || e.loaded > 0) {
            config.onDownloadProgress!(buildXHRProgressInfo(e.loaded, e.lengthComputable, e.total))
          }
        }
      }

      xhr.onload = () => {
        const parsedHeaders = this.parseHeaders(xhr.getAllResponseHeaders())
        const contentType = parsedHeaders['content-type']
        const inferredType = responseType || inferResponseType(contentType || null)

        let body: T
        if (!responseType) {
          const buffer = xhr.response as ArrayBuffer
          if (buffer instanceof ArrayBuffer) {
            if (inferredType === 'json') {
              const text = new TextDecoder().decode(buffer)
              body = text ? (JSON.parse(text) as T) : (null as T)
            } else if (inferredType === 'text') {
              body = new TextDecoder().decode(buffer) as T
            } else if (inferredType === 'blob') {
              body = new Blob([buffer]) as T
            } else {
              body = buffer as T
            }
          } else {
            body = xhr.response as T
          }
        } else {
          body = xhr.response as T
        }

        const response: HTTPResponse<T> = {
          body,
          code: xhr.status,
          headers: parsedHeaders,
          raw: xhr
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response)
        } else {
          reject(
            new HTTPError(`请求失败，状态码: ${xhr.status}`, {
              code: 'NETWORK',
              url,
              config,
              response
            })
          )
        }
      }

      xhr.onerror = () => {
        reject(new HTTPError('网络错误', { code: 'NETWORK', url, config }))
      }

      xhr.onabort = () => {
        reject(new HTTPError('请求被中止', { code: 'ABORTED', url, config }))
      }

      xhr.ontimeout = () => {
        reject(new HTTPError('请求超时', { code: 'TIMEOUT', url, config }))
      }

      xhr.open(method, url, true)

      this.sendHeaders(xhr, headers)

      xhr.onloadend = () => {
        if (config.signal) {
          config.signal.removeEventListener('abort', onSignalAbort)
        }
        this.xhrSets.delete(xhr)
      }

      if (method === 'GET' || method === 'HEAD') {
        xhr.send(null)
      } else {
        if (requestBody === null) {
          xhr.send(null)
        } else {
          xhr.send(requestBody as any)
        }
      }
    })
  }

  /**
   * 解析响应头
   * @param headerStr 响应头字符串
   * @returns 解析后的响应头对象（同名多值以逗号+空格合并；set-cookie 以换行分隔）
   */
  private parseHeaders(headerStr: string): Record<string, string> {
    const headers: Record<string, string> = {}
    if (!headerStr) {
      return headers
    }

    const headerPairs = headerStr.trim().split('\r\n')
    for (const headerPair of headerPairs) {
      const index = headerPair.indexOf(': ')
      if (index > 0) {
        const key = headerPair.substring(0, index).toLowerCase()
        const val = headerPair.substring(index + 2)
        const existing = headers[key]
        if (existing === undefined) {
          headers[key] = val
        } else if (key === 'set-cookie') {
          headers[key] = `${existing}\n${val}`
        } else {
          headers[key] = `${existing}, ${val}`
        }
      }
    }
    return headers
  }

  /** 将 headers 设置到 XMLHttpRequest 实例 */
  sendHeaders(xhr: XMLHttpRequest, headers: Record<string, string>): void {
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })
  }

  abort(): void {
    for (const xhr of this.xhrSets) {
      xhr.abort()
    }
    this.xhrSets.clear()
  }
}
