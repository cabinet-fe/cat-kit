import { HttpEngine } from './engine'
import type { HTTPResponse, RequestConfig } from '../types'
import { getDataType } from '@cat-kit/core'

export class FetchEngine extends HttpEngine {
  private controllers: Set<AbortController> = new Set()

  constructor() {
    super()
  }

  async request<T = any>(
    url: string,
    config: RequestConfig
  ): Promise<HTTPResponse<T>> {
    const { method = 'GET', body, timeout, credentials, ...rest } = config

    // 创建新的 AbortController 实例用于此次请求
    const controller = new AbortController()
    this.controllers.add(controller)

    // 处理超时
    let timeoutId: number | undefined = undefined
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => {
        controller.abort()
      }, timeout) as unknown as number
    }

    try {
      // 准备请求配置
      const fetchOptions: RequestInit = {
        method,
        signal: controller.signal,
        credentials: config.credentials === false ? 'omit' : 'include',
        headers: config.headers || {},
        ...rest
      }

      // 处理请求体
      if (body && method !== 'GET' && method !== 'HEAD') {
        if (getDataType(body) === 'object' || getDataType(body) === 'array') {
          fetchOptions.body = JSON.stringify(body)
          // 设置内容类型为 JSON
          const headers = fetchOptions.headers as Record<string, string>
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json'
          }
        } else {
          fetchOptions.body = body as BodyInit
        }
      }

      // 发送请求
      const response = await fetch(url, fetchOptions)

      // 处理响应
      let data: T
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = (await response.json()) as T
      } else if (contentType && contentType.includes('text/')) {
        data = (await response.text()) as unknown as T
      } else {
        // 尝试解析为 JSON，如果失败则返回文本
        try {
          data = (await response.json()) as T
        } catch (e) {
          data = (await response.text()) as unknown as T
        }
      }

      // 构建响应对象
      const httpResponse: HTTPResponse = {
        data,
        code: response.status,
        headers: Object.fromEntries(response.headers.entries())
      }

      return httpResponse
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        if (timeoutId) {
          throw new Error('请求超时')
        } else {
          throw new Error('请求被中止')
        }
      }
      throw error
    } finally {
      // 清理资源
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      this.controllers.delete(controller)
    }
  }

  abort(): void {
    // 中止所有请求
    for (const controller of this.controllers) {
      controller.abort()
    }
    this.controllers.clear()
  }
}
