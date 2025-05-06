import { HttpEngine } from './engine'
import type { HTTPResponse, RequestOptions } from '../types'

export class FetchEngine extends HttpEngine {
  private ctrl: AbortController

  constructor() {
    super()
    this.ctrl = new AbortController()
  }

  async request(url: string, options: RequestOptions): Promise<HTTPResponse> {
    const { body, ...rest } = options
    const response = await fetch(url, {
      signal: this.ctrl.signal,
      ...rest
    })

    return {
      data: await response.json(),
      code: response.status,
      headers: Object.fromEntries(response.headers.entries())
    }
  }

  abort(): void {
    this.ctrl.abort()
  }
}
