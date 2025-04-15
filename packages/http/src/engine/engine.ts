export abstract class HttpEngine {
  /**
   * 发送 HTTP 请求
   * @param url 请求 URL
   * @param options 请求选项
   */
  abstract request(url: string, options?: RequestInit): Promise<Response>

  /**
   * 中止 HTTP 请求
   */
  abstract abort(): void
}
