export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

/** 请求客户端配置 */
export interface ClientConfig {
  /**
   * ## 源
   * ### 由协议、主机名（域名）和端口定义。
   * - 在浏览器环境下，如果未指定，会自动从当前页面获取。
   * - 在 Node.js 环境下，必须指定。
   */
  origin?: string

  /**
   * ## 请求基础路径
   * ```ts
   * const client = new HTTPClient({
   *   base: '/api'
   * })
   *
   * client.get('/user')
   * // GET /api/user
   * ```
   */
  base?: string

  /**
   * ## 请求超时时间 (单位：ms)
   * - 设置超时时间后，请求会在指定时间后自动终止，并抛出408错误。
   * - 除了上传下载文件，通常情况下，你的普通请求不应该很长。
   */
  timeout?: number

  /**
   * ## HTTP请求头
   * - 这里指定的是实例请求头，里面的任意标头都可以在请求时被覆盖。
   */
  headers?: Record<string, string>

  /**
   * ## 控制`浏览器`是否发送凭证
   * - 默认发送，即在同源请求时发送凭证。
   * - 如果设置为`false`，则在任何请求时都不会发送凭证。
   * - Node.js 环境下，此配置无效。
   * @default true
   */
  credentials?: boolean

  /**
   * ## 插件
   */
  plugins?: ClientPlugin[]
}

export type RequestOptions = {
  /**
   * ## 请求方法, 默认`GET`
   */
  method?: RequestMethod
  /**
   * ## 请求体
   * - ReadableStream数据在不支持fetch的环境下无效
   * - JS对象会被自动转换为JSON字符串，并且
   */
  body?: BodyInit | Record<string, any>
  /** 请求头 */
  headers?: Record<string, string>
  /** 请求基础路径 */
  base?: string

  /** 请求超时时间 */
  timeout?: number
}

/** 请求客户端插件 */
export interface ClientPlugin {
  beforeRequest(): any
  afterRespond(): any
}
