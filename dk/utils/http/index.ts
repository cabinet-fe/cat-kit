import { isUndef } from '../data/data-type'
import path from '../path/path'
import { getResponse, getUrl, type HttpResponse, transformData } from './helper'

import type {
  RequestConfig,
  HttpOptions,
  HTTPBeforeHandler,
  AliasRequestConfig,
  XHRProps,
  HTTPAfterHandler,
  ResponseReturnType
} from './type'

export * from './type'

export { type HttpResponse } from './helper'

export class Http {
  private _config = {
    headers: {} as Record<string, string>,
    baseUrl: '',
    timeout: 0,
    withCredentials: false
  }

  private before: null | HTTPBeforeHandler = null
  private after: null | HTTPAfterHandler = null

  constructor(options: HttpOptions) {
    const { before, after, timeout, baseUrl, headers, withCredentials } = options
    if (before) {
      this.before = before
    }
    if (after) {
      this.after = after
    }

    const { _config } = this

    if (baseUrl) {
      _config.baseUrl = baseUrl
    }

    if (timeout) {
      _config.timeout = timeout
    }

    if (headers) {
      _config.headers = headers
    }

    if (!isUndef(withCredentials)) {
      _config.withCredentials = withCredentials
    }
  }

  private xhrMap: Map<RequestConfig, XMLHttpRequest> = new Map()

  private deleteXhr(config: RequestConfig) {
    this.xhrMap.delete(config)
  }

  private setXHRHandlers(
    xhr: XMLHttpRequest | null,
    config: RequestConfig,
    resolve: (value: any) => void,
    reject: (value: any) => void
  ) {
    if (!xhr) return

    // 响应状态
    let returnType: ResponseReturnType = 'normal'
    let returnBy = (type: ResponseReturnType) => {
      returnType = type
    }

    let handleResponse = (response: HttpResponse) => {
      if (response.code >= 400 && response.code <= 600) {
        returnBy('error')
      }
      if (this.after) {
        response = this.after(response, returnBy, returnType) || response
      }
      if (returnType === 'normal') {
        resolve(response)
      } else {
        reject(response)
      }
      this.deleteXhr(config)
    }

    let onloadend = () => {
      if (!xhr) return
      handleResponse(getResponse(xhr))

      xhr = null
    }

    if (xhr.onloadend !== undefined) {
      xhr.onloadend = onloadend
    } else {
      xhr.onreadystatechange = () => {
        if (!xhr) return

        if (xhr.readyState !== XMLHttpRequest.DONE) return
        // onreadystatechange处理器在err和timeout处理器之前触发, 所以得在setTimeout中执行
        setTimeout(onloadend)
      }
    }

    xhr.onabort = () => {
      if (!xhr) return

      handleResponse(
        getResponse({
          code: 400,
          data: null,
          message: '请求被客户端终止'
        })
      )

      xhr = null
    }

    xhr.onerror = err => {
      if (!xhr) return

      handleResponse(getResponse(xhr))
      xhr = null
    }
    xhr.onload = () => {}

    // 上传下载进度事件
    xhr.onprogress = e => {
      config.onProgress?.(e)
    }
    // 上传进度
    xhr.upload.onprogress = e => {
      config.onUploadProgress?.(e)
    }

    xhr.ontimeout = err => {
      if (!xhr) return

      handleResponse(
        getResponse({
          code: 408,
          data: null,
          message: '请求超时'
        })
      )
      xhr = null
    }
  }

  private setXHRProps(xhr: XMLHttpRequest, config: XHRProps) {
    const { responseType, timeout, withCredentials } = config
    if (!isUndef(responseType)) {
      xhr.responseType = responseType
    }
    xhr.timeout = timeout
    xhr.withCredentials = withCredentials
  }

