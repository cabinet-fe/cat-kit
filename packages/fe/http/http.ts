import {
  type ResponseConf,
  getResponse,
  getUrl,
  transformData,
  type HttpResponse
} from './helper'
import type {
  AliasRequestConfig,
  HTTPAfterHandler,
  HTTPBeforeHandler,
  HTTPMethod,
  HttpOptions,
  MergedConfig,
  RequestConfig,
  ResponseReturnType
} from './type'
import path from '../path/path'

export class Http {
  before: null | HTTPBeforeHandler = null
  after: null | HTTPAfterHandler = null

  private defaultConfig = {
    headers: {} as Record<string, string>,
    baseUrl: '',
    timeout: 0,
    method: 'GET' as HTTPMethod,
    withCredentials: false
  }

  constructor(options: HttpOptions = {}) {
    const { before, after, ...restOptions } = options

    if (before) {
      this.before = before
    }
    if (after) {
      this.after = after
    }

    const { defaultConfig } = this

    for (const key in restOptions) {
      let value = restOptions[key]
      if (value !== undefined) {
        defaultConfig[key] = value
      }
    }
  }

  /** 获取默认配置 */
  getDefaultConfig() {
    return this.defaultConfig
  }

  /** 所有的请求 */
  requests: Set<Requestor> = new Set()

  /** 停止当前正在进行的所有请求 */
  abort(filter?: (request: Requestor) => boolean) {
    const { requests } = this
    const iRequests = requests.values()
    if (filter) {
      while (requests.size) {
        const req = iRequests.next().value
        filter(req) && req.abort()
        requests.delete(req)
      }
      return
    }
    while (requests.size) {
      const req = iRequests.next().value
      req.abort()
      requests.delete(req)
    }
  }

  /**
   * 合并默认配置和请求配置
   * @param conf 请求配置
   * @returns
   */
  private mergeConfig(conf: RequestConfig): MergedConfig {
    const headers = {
      ...this.defaultConfig.headers,
      ...conf.headers
    }

    const result: MergedConfig = {
      url: conf.url,
      ...this.defaultConfig
    }

    for (const key in conf) {
      if (conf[key] !== undefined) {
        result[key] = conf[key]
      }
    }

    result.headers = headers

    return result
  }

  /** 发起一个请求 */
  request<T>(conf: RequestConfig) {
    return new Promise<HttpResponse<T>>((resolve, reject) => {
      const { requests } = this

      const req = new Requestor({
        client: this,
        config: this.mergeConfig(conf),
        onSuccess(value) {
          resolve(value)
          requests.delete(req)
        },
        onError(value) {
          reject(value)
          requests.delete(req)
        }
      })

      this.requests.add(req)
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
}

interface RequestorOptions {
  /** Http实例 */
  client: Http
  /** 经过合并的配置参数 */
  config: MergedConfig
  /** 请求成功 */
  onSuccess: (value: any) => void
  /** 请求失败 */
  onError: (reason?: any) => void
}

class Requestor {
  private xhr: XMLHttpRequest | null = null

  private options!: RequestorOptions

  private url!: string

  private body?: Document | XMLHttpRequestBodyInit | null

  /** 响应类型, normal普通响应, error错误响应 */
  private replyType: ResponseReturnType = 'normal'

  readyState = 0

  constructor(options: RequestorOptions) {
    this.options = options

    this.intercept()
      .then(() => {
        this.init()

        this.addEvents()

        this.connect()

        this.sendHeader()

        this.sendBody()
      })
      .catch(() => {
        this.end()
      })
  }

  /** 拦截 */
  private async intercept() {
    const { options } = this
    const { config, client } = options
    if (!client.before) return

    // 尝试拦截
    const ret = await client.before(config)
    if (ret === false) {
      return this.reply({
        code: 400,
        data: null,
        message: '请求被拦截'
      })
    }
    options.config = ret
  }

  /** 初始化 */
  private async init() {
    const { config } = this.options

    const xhr = new XMLHttpRequest()
    this.xhr = xhr

    const {
      url,
      baseUrl,
      params = '',
      timeout,
      withCredentials,
      responseType,
      data,
      headers
    } = config

    if (url.startsWith('http')) {
      this.url = url
    } else {
      this.url = getUrl(path.join(baseUrl, url), params)
    }

    this.body = transformData(data, headers)

    xhr.timeout = timeout
    xhr.withCredentials = withCredentials
    if (responseType !== undefined) {
      xhr.responseType = responseType
    }
  }

  /**
   * 响应回复
   * @param conf 响应内容配置
   */
  private reply(conf: ResponseConf): void
  /**
   * 响应回复
   * @param conf 响应内容配置
   */
  private reply(xhr: XMLHttpRequest): void
  private reply(conf: any) {
    let response = getResponse(conf)

    if (response.code >= 400 && response.code <= 600) {
      this.replyType = 'error'
    }

    const { onError, onSuccess, client, config } = this.options

    const after = config.after || client.after
    // 公用
    if (after) {
      const setReplyType = (type: ResponseReturnType) => {
        this.replyType = type
      }
      response = after(response, setReplyType, this.replyType) || response
    }

    if (this.replyType === 'normal') {
      onSuccess(response)
    } else {
      onError(response)
    }
  }

  /** 结束当前请求 */
  private end() {
    this.xhr = null
  }

  /** 添加事件 */
  private addEvents() {
    const { xhr } = this
    if (!xhr) return
    const { onProgress, onUploadProgress } = this.options.config

    // 正常事件
    if (onProgress) {
      xhr.onprogress = onProgress
    }
    if (onUploadProgress) {
      xhr.upload.onprogress = onUploadProgress
    }

    xhr.onloadend = () => {
      xhr && this.reply(xhr)
    }

    xhr.onreadystatechange = () => {
      if (!xhr) return
      this.readyState = xhr.readyState
    }

    // 错误事件
    xhr.ontimeout = ev => {
      this.reply({ code: 408, data: null, message: '请求超时' })
      this.end()
    }
    xhr.onabort = ev => {
      this.reply({ code: 400, data: null, message: '请求已终止' })
      this.end()
    }
    xhr.onerror = () => {
      this.reply(xhr)
      this.end()
    }
  }

  /** 连接 */
  private connect() {
    this.xhr?.open(this.options.config.method, this.url, true)
  }

  /** 发送头 */
  private sendHeader() {
    const { options, xhr, body } = this
    if (!xhr) return
    const { headers } = options.config
    // body为空时移除content-type
    for (const key in headers) {
      let shouldDelete =
        (body === undefined || body === null) &&
        key.toLowerCase() === 'content-type'

      if (shouldDelete) {
        delete headers[key]
      } else {
        xhr.setRequestHeader(key, headers[key] ?? '')
      }
    }
  }

  /** 发送数据 */
  private sendBody() {
    this.xhr?.send(this.body)
  }

  abort() {
    this.xhr?.abort()
  }
}
