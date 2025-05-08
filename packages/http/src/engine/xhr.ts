import { HttpEngine } from './engine'
import type { RequestOptions, HTTPResponse } from '../types'
import { getDataType } from '@cat-kit/core'

export class XHREngine extends HttpEngine {
  /** 请求中的实例 */
  private xhrSets = new Set<XMLHttpRequest>()

  request<T = any>(
    url: string,
    options: RequestOptions
  ): Promise<HTTPResponse<T>> {
    return new Promise<HTTPResponse<T>>((resolve, reject) => {
      const { method = 'GET', timeout = 0 } = options

      const xhr = new XMLHttpRequest()

      // 将 XHR 实例添加到集合中，以便可以中止请求
      this.xhrSets.add(xhr)

      if (method === 'GET') {
        url = this.buildURL(url, options)
      }

      xhr.timeout = timeout
      xhr.responseType = 'json'

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response: HTTPResponse<T> = {
            data: xhr.response as T,
            code: xhr.status,
            headers: this.parseHeaders(xhr.getAllResponseHeaders())
          }
          resolve(response)
        } else {
          reject(new Error(`请求失败，状态码: ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error('网络错误'))
      }

      xhr.onabort = () => {
        reject(new Error('请求被中止'))
      }

      xhr.ontimeout = () => {
        reject(new Error('请求超时'))
      }

      xhr.open(method, url, true)

      this.sendHeaders(xhr, options)

      // 从集合中移除已完成的请求
      xhr.onloadend = () => {
        this.xhrSets.delete(xhr)
      }

      if (method === 'GET' || method === 'HEAD') {
        xhr.send(null)
      } else {
        const { body } = options
        if (body) {
          if (getDataType(body) === 'object' || getDataType(body) === 'array') {
            xhr.setRequestHeader('Content-Type', 'application/json')
            xhr.send(JSON.stringify(body))
          } else {
            xhr.send(body as any)
          }
        } else {
          xhr.send(null)
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

  sendHeaders(xhr: XMLHttpRequest, options: RequestOptions): void {
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
