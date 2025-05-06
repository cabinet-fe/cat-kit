import { HttpEngine } from './engine'
import type { RequestOptions, HTTPResponse } from '../types'

export class XHREngine extends HttpEngine {
  /** 请求中的实例 */
  private xhrSets = new Set<XMLHttpRequest>()

  request(url: string, options: RequestOptions): Promise<HTTPResponse> {
    return new Promise<HTTPResponse>((resolve, reject) => {
      const { method = 'GET', timeout = 0 } = options

      const xhr = new XMLHttpRequest()

      if (method === 'GET') {
        url = this.buildURL(url, options)
      }

      xhr.timeout = timeout
      xhr.responseType = 'arraybuffer'

      xhr.onload = () => {}
      xhr.onloadend = () => {}
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
        }
      }
      xhr.onprogress = () => {}
      xhr.upload.onprogress = () => {}
      xhr.ontimeout = () => {
        reject(new Error('timeout'))
      }

      xhr.open(method, url, true)

      this.sendHeaders(xhr, options)

      if (method === 'GET' || method === 'HEAD') {
        xhr.send(null)
      } else {
        xhr.send(JSON.stringify(options.body))
      }
    })
  }

  sendHeaders(xhr: XMLHttpRequest, options: RequestOptions): void {
    const { headers, credentials } = options

    if (credentials) {
      xhr.withCredentials = true
    }

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })
    }
  }

  abort(): void {
    while (this.xhrSets.size > 0) {
      const xhr = this.xhrSets.values().next().value
      xhr.abort()

      this.xhrSets.delete(xhr)
    }
  }
}