  /**
   * 标准请求方法
   * @param config 请求选项
   */
  request<T = any>(requestConf: RequestConfig) {
    return new Promise<HttpResponse<T>>(async (resolve, reject) => {
      let config = this.mergeConfig(requestConf)
      // 这里的data已经被被转换
      if (this.before) {
        let ret = await this.before(config as Required<RequestConfig>)
        if (ret === false) return
        config = ret
      }

      const xhr = new XMLHttpRequest()
      this.xhrMap.set(config, xhr)

      this.setXHRProps(xhr, config)
      this.setXHRHandlers(xhr, config, resolve, reject)

      const { method, url, params, headers, baseUrl } = config
      const data = transformData(config.data, headers)

      xhr.open(method, url.startsWith('http') ? url : getUrl(path.join(baseUrl, url), params), true)

      // 发送请求头
      for (const key in headers) {
        if (data === undefined && key.toLowerCase() === 'content-type') {
          delete headers[key]
        } else {
          xhr.setRequestHeader(key, headers[key])
        }
      }

      xhr.send(data)
    })
  }

  /**
   * 用于获取资源
   * @param url 请求地址
   * @param options 请求选项
   */
  get<T = any>(url: string, options?: AliasRequestConfig) {
    return this.request<T>({
      method: 'GET',
      url,
      ...options
    })
  }

  /**
   * 用于请求并在服务器新增资源
   * @param url 请求地址
   * @param data 请求主体
   * @param options 请求选项
   */
  post<T = any>(url: string, data?: any, options?: AliasRequestConfig) {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...options
    })
  }

  /**
   * 请求资源的头部信息, 一个使用场景在于获取一个资源的Content-Length再决定是否下载
   * @param url 请求地址
   * @param options 请求选项
   */
  head<T>(url: string, options?: AliasRequestConfig) {
    return this.request<T>({
      url,
      ...options,
      method: 'HEAD'
    })
  }

  /**
   * 用于对资源进行覆盖更新
   * @param url 请求url
   * @param data 请求主体
   * @param options 请求选项
   */
  put<T>(url: string, data?: any, options?: AliasRequestConfig) {
    return this.request<T>({
      url,
      data,
      method: 'PUT',
      ...options
    })
  }

  /**
   * 用于对资源进行删除
   * @param url 请求url
   * @param data 请求数据
   * @param options 请求选项
   */
  delete<T>(url: string, data?: any, options?: AliasRequestConfig) {
    return this.request<T>({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }

  /**
   * 用于对资源进行部分修改
   * @param url 请求url
   * @param data 携带的请求数据
   * @param options 请求选项
   */
  patch<T>(url: string, data?: any, options?: AliasRequestConfig) {
    return this.request<T>({
      url,
      method: 'PATCH',
      data,
      ...options
    })
  }

  /**
   * 终止请求, 你可以传入终止条件来过滤哪些请求应该被终止
   * @param matcher 终止当前请求的条件
   * @returns
   */
  abort(matcher?: (config: RequestConfig) => boolean) {
    if (!matcher) {
      return this.xhrMap.forEach(xhr => xhr.abort())
    }
    this.xhrMap.forEach((xhr, conf) => {
      if (matcher(conf)) {
        xhr.abort()
      }
    })
  }

  /**
   * 融合请求参数和默认参数
   * @param options 请求参数
   */
  private mergeConfig(options: RequestConfig) {
    const { _config } = this

    // 合并请求头
    let headers = {
      ..._config.headers,
      ...options.headers
    }

    return {
      url: options.url,
      method: options.method || 'GET',
      baseUrl: options.baseUrl || _config.baseUrl,
      data: options.data,
      headers,
      withCredentials: options.withCredentials ?? _config.withCredentials,
      params: options.params ?? '',
      timeout: options.timeout ?? _config.timeout,
      onProgress: options.onProgress ?? undefined,
      onUploadProgress: options.onUploadProgress ?? undefined,
      responseType: options.responseType ?? undefined
    }
  }

  /**
   * 获取默认参数配置
   */
  getDefaultConfig() {
    return this._config
  }

  /** 获取当前正在上传的xhr请求 */
  getRequestList() {
    let ret: Array<{
      conf: RequestConfig
      xhr: XMLHttpRequest
    }> = []

    this.xhrMap.forEach((xhr, conf) => {
      ret.push({
        conf,
        xhr
      })
    })

    return ret
  }
}
