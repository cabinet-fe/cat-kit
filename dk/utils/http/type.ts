import { HttpResponse } from "./helper"

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
  /** 请求过程 */
  onProgress?: null | ((e: ProgressEvent<XMLHttpRequestEventTarget>) => void)
}

export type HTTPBeforeHandler = (
  /** 请求的配置 */
  conf: Required<RequestConfig> ,
  /** 请求实例 */
  xhr: XMLHttpRequest
) => Required<RequestConfig> | Promise<Required<RequestConfig>>

export type HTTPAfterHandler = (
  /** 响应值 */
  response: HttpResponse,
  /** 指定值以reject形式抛出 */
  reject: () => void
) => HttpResponse


export interface HttpOptions {
  baseUrl?: string
  withCredentials?:  boolean
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