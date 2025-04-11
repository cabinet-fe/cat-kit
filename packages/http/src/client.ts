import type { HttpEngine } from './engine/engine'
import { FetchEngine } from './engine/fetch'
import { XHREngine } from './engine/xhr'
import type { ClientConfig } from './types'
import { isInBrowser, isInNode } from '@cat-kit/core'

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

  get(url: string) {
    return this.engine.request(url, {
      method: 'GET'
    })
  }

  post(url: string, data: any) {
    return this.engine.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
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

  abort() {}

  /** */
  group(prefix: string) {
    return new HTTPClient({
      ...this.config,
      origin: this.config.origin + prefix
    })
  }
}

const http = new HTTPClient({
  origin: '',
  plugins: []
})

const client = http.group('/monitor/ds')

const service = defineService({
  async get(id: string) {
    const { data } = await client.get(id)
    return data
  }
})

service.get
