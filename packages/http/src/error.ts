import type { HTTPResponse, RequestOptions } from './types'

/**
 * HTTP 错误类型
 */
export class HTTPError extends Error {
  /** HTTP 状态码 */
  code: number
  /** 响应数据 */
  data: any
  /** 响应头 */
  headers: Record<string, string>
  /** 请求 URL */
  url: string
  /** 请求选项 */
  options: RequestOptions

  constructor(
    message: string,
    response: HTTPResponse,
    url: string,
    options: RequestOptions
  ) {
    super(message)
    this.name = 'HTTPError'
    this.code = response.code
    this.data = response.data
    this.headers = response.headers
    this.url = url
    this.options = options
  }
}

/**
 * 超时错误类型
 */
export class TimeoutError extends Error {
  /** 请求 URL */
  url: string
  /** 请求选项 */
  options: RequestOptions
  /** 超时时间 (毫秒) */
  timeout: number

  constructor(url: string, options: RequestOptions) {
    super(`请求超时: ${url}`)
    this.name = 'TimeoutError'
    this.url = url
    this.options = options
    this.timeout = options.timeout || 0
  }
}

/**
 * 中止错误类型
 */
export class AbortError extends Error {
  /** 请求 URL */
  url: string
  /** 请求选项 */
  options: RequestOptions

  constructor(url: string, options: RequestOptions) {
    super(`请求被中止: ${url}`)
    this.name = 'AbortError'
    this.url = url
    this.options = options
  }
}
