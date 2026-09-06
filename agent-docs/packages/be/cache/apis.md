---
title: "@cat-kit/be 缓存 API"
description: "LRUCache、FileCache、memoize 签名与选项"
keywords:
  - LRUCache
  - FileCache
  - memoize
  - CacheAdapter
  - LRUCacheOptions
  - FileCacheOptions
  - MemoizeOptions
  - maxSize
  - ttl
  - 过期淘汰
aliases:
  - node-cache
  - lru-cache
  - memoize
  - 缓存 API
---

# 缓存 API

缓存模块全部类与函数的 TypeScript 签名。

```ts
declare class LRUCache<K, V> {
  constructor(options?: LRUCacheOptions)
  get(key: K): V | undefined
  has(key: K): boolean
  set(key: K, value: V, ttl?: number): void
  delete(key: K): boolean
  clear(): void
  keys(): IterableIterator<K>
  values(): IterableIterator<V>
  get size(): number
}

declare class FileCache<V> {
  constructor(options: FileCacheOptions)
  get(key: string): Promise<V | undefined>
  has(key: string): Promise<boolean>
  set(key: string, value: V, ttl?: number): Promise<void>
  delete(key: string): Promise<boolean>
  clear(): Promise<void>
}

declare function memoize<F extends (...args: any[]) => any>(
  fn: F,
  options?: MemoizeOptions<F, unknown>
): F & { cache: CacheAdapter<unknown, Awaited<ReturnType<F>>>; clear(): void }
```

## 参数说明

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `LRUCacheOptions` | `maxSize` | 最大容量，默认 `100` |
| `LRUCacheOptions` | `ttl` | 默认过期时间（毫秒） |
| `FileCacheOptions` | `dir` | 缓存目录路径（必填） |
| `FileCacheOptions` | `ttl` | 默认过期时间（毫秒） |
| `FileCacheOptions` | `extension` | 缓存文件后缀，默认 `'.json'` |
| `MemoizeOptions` | `cache` | 自定义缓存实现（`CacheAdapter`），默认内部 `LRUCache` |
| `MemoizeOptions` | `resolver` | 自定义缓存键函数，默认 `String` / `JSON.stringify` |
| `MemoizeOptions` | `ttl` | 默认过期时间（毫秒） |
| `CacheAdapter` | — | `get` / `set` / `has` / `delete` / `clear`，同步接口 |
