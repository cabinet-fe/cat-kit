import type { HTTPClientPlugin, HTTPResponse, PluginHookResult, RequestConfig } from '../types'
import { HTTPError } from '../types'

/**
 * Token 插件配置
 */
export interface HTTPTokenPluginOptions {
  /**
   * 获取令牌的方法
   * - 可以是同步或异步的
   * - 返回 null 或 undefined 时不会添加令牌
   * - 建议从内存中获取，例如状态管理中获取
   */
  getter: () => string | null | undefined | Promise<string | null | undefined>

  /**
   * 请求头名称
   * @default 'Authorization'
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

  /**
   * 刷新令牌回调；刷新完成后通过 `getter` 取新 token
   */
  onRefresh?: () => Promise<void>

  /** 为 true 时触发刷新流程（在 beforeRequest 中） */
  isExpired?: () => boolean

  /** 为 true 时视为 refresh_token 已过期 */
  isRefreshExpired?: () => boolean

  /**
   * 基于业务响应判断是否需要刷新（如 401）
   * - 为 true 且需重试时须同时配置 {@link TokenPluginOptions.onRefresh}，否则不会发起重试
   */
  shouldRefresh?: (response: HTTPResponse) => boolean

  /** refresh_token 过期时回调（如登出） */
  onRefreshExpired?: () => void

  /** 最大重试次数，默认 2 次，0 为不重试 */
  maxRetries?: number
}

export type TokenPluginOptions = HTTPTokenPluginOptions

function getRetryAttempt(config: RequestConfig): number {
  return config._retryAttempt ?? 0
}

/**
 * Token 插件
 * 用于自动在请求头中添加令牌
 *
 * @example
 * ```ts
 * import { TokenPlugin, HTTPClient } from '@cat-kit/http'
 *
 * const http = new HTTPClient('', {
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
export function HTTPTokenPlugin(options: HTTPTokenPluginOptions): HTTPClientPlugin {
  const {
    getter,
    authType = 'Bearer',
    formatter,
    headerName = 'Authorization',
    onRefresh,
    isExpired,
    isRefreshExpired,
    shouldRefresh,
    onRefreshExpired,
    maxRetries = 2
  } = options

  let refreshPromise: Promise<void> | null = null

  const doRefresh = (): Promise<void> => {
    if (!onRefresh) {
      return Promise.resolve()
    }
    if (refreshPromise) {
      return refreshPromise
    }
    refreshPromise = onRefresh().finally(() => {
      refreshPromise = null
    })
    return refreshPromise
  }

  /**
   * 获取并格式化令牌
   * - 调用 getter 获取原始令牌
   * - 根据 authType 拼接前缀（Bearer/Basic）或调用自定义 formatter
   * @returns 格式化后的令牌，原始令牌为空时返回原值
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
    name: 'token',
    async beforeRequest({ url, config }): Promise<PluginHookResult> {
      if (isRefreshExpired?.()) {
        onRefreshExpired?.()
        throw new HTTPError('刷新令牌已过期', { code: 'AUTH', url, config })
      }

      if (refreshPromise) {
        await refreshPromise
      }

      if (isExpired?.() && onRefresh) {
        await doRefresh()
      }

      const token = await getToken()

      if (!token) {
        return {}
      }

      const headers = { ...config.headers }
      headers[headerName] = token
      return { config: { ...config, headers } }
    },

    async afterRespond({ response, originalUrl, originalConfig, client }): Promise<HTTPResponse | void> {
      if (!onRefresh || !shouldRefresh?.(response)) {
        return
      }

      const attempt = getRetryAttempt(originalConfig)
      if (attempt >= maxRetries) {
        return
      }

      await doRefresh()
      return client.request(originalUrl, {
        ...originalConfig,
        _retryAttempt: attempt + 1
      })
    }
  }
}

export const TokenPlugin = HTTPTokenPlugin
