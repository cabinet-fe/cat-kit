/**
 * Cookie操作选项接口
 */
export interface CookieOptions {
  /**
   * Cookie过期时间（秒数或Date对象）
   */
  expires?: number | Date

  /**
   * Cookie路径
   */
  path?: string

  /**
   * Cookie域名
   */
  domain?: string

  /**
   * 是否仅通过HTTPS传输
   */
  secure?: boolean

  /**
   * 同站策略
   */
  sameSite?: 'Strict' | 'Lax' | 'None'
}

/**
 * Cookie操作工具类
 *
 * 提供了一系列简单易用的方法来操作浏览器 cookie。
 * 支持设置、获取、删除、检查存在性等基本操作。
 *
 * @example
 * ```typescript
 * // 设置 cookie
 * cookie.set('token', 'abc123', { expires: 7 * 24 * 3600  }); // 7天后过期
 *
 * // 获取 cookie
 * const token = cookie.get('token');
 *
 * // 删除 cookie
 * cookie.remove('token');
 *
 * // 检查是否存在
 * if (cookie.has('token')) {
 *   // ...
 * }
 *
 * // 获取所有 cookie
 * const allCookies = cookie.getAll();
 *
 * // 清空所有 cookie
 * cookie.clear();
 * ```
 */
export const cookie = {
  /**
   * 设置 cookie
   * @param key - cookie 键名
   * @param value - cookie 值
   * @param options - 配置选项
   */
  set(key: string, value: string, options: CookieOptions = {}): void {
    let cookieStr = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`

    if (options.expires !== undefined) {
      const expires =
        options.expires instanceof Date
          ? options.expires
          : new Date(Date.now() + options.expires * 1000) // 秒数转毫秒
      cookieStr += `; expires=${expires.toUTCString()}`
    }

    if (options.path) cookieStr += `; path=${options.path}`
    if (options.domain) cookieStr += `; domain=${options.domain}`
    if (options.secure) cookieStr += '; secure'
    if (options.sameSite) cookieStr += `; samesite=${options.sameSite}`

    document.cookie = cookieStr
  },

  /**
   * 获取指定键名的 cookie 值
   * @param key - cookie 键名
   * @returns cookie 值，如果不存在则返回 null
   */
  get(key: string): string | null {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const parts = cookie.trim().split('=')
      if (parts.length === 2) {
        const cookieKey = parts[0]
        const cookieValue = parts[1]

        if (cookieKey && cookieValue && decodeURIComponent(cookieKey) === key) {
          return decodeURIComponent(cookieValue)
        }
      }
    }
    return null
  },

  /**
   * 删除指定键名的 cookie
   * @param key - cookie 键名
   * @param options - 配置选项
   */
  remove(
    key: string,
    options: Pick<CookieOptions, 'path' | 'domain'> = {}
  ): void {
    this.set(key, '', {
      ...options,
      expires: new Date(0)
    })
  },

  /**
   * 检查指定键名的 cookie 是否存在
   * @param key - cookie 键名
   * @returns 如果 cookie 存在返回 true，否则返回 false
   */
  has(key: string): boolean {
    return this.get(key) !== null
  },

  /**
   * 获取所有 cookie
   * @returns 包含所有 cookie 的键值对对象
   */
  getAll(): Record<string, string> {
    const cookies: Record<string, string> = {}
    document.cookie.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=')
      if (parts.length === 2) {
        const key = parts[0]
        const value = parts[1]

        if (key && value) {
          cookies[decodeURIComponent(key)] = decodeURIComponent(value)
        }
      }
    })
    return cookies
  },

  /**
   * 清空所有 cookie
   * @remarks
   * 此操作会删除当前域名下的所有 cookie
   */
  clear(): void {
    const cookies = this.getAll()
    Object.keys(cookies).forEach(key => this.remove(key))
  }
}
