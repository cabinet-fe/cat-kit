export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

/** 请求客户端配置 */
export interface ClientConfig {
  origin?: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  plugins?: any[]
}

export type RequestOptions = {
  /** 请求方法, 默认get */
  method?: RequestMethod
  /** 请求体 */
  body?: any
  /** 请求头 */
  headers?: Record<string, string>

  /** 请求超时时间 */
  timeout?: number
}

/** 请求客户端插件 */
export interface ClientPlugin {
  beforeRequest(): any
  afterRespond(): any
}
