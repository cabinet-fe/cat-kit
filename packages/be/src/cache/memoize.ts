import { LRUCache } from './lru-cache'

export interface CacheAdapter<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V, ttl?: number): void
  has(key: K): boolean
  delete(key: K): boolean
  clear(): void
}

export interface MemoizeOptions<F extends (...args: any[]) => any, K> {
  cache?: CacheAdapter<K, Awaited<ReturnType<F>>>
  resolver?: (...args: Parameters<F>) => K
  ttl?: number
}

const defaultResolver = (...args: unknown[]): string => {
  return args.length === 1 ? String(args[0]) : JSON.stringify(args)
}

/**
 * 为函数添加缓存能力
 * @param fn - 需要缓存的原函数
 * @param options - 自定义缓存、键解析与过期时间
 * @returns 带缓存功能的函数，并附带 cache/clear 属性
 */
export function memoize<F extends (...args: any[]) => any>(
  fn: F,
  options: MemoizeOptions<F, unknown> = {}
): F & { cache: CacheAdapter<unknown, Awaited<ReturnType<F>>>; clear(): void } {
  const cache =
    (options.cache as CacheAdapter<unknown, Awaited<ReturnType<F>>>) ??
    new LRUCache<unknown, Awaited<ReturnType<F>>>()
  const resolver = options.resolver ?? defaultResolver

  const memoized = function (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ): ReturnType<F> {
    const key = resolver(...args)

    if (cache.has(key)) {
      return cache.get(key)! as ReturnType<F>
    }

    const result = fn.apply(this, args)

    if (result && typeof (result as Promise<unknown>).then === 'function') {
      const promise = (result as Promise<Awaited<ReturnType<F>>>).then(
        value => {
          cache.set(key, value, options.ttl)
          return value
        }
      )
      // @ts-expect-error - aligning return type
      return promise
    }

    cache.set(key, result as Awaited<ReturnType<F>>, options.ttl)
    // @ts-expect-error - aligning return type
    return result
  } as F & {
    cache: CacheAdapter<unknown, Awaited<ReturnType<F>>>
    clear(): void
  }

  memoized.cache = cache
  memoized.clear = () => cache.clear()

  return memoized
}
