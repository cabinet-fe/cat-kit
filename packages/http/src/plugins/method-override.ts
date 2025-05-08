import type {
  ClientPlugin,
  PluginHookResult,
  RequestMethod,
  RequestOptions
} from '../types'

/**
 * 方法重写插件配置
 */
export interface MethodOverridePluginOptions {
  /**
   * 需要被重写的请求方法
   * - 默认为 ['DELETE', 'PUT', 'PATCH']
   */
  methods?: RequestMethod[]
  /**
   * 重写后的请求方法
   * - 默认为 'POST'
   */
  overrideMethod?: RequestMethod
}

/**
 * 方法重写插件
 *
 * 用于绕过某些环境对特定 HTTP 方法的限制
 *
 * @example
 * ```ts
 * import { MethodOverridePlugin, HTTPClient } from '@cat-kit/http'
 * const http = new HTTPClient({
 *   plugins: [
 *     MethodOverridePlugin()
 *   ]
 * })
 * ```
 */
export function MethodOverridePlugin(
  options: MethodOverridePluginOptions = {}
): ClientPlugin {
  const { methods = ['DELETE', 'PUT', 'PATCH'], overrideMethod = 'POST' } =
    options

  return {
    beforeRequest(_url: string, options: RequestOptions): PluginHookResult {
      const { method } = options

      // 如果没有指定方法或者方法不需要被重写，不做任何处理
      if (!method || !methods.includes(method as RequestMethod)) {
        return {}
      }

      // 创建新的请求头对象
      const headers = { ...(options.headers || {}) }

      // 添加原始方法到请求头
      headers['X-HTTP-Method-Override'] = method

      // 返回修改后的请求选项
      return {
        options: {
          ...options,
          method: overrideMethod,
          headers
        }
      }
    }
  }
}
