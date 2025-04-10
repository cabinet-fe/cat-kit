import { Controller } from './controller'
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

    if (isInBrowser() && typeof fetch === 'function') {
      this.engine = new XHREngine()
    } else {
      this.engine = new FetchEngine()
    }
  }

  request(url: string, options: RequestInit) {
    return this.engine.request(url, options)
  }

  get(url: string) {
    return this.request(url, {
      method: 'GET'
    })
  }

  post(url: string, data: any) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  put(url: string, data: any) {}

  delete(url: string) {}

  patch(url: string, data: any) {}

  head(url: string) {}

  ctrl(prefix?: string) {
    return new Controller(this)
  }
}

const http = new HTTPClient({
  plugins: [

  ]
})

const controller = http.ctrl()

// 停止
controller.abort()




