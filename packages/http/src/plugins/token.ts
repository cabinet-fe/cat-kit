import type { ClientPlugin, PluginHookResult, RequestConfig } from '../types'

/**
 * Token 插件配置
 */
export interface TokenPluginOptions {
  /**
   * 获取令牌的方法
   * - 可以是同步或异步的
   * - 返回 null 或 undefined 时不会添加令牌
   */
  getter: () => string | null | undefined | Promise<string | null | undefined>

  /**
   * 请求头名称
   * - 默认为 'Authorization'
   */
  headerName?: string

  /**
   * 授权类型
   * - 'Bearer': Bearer 令牌 (默认)
   * - 'Basic': Basic 认证
   * - 'Custom': 自定义，需要提供 formatter
   */
  authType?: 'Bearer' | 'Basic' | 'Custom'

  /**
   * 自定义令牌格式化方法
   * - 仅在 authType 为 'Custom' 时有效
   * - 用于自定义令牌的格式
   */
  formatter?: (token: string) => string
}

/**
 * Token 插件
 * 用于自动在请求头中添加令牌
 *
 * @example
 * ```ts
 * import { TokenPlugin, HTTPClient } from '@cat-kit/http'
 *
 * const http = new HTTPClient({
 *   plugins: [
 *     TokenPlugin({
 *       // 获取 token 的方法，可以是异步的
 *       getter: () => localStorage.getItem('token'),
 *       // 授权类型，默认是 Bearer
 *       authType: 'Bearer'
 *     })
 *   ]
 * })
 * ```
 */
export function TokenPlugin(options: TokenPluginOptions): ClientPlugin {
  const {
    getter,
    authType = 'Bearer',
    formatter,
    headerName = 'Authorization'
  } = options

  /**
   * 格式化令牌
   * @param token 令牌
   * @returns 格式化后的令牌
   */
  const getToken = async (): Promise<string | null | undefined> => {
    const token = await getter()
    if (!token) return token
    if (authType === 'Custom') {
      return formatter?.(token) ?? token
    }
    return `${authType} ${token}`
  }

  return {
    async beforeRequest(
      url: string,
      config: RequestConfig
    ): Promise<PluginHookResult> {
      const token = await getToken()

      // 如果没有令牌，不做任何处理
      if (!token) {
        return {}
      }

      // 创建新的请求头对象
      const headers = { ...(config.headers || {}) }

      // 添加令牌到请求头
      headers[headerName] = token

      // 返回修改后的请求选项
      return {
        config: {
          ...config,
          headers
        }
      }
    }
  }
}
