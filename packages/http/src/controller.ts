import type { HTTPClient } from './client'

export class Controller {
   constructor(private client: HTTPClient) {}



  abort() {

  }

  request(url: string, options: RequestInit) {
    this.client.request(url, options)
  }
  
  get() {}
}
