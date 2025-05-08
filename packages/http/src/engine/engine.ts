import type {
  ClientConfig,
  ClientPlugin,
  HTTPResponse,
  RequestOptions
} from '../types'
import { obj2query, $str, isInBrowser } from '@cat-kit/core'

export abstract class HttpEngine {
  /** 客户端配置 */
  protected config: ClientConfig = {}

  /** 插件列表 */
  protected plugins: ClientPlugin[] = []

  /**
   * 构造函数
   * @param config 客户端配置
   */
  constructor(config?: ClientConfig) {
    if (config) {
      this.config = config
      this.plugins = config.plugins || []
    }
  }

  /**
   * 发送 HTTP 请求
   * @param url 请求 URL
   * @param options 请求选项
   */
  abstract request<T = any>(
    url: string,
    options?: RequestOptions
  ): Promise<HTTPResponse<T>>

  /**
   * 中止 HTTP 请求
   */
  abstract abort(): void

  /**
   * 构建完整的请求 URL
   * @param url 原始 URL
   * @param options 请求选项
   * @returns 构建后的 URL
   */
  protected buildURL(url: string, options: RequestOptions): string {
    // 处理基础路径
    const base = options.base || this.config.base || ''
    if (base && !url.startsWith('http')) {
      url = $str.joinUrlPath(base, url)
    }

    // 处理源
    const origin = this.config.origin
    if (origin && !url.startsWith('http')) {
      url = $str.joinUrlPath(origin, url)
    } else if (!isInBrowser() && !url.startsWith('http')) {
      throw new Error('在 Node.js 环境中，必须提供 origin 或完整的 URL')
    }

    // 处理查询参数
    const { query } = options
    if (query) {
      const hasQuery = url.includes('?')
      const separator = hasQuery ? '&' : '?'
      url = `${url}${separator}${obj2query(query)}`
    }

    return url
  }

  /**
   * 合并请求选项
   * @param options 请求选项
   * @returns 合并后的请求选项
   */
  protected mergeOptions(options: RequestOptions): RequestOptions {
    const { headers: configHeaders = {}, timeout, credentials } = this.config

    // 合并请求头
    const headers = { ...configHeaders, ...(options.headers || {}) }

    return {
      ...options,
      headers,
      timeout: options.timeout ?? timeout,
      credentials: options.credentials ?? credentials
    }
  }

  /**
   * 执行请求前的插件钩子
   * @param url 请求 URL
   * @param options 请求选项
   * @returns 处理后的请求选项
   */
  protected async runBeforeRequestPlugins(
    url: string,
    options: RequestOptions
  ): Promise<{ url: string; options: RequestOptions }> {
    let currentUrl = url
    let currentOptions = options

    for (const plugin of this.plugins) {
      if (plugin.beforeRequest) {
        const result = await plugin.beforeRequest(currentUrl, currentOptions)
        if (result) {
          currentUrl = result.url || currentUrl
          currentOptions = result.options || currentOptions
        }
      }
    }

    return { url: currentUrl, options: currentOptions }
  }

  /**
   * 执行响应后的插件钩子
   * @param response 响应对象
   * @param url 请求 URL
   * @param options 请求选项
   * @returns 处理后的响应对象
   */
  protected async runAfterRespondPlugins(
    response: HTTPResponse,
    url: string,
    options: RequestOptions
  ): Promise<HTTPResponse> {
    let currentResponse = response

    for (const plugin of this.plugins) {
      if (plugin.afterRespond) {
        const result = await plugin.afterRespond(currentResponse, url, options)
        if (result) {
          currentResponse = result
        }
      }
    }

    return currentResponse
  }
}
