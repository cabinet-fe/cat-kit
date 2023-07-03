import type { HttpResponse } from './helper'

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

export type ReadyState =
  | 'UNSENT'
  | 'OPENED'
  | 'HEADERS_RECEIVED'
  | 'LOADING'
  | 'DONE'


export interface RequestConfig {
  url: string

  /** 基础路径, 或者叫作路径前缀 */
  baseUrl?: string
  /** 请求头 */
  headers?: Record<string, string>
  /** 请求超时时间 */
  timeout?: number
  /** 是否携带凭证 */
  withCredentials?: boolean
  /** 请求方法 */
  method?: HTTPMethod
  /** 请求参数 */
  params?: string | Record<string, any> // 和api叠加
  data?: any
  responseType?: XMLHttpRequestResponseType

  /** 下载进度 */
  onProgress?: (e: ProgressEvent<EventTarget>) => void
  /** 上传进度 */
  onUploadProgress?: (e: ProgressEvent<EventTarget>) => void
  /** 上传后 */
  after?: HTTPAfterHandler
}

export interface MergedConfig extends RequestConfig {
  /** 基础路径, 或者叫作路径前缀 */
  baseUrl: string
  /** 请求头 */
  headers: Record<string, string>
  /** 请求超时时间 */
  timeout: number
  /** 是否携带凭证 */
  withCredentials: boolean
  /** 请求方法 */
  method: HTTPMethod
}

export type HTTPBeforeHandler = (
  /** 请求的配置 */
  conf: MergedConfig
) => MergedConfig | false | Promise<MergedConfig | false>

export type ResponseReturnType = 'normal' | 'error'

export type HTTPAfterHandler = (
  /** 响应值 */
  response: HttpResponse,
  /** 指定值以何种形式返回, 'normal' | 'error' */
  returnBy: (type: ResponseReturnType) => void,
  /** 当前返回值抛出的类型 */
  returnType: ResponseReturnType
) => HttpResponse | void | undefined

export interface HttpOptions {
  baseUrl?: string
  withCredentials?: boolean
  timeout?: number
  headers?: Record<string, string>
  before?: HTTPBeforeHandler
  after?: HTTPAfterHandler
}

export type AliasRequestConfig = Omit<RequestConfig, 'url' | 'method' | 'data'>

export type XHRProps = {
  responseType?: XMLHttpRequestResponseType
  timeout: number
  withCredentials: boolean
}
