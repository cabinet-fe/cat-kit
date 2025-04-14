export abstract class HttpEngine {
  abstract request(url: string, options?: RequestInit): Promise<Response>

  abstract abort(): void
}
