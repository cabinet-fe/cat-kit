import { HttpEngine } from './engine'

export class XHREngine extends HttpEngine {
  private xhr: XMLHttpRequest

  request(url: string, options: RequestInit = {}) {
    return new Promise<any>((resolve, reject) => {
      const { method = 'GET' } = options
      const xhr = new XMLHttpRequest()
      xhr.open(method, url)

      xhr.timeout = 30000
      xhr.responseType = 'arraybuffer'

      xhr.onload = () => {}

      xhr.send()
    })
  }

  abort() {
    this.xhr.abort()
  }
}
