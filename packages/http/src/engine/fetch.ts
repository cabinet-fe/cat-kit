import { HttpEngine } from './engine'

export class FetchEngine extends HttpEngine {
  request(url: string, options: RequestInit = {}) {
    return fetch(url, options)
  }
}
