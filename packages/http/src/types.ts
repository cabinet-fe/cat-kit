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
   * - 如果未指定，默认为当前页面的`location.href`。
   * - 如果 `url` 已经是一个完整的[URL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL) ，则会忽略此配置。
   */
  origin?: string

  /**
   * 请求超时时间 (单位：ms)
   * - 默认为0，即不超时
   * - 设置超时时间后，请求会在指定时间后自动终止，并抛出408错误。
   * - 除了上传下载文件，通常情况下，你的普通请求不应该很长。
   */
  timeout?: number

  /**
   * HTTP默认请求头
   * - 这里指定的是实例请求头配置。
   * - 如果在请求配置中传入了`headers`，则header会被合并，相同的header会被请求配置覆盖。
   */
  headers?: Record<string, string>

  /**
   * 控制`浏览器`是否发送凭证
   * - 默认发送，即在同源请求时发送凭证。
   * - 如果设置为`false`，则在任何请求时都不会发送凭证。
   * @default true
   */
  credentials?: boolean

  /**
   * 插件
   * - 插件是一种扩展机制，可以用于修改请求和响应。
   */
  plugins?: ClientPlugin[]
}

export interface RequestConfig {
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
  /**
   * 请求头
   * @link [查看](https://developer.mozilla.org/zh-CN/docs/Glossary/Request_header)
   */
  headers?: Record<string, string>
  /** 请求超时时间 */
  timeout?: number
  /** 请求是否携带凭证 */
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

export type AliasRequestConfig = Omit<RequestConfig, 'method'>

export interface HTTPResponse<T = any> {
  /** 响应的数据 */
  data: T
  /** HTTP状态码 */
  code: number
  /** 响应标头 */
  headers: Record<string, string>
  /** 原始响应对象 */
  raw?: Response | any
}

export type HttpErrorCode =
  | 'TIMEOUT'
  | 'ABORTED'
  | 'NETWORK'
  | 'PARSE'
  | 'UNKNOWN'

export interface HTTPErrorOptions<T = any> {
  code: HttpErrorCode
  url?: string
  config?: RequestConfig
  response?: HTTPResponse<T>
  cause?: unknown
}

export class HTTPError<T = any> extends Error {
  code: HttpErrorCode
  url?: string
  config?: RequestConfig
  response?: HTTPResponse<T>
  override cause?: unknown

  constructor(message: string, options: HTTPErrorOptions<T>) {
    super(message)
    this.name = 'HTTPError'
    this.code = options.code
    this.url = options.url
    this.config = options.config
    this.response = options.response
    this.cause = options.cause
  }
}

export interface RequestContext {
  url: string
  config: RequestConfig
}

/**
 * 插件钩子返回类型
 */
export interface PluginHookResult {
  /** 修改后的 URL */
  url?: string
  /** 修改后的请求配置 */
  config?: RequestConfig
}

/** 请求客户端插件 */
export interface ClientPlugin {
  /**
   * 请求前钩子
   * @param url 请求 URL
   * @param config 请求配置
   * @returns 修改后的 URL 和请求选项
   */
  beforeRequest?(
    url: string,
    config: RequestConfig
  ): Promise<PluginHookResult | void> | PluginHookResult | void

  /**
   * 响应后钩子
   * @param response 响应对象
   * @param url 请求 URL
   * @param config 请求配置
   * @returns 修改后的响应对象
   */
  afterRespond?(
    response: HTTPResponse,
    url: string,
    config: RequestConfig
  ): Promise<HTTPResponse | void> | HTTPResponse | void

  /**
   * 错误钩子
   * - 请求链中出现错误时触发
   * - 不返回值，仅用于记录、上报或副作用处理
   */
  onError?(
    error: unknown,
    context: RequestContext
  ): Promise<void> | void
}
