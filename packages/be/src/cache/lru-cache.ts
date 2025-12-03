export interface LRUCacheOptions {
  /**
   * 最大缓存容量
   * @default 100
   */
  maxSize?: number
  /**
   * 默认过期时间（毫秒）
   */
  ttl?: number
}

interface CacheEntry<V> {
  value: V
  expiresAt?: number
}

export class LRUCache<K, V> {
  private readonly cache = new Map<K, CacheEntry<V>>()

  private readonly maxSize: number

  private readonly ttl?: number

  constructor(options: LRUCacheOptions = {}) {
    this.maxSize = Math.max(1, options.maxSize ?? 100)
    this.ttl = options.ttl
  }

  private isExpired(entry: CacheEntry<V>): boolean {
    return !!entry.expiresAt && entry.expiresAt <= Date.now()
  }

  private touch(key: K, entry: CacheEntry<V>): void {
    this.cache.delete(key)
    this.cache.set(key, entry)
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return undefined
    }

    this.touch(key, entry)
    return entry.value
  }

  has(key: K): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  set(key: K, value: V, ttl?: number): void {
    const expiresIn = ttl ?? this.ttl
    const entry: CacheEntry<V> = {
      value,
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined
    }

    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    this.cache.set(key, entry)

    if (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  keys(): IterableIterator<K> {
    return this.cache.keys()
  }

  values(): IterableIterator<V> {
    const self = this
    function* generator(): Generator<V> {
      for (const entry of self.cache.values()) {
        if (!self.isExpired(entry)) {
          yield entry.value
        }
      }
    }
    return generator()
  }

  get size(): number {
    return this.cache.size
  }
}

