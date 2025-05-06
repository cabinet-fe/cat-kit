import type { HttpEngine } from './engine/engine'
import { FetchEngine } from './engine/fetch'
import { XHREngine } from './engine/xhr'
import type { ClientConfig, RequestOptions } from './types'
import { $str, isInBrowser } from '@cat-kit/core'

export class HTTPClient {
  private config: ClientConfig

  engine: HttpEngine

  constructor(config?: ClientConfig) {
    this.config = config || {}

    if (isInBrowser()) {
      this.engine =
        typeof window.fetch === 'function' ? new FetchEngine() : new XHREngine()
    } else {
      this.engine = new FetchEngine()
    }
  }

  request(url: string, options: RequestOptions): Promise<Response> {
    return this.engine.request(url, options)
  }

  /**
   * ## 发送 GET 请求
   * @param url 请求地址
   * @returns Promise<Response>
   */
  get(url: string, options: Omit<RequestOptions, 'method'> = {}) {
    return this.engine.request(url, {
      method: 'GET',
      ...options
    })
  }

  post(
    url: string,
    body: RequestOptions['body'],
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ) {
    return this.engine.request(url, {
      method: 'POST',
      body,
      ...options
    })
  }

  put(
    url: string,
    data: RequestOptions['body'],
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ) {
    return this.engine.request(url, {
      method: 'PUT',
      body: data,
      ...options
    })
  }

  delete(url: string) {
    return this.engine.request(url, {
      method: 'DELETE'
    })
  }

  patch(url: string, data: any) {
    return this.engine.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  abort(): void {
    this.engine.abort()
  }

  /**
   * ## 创建分组
   * @param prefix 分组前缀
   * @returns HTTPClient
   */
  group(prefix: string): HTTPClient {
    return new HTTPClient({
      ...this.config,
      base: $str.joinUrlPath(this.config.base || '', prefix)
    })
  }
}
