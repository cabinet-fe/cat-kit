import type { HTTPResponse, RequestOptions } from '../types'
import { obj2query, $str } from '@cat-kit/core'

export abstract class HttpEngine {
  /**
   * 发送 HTTP 请求
   * @param url 请求 URL
   * @param options 请求选项
   */
  abstract request(url: string, options?: RequestOptions): Promise<HTTPResponse>

  /**
   * 中止 HTTP 请求
   */
  abstract abort(): void

  protected buildURL(url: string, options: RequestOptions): string {
    const { query } = options

    if (query) {
      let qs = $str.getQueryString(url)
      if (qs) {
        qs = `${qs}&${obj2query(query)}`
      } else {
        qs = obj2query(query)
      }
      url = `${url}?${qs}`
    }

    return url
  }
}
