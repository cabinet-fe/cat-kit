import { HttpEngine } from './engine'

export class FetchEngine extends HttpEngine {
  private ctrl: AbortController

  constructor() {
    super()
    this.ctrl = new AbortController()
  }

  request(url: string, options: RequestInit = {}) {
    return fetch(url, {
      signal: this.ctrl.signal
    })
  }

  abort() {
    this.ctrl.abort()
  }
}
