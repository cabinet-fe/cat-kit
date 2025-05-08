export type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'

/** 请求客户端配置 */
export interface ClientConfig {
  /**
   * 源
   * - 由协议、主机名（域名）和端口定义。
   * - 在浏览器环境下，如果未指定，会自动从当前页面获取。
   * - 在 Node.js 环境下，必须指定。
   */
  origin?: string

  /**
   * 请求基础路径
   * @example
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
   * 请求超时时间 (单位：ms)
   * - 设置超时时间后，请求会在指定时间后自动终止，并抛出408错误。
   * - 除了上传下载文件，通常情况下，你的普通请求不应该很长。
   */
  timeout?: number

  /**
   * HTTP请求头
   * - 这里指定的是实例请求头，里面的任意标头都可以在请求时被覆盖。
   */
  headers?: Record<string, string>

  /**
   * 控制`浏览器`是否发送凭证
   * - 默认发送，即在同源请求时发送凭证。
   * - 如果设置为`false`，则在任何请求时都不会发送凭证。
   * - Node.js 环境下，此配置无效。
   * @default true
   */
  credentials?: boolean

  /**
   * 插件
   */
  plugins?: ClientPlugin[]
}

export interface RequestOptions {
  /**
   * 请求方法
   * - 默认`GET`
   */
  method?: RequestMethod
  /**
   * 请求体
   * - ReadableStream数据在不支持fetch的环境下无效
   * - JS对象会被自动转换为JSON字符串，并且会自动设置`Content-Type`为`application/json`
   */
  body?: BodyInit | Record<string, any>
  /**
   * 查询参数
   * - 如果你在url中也指定了查询参数，那么它们会被合并。
   * - 查询参数会被自动转换为`key=value`的形式
   */
  query?: Record<string, any>
  /** 请求头 */
  headers?: Record<string, string>
  /** 请求基础路径 */
  base?: string
  /** 请求超时时间 */
  timeout?: number
  /** 请求是否携带凭证, 在浏览器环境下有效 */
  credentials?: boolean
  /**
   * 响应类型
   * - 'json': 解析为 JSON (默认)
   * - 'text': 解析为文本
   * - 'blob': 解析为 Blob
   * - 'arraybuffer': 解析为 ArrayBuffer
   * @default 'json'
   */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
}

export interface HTTPResponse<T = any> {
  /** 响应的数据 */
  data: T
  /** HTTP状态码 */
  code: number
  /** 响应标头 */
  headers: Record<string, string>
  /** 原始响应对象 (浏览器环境下为 Response，Node.js 环境下为 IncomingMessage) */
  raw?: Response | any
}

/**
 * 插件钩子返回类型
 */
export interface PluginHookResult {
  /** 修改后的 URL */
  url?: string
  /** 修改后的请求选项 */
  options?: RequestOptions
}

/** 请求客户端插件 */
export interface ClientPlugin {
  /**
   * 请求前钩子
   * @param url 请求 URL
   * @param options 请求选项
   * @returns 修改后的 URL 和请求选项
   */
  beforeRequest?(
    url: string,
    options: RequestOptions
  ): Promise<PluginHookResult | void> | PluginHookResult | void

  /**
   * 响应后钩子
   * @param response 响应对象
   * @param url 请求 URL
   * @param options 请求选项
   * @returns 修改后的响应对象
   */
  afterRespond?(
    response: HTTPResponse,
    url: string,
    options: RequestOptions
  ): Promise<HTTPResponse | void> | HTTPResponse | void
}
