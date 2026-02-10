import type { HTTPResponse, RequestConfig } from '../types'

import { HTTPError } from '../types'
import { HttpEngine } from './engine'
import { buildRequestBody } from './shared'

export class FetchEngine extends HttpEngine {
  private controllers: Set<AbortController> = new Set()

  constructor() {
    super()
  }

  async request<T = any>(url: string, config: RequestConfig): Promise<HTTPResponse<T>> {
    const { method = 'GET', body, timeout, responseType } = config

    // 创建新的 AbortController 实例用于此次请求
    const controller = new AbortController()
    this.controllers.add(controller)
    let isTimeoutAbort = false

    // 处理超时
    let timeoutId: number | undefined = undefined
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => {
        isTimeoutAbort = true
        controller.abort()
      }, timeout) as unknown as number
    }

    try {
      // 准备请求配置
      const fetchOptions: RequestInit = {
        method,
        signal: controller.signal,
        credentials: config.credentials === false ? 'omit' : 'include',
        headers: { ...config.headers }
      }

      // 处理请求体
      const headers = fetchOptions.headers as Record<string, string>
      const requestBody = buildRequestBody(method, body, headers)
      if (requestBody !== null) {
        fetchOptions.body = requestBody
      }

      // 发送请求
      const response = await fetch(url, fetchOptions)

      const rawData = await this.parseResponseData(response, responseType)
      const data = rawData as T

      // 构建响应对象
      const httpResponse: HTTPResponse = {
        data,
        code: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        raw: response
      }

      return httpResponse
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new HTTPError(isTimeoutAbort ? '请求超时' : '请求被中止', {
          code: isTimeoutAbort ? 'TIMEOUT' : 'ABORTED',
          url,
          config,
          cause: error
        })
      }

      if (error instanceof HTTPError) {
        throw error
      }

      throw new HTTPError('网络错误', { code: 'NETWORK', url, config, cause: error })
    } finally {
      // 清理资源
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      this.controllers.delete(controller)
    }
  }

  private async parseResponseData(
    response: Response,
    responseType: RequestConfig['responseType']
  ): Promise<unknown> {
    const resolvedType = responseType || 'json'

    if (resolvedType === 'text') {
      return response.text()
    }

    if (resolvedType === 'blob') {
      return response.blob()
    }

    if (resolvedType === 'arraybuffer') {
      return response.arrayBuffer()
    }

    const text = await response.text()
    if (!text) {
      return null
    }

    try {
      return JSON.parse(text)
    } catch (error) {
      throw new HTTPError('响应解析失败', {
        code: 'PARSE',
        response: {
          data: text,
          code: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          raw: response
        },
        cause: error
      })
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
