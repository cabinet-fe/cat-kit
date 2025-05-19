import type { HttpEngine } from './engine/engine'
import { FetchEngine } from './engine/fetch'
import { XHREngine } from './engine/xhr'
import type {
  ClientConfig,
  RequestConfig,
  HTTPResponse,
  AliasRequestConfig
} from './types'
import { $str, isInBrowser, o } from '@cat-kit/core'

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
 * const http = new HTTPClient('/api', {
 *   origin: 'http://localhost:8080',
 *   timeout: 30 * 1000
 * })
 *
 * // 发起请求
 * http.request('/user', { method: 'get' }).then(res => {
 *   // ...do some things
 * })
 *
 * // 请求别名
 * http.get('/user', { params: { name: 'Zhang San' } }).then(res => {
 *   // ...do some things
 * })
 * ```
 */

export class HTTPClient {
  /** 请求前缀 */
  private prefix: string

  /** 客户端配置 */
  private config: ClientConfig

  /** 请求引擎 */
  private engine: HttpEngine

  /**
   * 活跃的请求组
   * 用于跟踪当前正在进行的请求，可以通过 group 方法创建分组
   */
  private activeRequests: Set<HTTPClient> = new Set()

  /**
   * 创建 HTTP 客户端实例
   * @param prefix 请求前缀
   * @param config 客户端配置
   */
  constructor(prefix: string, config?: ClientConfig) {
    this.prefix = prefix
    this.config = config || {}

    if (!isInBrowser()) {
      throw new Error('HTTPClient不支持在非浏览器环境下使用')
    }
    this.engine =
      typeof window.fetch === 'undefined' ? new XHREngine() : new FetchEngine()
  }

  private getRequestUrl(url: string, config: RequestConfig): string {
    url = decodeURIComponent(url)

    if (URL.parse(url)) {
    }

    url = $str.joinUrlPath(this.prefix, url)
    // GET请求要将查询参数拼接到url上
    if (config.method === 'GET') {
      url = $str.joinUrlPath(url, $str.getQueryString(url))
      config.query = undefined
    }

    return url
  }

  /**
   * 获取请求配置
   * @param config 当前请求配置
   * @returns 合并后的请求配置
   */
  private getRequestConfig(config: RequestConfig): RequestConfig {
    return {
      headers: Object.assign({}, this.config.headers, config.headers),
      ...o(this.config).omit(['headers']),
      ...o(config).omit(['headers'])
    }
  }

  /**
   * 发送 HTTP 请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns Promise<HTTPResponse>
   */
  request<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(
      this.getRequestUrl(url, config),
      this.getRequestConfig(config)
    )
  }

  /**
   * 发送 GET 请求
   * @param url 请求地址
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  get<T>(
    url: string,
    config: AliasRequestConfig = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'GET',
      ...config
    })
  }

  /**
   * 发送 POST 请求
   * @param url 请求地址
   * @param body 请求体
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  post<T = any>(
    url: string,
    body?: RequestConfig['body'],
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'POST',
      body,
      ...config
    })
  }

  /**
   * 发送 PUT 请求
   * @param url 请求地址
   * @param body 请求体
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  put<T = any>(
    url: string,
    body?: RequestConfig['body'],
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'PUT',
      body,
      ...config
    })
  }

  /**
   * 发送 DELETE 请求
   * @param url 请求地址
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  delete<T = any>(
    url: string,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'DELETE',
      ...config
    })
  }

  /**
   * 发送 PATCH 请求
   * @param url 请求地址
   * @param body 请求体
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  patch<T = any>(
    url: string,
    body?: RequestConfig['body'],
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'PATCH',
      body,
      ...config
    })
  }

  /**
   * 发送 HEAD 请求
   * @param url 请求地址
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  head<T = any>(
    url: string,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'HEAD',
      ...config
    })
  }

  /**
   * 发送 options 请求
   * @param url 请求地址
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  options<T = any>(
    url: string,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.engine.request<T>(url, {
      method: 'OPTIONS',
      ...config
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
    const group = new HTTPClient(
      $str.joinUrlPath(this.prefix, prefix),
      this.config
    )

    // 将新创建的分组添加到活跃请求组中
    this.activeRequests.add(group)

    return group
  }
}

const c = new HTTPClient('http://localhost/aaa/bbb', {
  origin: ''
})
