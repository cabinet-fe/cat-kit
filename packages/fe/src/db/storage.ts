import { getDataType } from '@cat-kit/core'

type Callback<T = any> = (
  key: StorageKey<T>,
  value?: T,
  temp?: { value: T; exp: number }
) => void

export interface StorageKey<T> extends String {}

export function storageKey<T>(str: string): StorageKey<T> {
  return str
}

export type ExtractStorageKey<T> = T extends StorageKey<infer K> ? K : never

export class WebStorage {
  static enabledType: Set<string> = new Set([
    'string',
    'number',
    'object',
    'boolean',
    'bigint'
  ])

  private storage: Storage

  callbacks: { [key: string]: Callback[] } = {}

  constructor(storageType: 'local' | 'session') {
    if (storageType === 'local') {
      this.storage = localStorage
    } else {
      this.storage = sessionStorage
    }
  }

  /**
   * 往缓存里添加单条记录
   * @param key 单个值的键
   * @param value 单个值
   * @param exp 单个值的过期时间, 单位秒
   */
  set<T>(key: StorageKey<T>, value: T, exp = 0): WebStorage {
    if (value === null) return this

    const valueType = typeof value
    if (!WebStorage.enabledType.has(valueType)) return this

    // exp如果为0则永不过期
    const temp: { value: any; exp: number } = { value: null, exp: 0 }

    // 如果是简单的数据则直接存入
    temp.value = value
    temp.exp = exp ? Date.now() + exp * 1000 : 0

    // 如果有绑定回调则此处出发回调
    const cb = this.callbacks[key as string]
    cb?.forEach(fn => fn(key, value, temp))

    this.storage.setItem(key as string, JSON.stringify(temp))

    return this
  }

  // 获取对应的字段
  get<T>(key: StorageKey<T>): T | null
  get<T>(key: StorageKey<T>, defaultValue: T): T
  get<T extends [...any[]]>(
    keys: [...T]
  ): { [I in keyof T]: ExtractStorageKey<T[I]> }
  get(key: any, defaultValue: any = null) {
    let type = getDataType(key)
    if (type === 'string') {
      let stringTmp = this.storage.getItem(key as string)

      // 如果未查到此项
      if (stringTmp === null) return defaultValue

      let tmp = JSON.parse(stringTmp)

      // 如果未过期
      if (tmp.exp > Date.now() || tmp.exp === 0) return tmp.value

      // 数据过期
      this.remove(key)
      return defaultValue
    }

    if (type === 'array') {
      return key.map((v: string) => this.get(v))
    }

    throw Error(
      `get第一个参数的类型应该是string或者array, 但传入的值是${type}类型`
    )
  }

  /**
   * 获取字段过期时间
   * @param key 字段名
   */
  getExpire(key: StorageKey<any>): number {
    let stringTmp = this.storage.getItem(key as string)
    // 如果未查到此项
    if (stringTmp === null) return 0
    try {
      return JSON.parse(stringTmp).exp
    } catch {
      return 0
    }
  }

  /**
   * 移除一个缓存值
   * @param key 需要移除的值的键
   */
  remove<T>(key: StorageKey<any>): WebStorage
  /**
   * 移除多个缓存值
   * @param keys 需要移除的值的键的数组
   */
  remove(keys: StorageKey<any>[]): WebStorage
  /**
   * 清空缓存
   */
  remove(): WebStorage
  remove(item?: any) {
    if (item === undefined) {
      this.storage.clear()
    } else if (typeof item === 'string') {
      this.storage.removeItem(item)
    } else if (Array.isArray(item)) {
      item.forEach(key => this.remove(key))
    }
    return this
  }

  /**
   * 添加一个值改动的回调
   * @param key 键
   * @param callback 回调函数
   */
  on(key: string, callback: Callback): void {
    const cbs = this.callbacks[key]

    if (cbs) {
      cbs.push(callback)
    } else {
      this.callbacks[key] = [callback]
    }
  }

  /**
   * 移除多个回调
   * @param keys 需要移除的回调的字符串数组
   */
  off(keys: string[]): void
  /**
   * 移除单个回调
   * @param key 需要移除的记录的键
   */
  off(key: string): void
  /**
   * 移除所有回调
   */
  off(): void
  off(key?: any) {
    if (typeof key === 'string') {
      delete this.callbacks[key]
    } else if (key === undefined) {
      this.callbacks = {}
    } else if (Array.isArray(key)) {
      key.forEach((item: string) => this.off(item))
    }
  }
}

export const storage: {
  /** 会话存储 */
  session: WebStorage
  /** 本地存储 */
  local: WebStorage
} = {
  session: new WebStorage('session'),
  local: new WebStorage('local')
}
