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

  /**
   * 是否刷新令牌
   * - 如果为 true，则每次请求都会重新获取令牌
   * - 如果为 false，则只在第一次请求时获取令牌
   * @default false
   */
  refresh?: boolean

  /**
   * 令牌缓存时间（毫秒）
   * - 仅在 refresh 为 false 时有效
   * - 如果设置了缓存时间，则在缓存时间内不会重新获取令牌
   * - 如果不设置，则令牌永不过期
   */
  cacheTime?: number
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
    refresh = false,
    cacheTime
  } = options

  // 缓存的令牌
  let cachedToken: string | null | undefined
  // 上次获取令牌的时间
  let lastFetchTime = 0

  /**
   * 格式化令牌
   * @param token 令牌
   * @returns 格式化后的令牌
   */
  const formatToken = (token: string): string => {
    if (authType === 'Custom' && formatter) {
      return formatter(token)
    }

    if (authType === 'Bearer') {
      return `Bearer ${token}`
    }

    if (authType === 'Basic') {
      return `Basic ${token}`
    }

    return token
  }

  /**
   * 获取令牌
   * @returns 令牌
   */
  const getToken = async (): Promise<string | null | undefined> => {
    // 如果需要刷新令牌，或者缓存已过期，或者没有缓存的令牌
    const now = Date.now()
    const needRefresh =
      refresh || !cachedToken || (cacheTime && now - lastFetchTime > cacheTime)

    if (needRefresh) {
      cachedToken = await getter()
      lastFetchTime = now
    }

    return cachedToken
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
      headers['Authorization'] = formatToken(token)

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
