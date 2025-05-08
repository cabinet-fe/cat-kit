import type { HttpEngine } from './engine/engine'
import { FetchEngine } from './engine/fetch'
import { XHREngine } from './engine/xhr'
import { TokenPlugin } from './plugins/token'
import type {
  ClientConfig,
  HTTPResponse,
  RequestMethod,
  RequestOptions
} from './types'
import { $str, isInBrowser } from '@cat-kit/core'

/**
 * HTTP 请求客户端
 *
 * 提供了一个符合人体工学的，跨端(node 和浏览器)的 HTTP 请求客户端。
 * 支持插件系统，可以灵活地组合和增强请求客户端。
 *
 * @example
 * ```ts
 * import { HTTPClient } from '@cat-kit/http'
 *
 * const http = new HTTPClient({
 *   origin: 'http://localhost:8080',
 *   timeout: 30 * 1000
 * })
 *
 * // 发起请求
 * http.request('/api', { method: 'get' }).then(res => {
 *   // ...do some things
 * })
 *
 * // 请求别名
 * http.get('/api', { params: { name: 'Zhang San' } }).then(res => {
 *   // ...do some things
 * })
 * ```
 */
export class HTTPClient {
  /** 客户端配置 */
  private config: ClientConfig

  /** 请求引擎 */
  engine: HttpEngine

  /**
   * 活跃的请求组
   * 用于跟踪当前正在进行的请求，可以通过 group 方法创建分组
   */
  private activeRequests: Set<HTTPClient> = new Set()

  /**
   * 创建 HTTP 客户端实例
   * @param config 客户端配置
   */
  constructor(config?: ClientConfig) {
    this.config = config || {}

    // 自动选择
    if (isInBrowser()) {
      this.engine =
        typeof window.fetch === 'function'
          ? new FetchEngine(this.config)
          : new XHREngine(this.config)
    } else {
      this.engine = new FetchEngine(this.config)
    }
  }

  /**
   * 发送 HTTP 请求
   * @param url 请求地址
   * @param options 请求选项
   * @returns Promise<HTTPResponse>
   */
  request<T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, options)
  }

  /**
   * 发送 GET 请求
   * @param url 请求地址
   * @param options 请求选项
   * @returns Promise<HTTPResponse>
   */
  get<T = any>(
    url: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'GET',
      ...options
    })
  }

  /**
   * 发送 POST 请求
   * @param url 请求地址
   * @param body 请求体
   * @param options 请求选项
   * @returns Promise<HTTPResponse>
   */
  post<T = any>(
    url: string,
    body?: RequestOptions['body'],
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'POST',
      body,
      ...options
    })
  }

  /**
   * 发送 PUT 请求
   * @param url 请求地址
   * @param body 请求体
   * @param options 请求选项
   * @returns Promise<HTTPResponse>
   */
  put<T = any>(
    url: string,
    body?: RequestOptions['body'],
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'PUT',
      body,
      ...options
    })
  }

  /**
   * 发送 DELETE 请求
   * @param url 请求地址
   * @param options 请求选项
   * @returns Promise<HTTPResponse>
   */
  delete<T = any>(
    url: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'DELETE',
      ...options
    })
  }

  /**
   * 发送 PATCH 请求
   * @param url 请求地址
   * @param body 请求体
   * @param options 请求选项
   * @returns Promise<HTTPResponse>
   */
  patch<T = any>(
    url: string,
    body?: RequestOptions['body'],
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'PATCH',
      body,
      ...options
    })
  }

  /**
   * 发送 HEAD 请求
   * @param url 请求地址
   * @param options 请求选项
   * @returns Promise<HTTPResponse>
   */
  head<T = any>(
    url: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'HEAD',
      ...options
    })
  }

  /**
   * 发送 OPTIONS 请求
   * @param url 请求地址
   * @param options 请求选项
   * @returns Promise<HTTPResponse>
   */
  options<T = any>(
    url: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'OPTIONS',
      ...options
    })
  }

  /**
   * 中止所有请求
   */
  abort(): void {
    // 中止当前引擎的所有请求
    this.engine.abort()

    // 中止所有活跃的请求组
    for (const group of this.activeRequests) {
      group.abort()
    }

    this.activeRequests.clear()
  }

  /**
   * 创建请求分组
   * @param prefix 分组前缀
   * @returns HTTPClient 新的客户端实例
   *
   * @example
   * ```ts
   * const http = new HTTPClient()
   * const userGroup = http.group('/user')
   *
   * // 等同于 http.get('/user/profile')
   * userGroup.get('/profile')
   *
   * // 中止分组中的所有请求
   * userGroup.abort()
   * ```
   */
  group(prefix: string): HTTPClient {
    const group = new HTTPClient({
      ...this.config,
      base: $str.joinUrlPath(this.config.base || '', prefix)
    })

    // 将新创建的分组添加到活跃请求组中
    this.activeRequests.add(group)

    return group
  }
}
