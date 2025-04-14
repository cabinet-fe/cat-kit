import type { HttpEngine } from './engine/engine'
import { FetchEngine } from './engine/fetch'
import { XHREngine } from './engine/xhr'
import type { ClientConfig } from './types'
import { isInBrowser, str } from '@cat-kit/core'

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

  request(url: string, options: RequestInit) {
    return this.engine.request(url, options)
  }

  /**
   * ## 发送 GET 请求
   * @param url 请求地址
   * @returns Promise<Response>
   */
  get(url: string, options: RequestInit = {}) {
    return this.engine.request(url, {
      method: 'GET'
    })
  }

  post(url: string, body: any, options: RequestInit = {}) {
    return this.engine.request(url, {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  put(url: string, data: any) {
    return this.engine.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
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

  abort() {
    this.engine.abort()
  }

  /** */
  group(prefix: string) {
    return new HTTPClient({
      ...this.config,
      base: str.joinUrlPath(this.config.base || '', prefix)
    })
  }
}

const http = new HTTPClient({
  origin: '',
  base: '',
  plugins: []
})

const client = http.group('/monitor/ds')

client.abort()

client.get('')
