import { $str } from '@cat-kit/core'

import type { HttpEngine } from './engine/engine'
import type {
  ClientConfig,
  RequestConfig,
  HTTPResponse,
  AliasRequestConfig,
  RequestContext
} from './types'

import { FetchEngine } from './engine/fetch'
import { XHREngine } from './engine/xhr'

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
   * 创建 HTTP 客户端实例
   * @param prefix 请求前缀
   * @param config 客户端配置
   */
  constructor(prefix: string = '', config: ClientConfig = {}) {
    this.prefix = prefix
    this.config = config

    this.engine = typeof fetch === 'undefined' ? new XHREngine() : new FetchEngine()
  }

  private getRequestUrl(url: string, config: RequestConfig): string {
    // 如果已经是完整URL，直接返回
    if (this.isAbsoluteUrl(url)) {
      return this.appendQueryParams(url, config)
    }

    // 拼接前缀
    url = $str.joinUrlPath(this.prefix, url)

    // 如果配置了 origin，拼接到 URL 前面
    if (this.config.origin) {
      // 移除 origin 末尾的斜杠
      const origin = this.config.origin.replace(/\/$/, '')
      url = origin + url
    }

    return this.appendQueryParams(url, config)
  }

  private isAbsoluteUrl(url: string): boolean {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url) || url.startsWith('//')
  }

  private appendQueryParams(url: string, config: RequestConfig): string {
    // 处理查询参数（对所有请求方法都有效）
    if (config.query) {
      const searchParams = new URLSearchParams()

      const appendValue = (key: string, value: unknown): void => {
        if (value === undefined) {
          return
        }

        if (value === null) {
          searchParams.append(key, 'null')
          return
        }

        if (typeof value === 'object') {
          searchParams.append(key, JSON.stringify(value))
          return
        }

        searchParams.append(key, String(value))
      }

      Object.entries(config.query).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => appendValue(key, item))
          return
        }

        appendValue(key, value)
      })

      const queryString = searchParams.toString()

      if (queryString) {
        url = url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`
      }
    }

    return url
  }

  /**
   * 获取请求配置
   * @param config 当前请求配置
   * @returns 合并后的请求配置
   */
  private getRequestConfig(config: RequestConfig): RequestConfig {
    const { timeout, credentials, headers } = this.config

    return { timeout, credentials, ...config, headers: { ...headers, ...config.headers } }
  }

  private mergeRequestConfig(current: RequestConfig, patch: RequestConfig): RequestConfig {
    return { ...current, ...patch, headers: { ...current.headers, ...patch.headers } }
  }

  private async runOnErrorPlugins(error: unknown, context: RequestContext): Promise<void> {
    if (!this.config.plugins?.length) {
      return
    }

    for (const plugin of this.config.plugins) {
      if (!plugin.onError) {
        continue
      }

      try {
        await plugin.onError(error, context)
      } catch {
        // 忽略插件错误，保留原始错误语义
      }
    }
  }

  /**
   * 发送 HTTP 请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns Promise<HTTPResponse>
   */
  async request<T = any>(url: string, config: RequestConfig = {}): Promise<HTTPResponse<T>> {
    let finalConfig = this.getRequestConfig(config)
    let finalUrl = this.getRequestUrl(url, finalConfig)

    try {
      // 执行插件的 beforeRequest 钩子
      if (this.config.plugins?.length) {
        for (const plugin of this.config.plugins) {
          if (plugin.beforeRequest) {
            const result = await plugin.beforeRequest(finalUrl, finalConfig)
            if (result) {
              if (result.url) {
                finalUrl = result.url
              }
              if (result.config) {
                finalConfig = this.mergeRequestConfig(finalConfig, result.config)
              }
            }
          }
        }
      }

      let response = await this.engine.request<T>(finalUrl, finalConfig)

      // 执行插件的 afterRespond 钩子
      if (this.config.plugins?.length) {
        for (const plugin of this.config.plugins) {
          if (plugin.afterRespond) {
            const result = await plugin.afterRespond(response, finalUrl, finalConfig)
            if (result) {
              response = result
            }
          }
        }
      }

      return response
    } catch (error) {
      await this.runOnErrorPlugins(error, { url: finalUrl, config: finalConfig })
      throw error
    }
  }

  /**
   * 发送 GET 请求
   * @param url 请求地址
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  get<T>(url: string, config: AliasRequestConfig = {}): Promise<HTTPResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' })
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
    return this.request<T>(url, { ...config, method: 'POST', body })
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
    return this.request<T>(url, { ...config, method: 'PUT', body })
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
    return this.request<T>(url, { ...config, method: 'DELETE' })
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
    return this.request<T>(url, { ...config, method: 'PATCH', body })
  }

  /**
   * 发送 HEAD 请求
   * @param url 请求地址
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  head<T = any>(url: string, config: Omit<RequestConfig, 'method'> = {}): Promise<HTTPResponse<T>> {
    return this.request<T>(url, { ...config, method: 'HEAD' })
  }

  /**
   * 发送 OPTIONS 请求
   * @param url 请求地址
   * @param config 请求选项
   * @returns Promise<HTTPResponse>
   */
  options<T = any>(
    url: string,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(url, { ...config, method: 'OPTIONS' })
  }

  /**
   * 中止所有请求
   */
  abort(): void {
    // 中止当前引擎的所有请求
    this.engine.abort()
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
    const group = new HTTPClient($str.joinUrlPath(this.prefix, prefix), this.config)

    return group
  }
}
