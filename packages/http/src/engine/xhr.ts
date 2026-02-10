import type { RequestConfig, HTTPResponse } from '../types'

import { HTTPError } from '../types'
import { HttpEngine } from './engine'
import { buildRequestBody } from './shared'

export class XHREngine extends HttpEngine {
  /** 请求中的实例 */
  private xhrSets = new Set<XMLHttpRequest>()

  request<T = any>(url: string, config: RequestConfig): Promise<HTTPResponse<T>> {
    return new Promise<HTTPResponse<T>>((resolve, reject) => {
      const { method = 'GET', timeout = 0, responseType = 'json', credentials = true } = config

      const xhr = new XMLHttpRequest()
      const headers = { ...config.headers }
      const requestBody = buildRequestBody(method, config.body, headers)

      // 将 XHR 实例添加到集合中，以便可以中止请求
      this.xhrSets.add(xhr)

      xhr.timeout = timeout
      // 将 responseType 转换为 XMLHttpRequest 支持的类型
      xhr.responseType = responseType as XMLHttpRequestResponseType
      xhr.withCredentials = credentials

      xhr.onload = () => {
        const response: HTTPResponse<T> = {
          data: xhr.response as T,
          code: xhr.status,
          headers: this.parseHeaders(xhr.getAllResponseHeaders()),
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

      this.sendHeaders(xhr, { ...config, headers })

      // 从集合中移除已完成的请求
      xhr.onloadend = () => {
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
   * @returns 解析后的响应头对象
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
        const key = headerPair.substring(0, index)
        const val = headerPair.substring(index + 2)
        headers[key.toLowerCase()] = val
      }
    }
    return headers
  }

  sendHeaders(xhr: XMLHttpRequest, options: RequestConfig): void {
    const { headers, credentials } = options

    if (credentials !== false) {
      xhr.withCredentials = true
    }

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })
    }
  }

  abort(): void {
    for (const xhr of this.xhrSets) {
      xhr.abort()
    }
    this.xhrSets.clear()
  }
}
