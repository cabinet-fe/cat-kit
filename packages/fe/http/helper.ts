import { getDataType, isArray, isObj, oneOf } from '@cat-kit/common'
import type { HTTPCodeNumber } from './shared'
import type { RequestConfig } from './type'

let errMsgsMap: Record<number, any> = {
  408: '请求超时',
  500: '服务器错误'
}

function parseResponseHeaders(headStr: string) {
  const trimHeadStr = headStr.trim()
  if (!trimHeadStr) return {}
  return trimHeadStr.split(/[\r\n]+/).reduce(
    (acc, cur) => {
      const [key, value] = cur.split(': ')
      acc[key!] = value
      return acc
    },
    {} as Record<string, any>
  )
}

export class HttpResponse<T = any> {
  /** 请求状态码 */
  code!: HTTPCodeNumber

  /** 返回的数据 */
  data!: T

  /** 返回的信息 */
  message = ''

  /** 响应头 */
  headers: Record<string, any> = {}

  requestConf!: RequestConfig

  constructor(
    code: HTTPCodeNumber,
    data: any,
    message: string,
    requestConf: RequestConfig,
    headers?: Record<string, any>
  ) {
    this.code = code
    this.data = data
    this.message = message
    this.requestConf = requestConf
    this.headers = headers || {}
  }

  /** 是否为某个状态码 */
  is(code: HTTPCodeNumber) {
    return this.code === code
  }

  getHeaders() {
    return this.headers
  }
}

export interface ResponseConf {
  code: HTTPCodeNumber
  data: any
  message: string
  headers?: Record<string, any>
}

export function getResponse(
  conf: ResponseConf,
  reqConf: RequestConfig
): HttpResponse
export function getResponse(
  xhr: XMLHttpRequest,
  reqConf: RequestConfig
): HttpResponse
export function getResponse(
  xhr: XMLHttpRequest | ResponseConf,
  reqConf: RequestConfig
) {
  if (xhr instanceof XMLHttpRequest) {
    const { status, responseType, statusText } = xhr

    let data =
      !responseType || responseType === 'text' ? xhr.responseText : xhr.response

    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (e) {}
    }

    let code = data?.code || (status as HTTPCodeNumber)

    let message = data?.message || errMsgsMap[code] || statusText

    let headers = parseResponseHeaders(xhr.getAllResponseHeaders())
    return new HttpResponse(code, data, message, reqConf, headers)
  }
  const { code, data, message, headers } = xhr
  return new HttpResponse(code, data, message, reqConf, headers)
}

/**
 * 获取请求地址
 * @param api api
 * @param params 参数
 * @returns
 */
export function getUrl(
  api: string,
  params: Record<string, string | number> | string
) {
  let paramString =
    typeof params === 'string'
      ? params
      : Object.keys(params)
          .filter(key => params[key] || params[key] === 0)
          .map(key => `${key}=${params[key]}`)
          .join('&')

  if (!paramString) return api

  if (api.includes('?') && !api.endsWith('?')) {
    return api + '&' + paramString
  }
  return api + '?' + paramString
}

/**
 * 转化data
 * @param data
 * @param headers
 * @returns
 */
export function transformData(data: any, headers: Record<string, any>) {
  if (data === undefined || data === null) {
    return data
  }

  if (ArrayBuffer.isView(data)) {
    return data.buffer
  }
  if (isObj(data) || isArray(data)) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
    return JSON.stringify(data)
  }
  if (data instanceof URLSearchParams) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
    return data.toString()
  }
  // 如果是FormData让浏览器决定其Content-Type
  // TODO 这里的流判断实现后面放到data-type中去实现
  if (
    oneOf(getDataType(data), ['blob', 'formdata', 'file', 'arraybuffer']) ||
    data.pipe instanceof Function
  ) {
    delete headers['Content-Type']
    return data
  }
  return data
}
