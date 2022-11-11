import type { HttpResponse } from './helper'

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

export interface RequestConfig {
  url: string
  baseUrl?: string
  method?: HTTPMethod
  headers?: Record<string, string>
  timeout?: number
  params?: string | Record<string, any> // 和api叠加
  data?: any
  responseType?: XMLHttpRequestResponseType
  /** 是否携带cookie */
  withCredentials?: boolean
  /** 下载进度 */
  onProgress?: (e: ProgressEvent<EventTarget>) => void
  /** 上传进度 */
  onUploadProgress?: (e: ProgressEvent<EventTarget>) => void
  /** 上传后 */
  after?: HTTPAfterHandler
}

export type HTTPBeforeHandler = (
  /** 请求的配置 */
  conf: Required<RequestConfig>
) => Required<RequestConfig> | false | Promise<Required<RequestConfig> | false>

export type ResponseReturnType = 'normal' | 'error'

export type HTTPAfterHandler = (
  /** 响应值 */
  response: HttpResponse,
  /** 指定值以何种形式返回, 'normal' | 'error' */
  returnBy: (type: ResponseReturnType) => void,
  /** 当前返回值抛出的类型 */
  returnType: ResponseReturnType
) => HttpResponse

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
