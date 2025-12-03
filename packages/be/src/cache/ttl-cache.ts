export interface TTLCacheOptions {
  ttl: number
  maxSize?: number
  /**
   * 清理过期数据的间隔（毫秒）
   */
  cleanupInterval?: number
}

interface CacheEntry<V> {
  value: V
  expiresAt: number
}

export class TTLCache<K, V> {
  private readonly cache: Map<K, CacheEntry<V>>

  private readonly ttl: number

  private readonly maxSize: number

  private cleanupTimer?: ReturnType<typeof setInterval>

  constructor(options: TTLCacheOptions) {
    if (options.ttl <= 0) {
      throw new Error('ttl must be greater than 0')
    }

    this.ttl = options.ttl
    this.maxSize = options.maxSize ?? Infinity
    this.cache = new Map()

    if (options.cleanupInterval) {
      this.cleanupTimer = setInterval(
        () => this.cleanup(),
        options.cleanupInterval
      )
    }
  }

  private isExpired(entry: CacheEntry<V>): boolean {
    return entry.expiresAt <= Date.now()
  }

  private cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
      }
    }
  }

  set(key: K, value: V, ttl?: number): void {
    const expiresAt = Date.now() + (ttl ?? this.ttl)
    this.cache.set(key, { value, expiresAt })

    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return undefined
    }

    return entry.value
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }
}

