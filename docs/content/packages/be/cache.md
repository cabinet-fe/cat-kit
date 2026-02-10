# 缓存工具

## 介绍

本页聚焦 `@cat-kit/be` 的缓存能力：内存 LRU、文件缓存与函数记忆化，适用于减少重复计算与 I/O。

## 快速使用

```typescript
import { LRUCache, memoize } from '@cat-kit/be'

const cache = new LRUCache<string, number>({ maxSize: 100, ttl: 60_000 })
cache.set('answer', 42)

const slowFn = async (id: string) => ({ id, ts: Date.now() })
const fastFn = memoize(slowFn)
await fastFn('u1')
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## 概述

缓存工具包含三种主要实现：

- **LRUCache** - 内存缓存，使用最近最少使用（LRU）策略，适合热点数据缓存
- **FileCache** - 文件系统缓存，数据持久化到磁盘，适合需要跨进程或跨重启的缓存
- **memoize** - 函数记忆化装饰器，自动缓存函数调用结果，适合昂贵计算的函数

## LRU 缓存

### 简介

`LRUCache` 是一个基于内存的缓存实现，使用最近最少使用（LRU）策略自动淘汰最久未使用的项。当缓存达到最大容量时，会自动删除最久未访问的项。同时支持 TTL 过期机制，可以设置默认过期时间，也可以为每个缓存项单独设置过期时间。

**适用场景：**
- API 响应缓存
- 数据库查询结果缓存
- 频繁访问的热点数据
- 需要限制内存使用的场景

### 基本用法

```typescript
import { LRUCache } from '@cat-kit/be'

// 创建缓存实例
const cache = new LRUCache<string, User>({
  maxSize: 100,        // 最大容量
  ttl: 3600000        // 默认过期时间：1小时（可选）
})

// 设置缓存值
cache.set('user:1', user)
cache.set('user:2', user2, 1800000) // 单独设置过期时间：30分钟

// 获取缓存值
const user = cache.get('user:1')

// 检查是否存在
if (cache.has('user:1')) {
  console.log('缓存命中')
}

// 删除指定项
cache.delete('user:1')

// 清空所有缓存
cache.clear()

// 遍历缓存
for (const key of cache.keys()) {
  console.log(key)
}

for (const value of cache.values()) {
  console.log(value)
}

// 获取当前缓存大小
console.log(`缓存中有 ${cache.size} 项`)
```

### API参考

```typescript
class LRUCache<K, V> {
  constructor(options?: LRUCacheOptions)

  // 获取缓存值，如果不存在或已过期返回 undefined
  get(key: K): V | undefined

  // 设置缓存值
  // ttl: 可选，覆盖默认 TTL（毫秒）
  set(key: K, value: V, ttl?: number): void

  // 检查键是否存在且未过期
  has(key: K): boolean

  // 删除指定项
  delete(key: K): boolean

  // 清空所有缓存
  clear(): void

  // 获取所有键的迭代器
  keys(): IterableIterator<K>

  // 获取所有值的迭代器（只返回未过期的值）
  values(): IterableIterator<V>

  // 获取当前缓存中的条目数量
  get size(): number
}
```

**选项说明：**

- `maxSize` - 最大缓存容量，默认 `100`。当缓存达到此容量时，会自动删除最久未使用的项
- `ttl` - 默认过期时间（毫秒），可选。如果设置，所有缓存项默认在此时间后过期

**特性：**

- ✅ 自动淘汰最久未使用的项
- ✅ 支持 TTL 过期机制
- ✅ 访问时自动更新使用顺序
- ✅ 过期项在访问时自动删除
- ✅ 支持遍历和查询

## 文件缓存

### 简介

`FileCache` 是一个基于文件系统的缓存实现，将缓存数据持久化到磁盘。即使应用重启，缓存数据仍然保留。支持 TTL 过期机制，过期的缓存文件会在访问时自动删除。

**适用场景：**
- 需要跨进程共享的缓存
- 需要持久化的缓存数据
- 大型数据缓存（不受内存限制）
- 应用重启后仍需要保留的缓存

### 基本用法

```typescript
import { FileCache } from '@cat-kit/be'

// 创建文件缓存实例
const cache = new FileCache<CacheData>({
  dir: './cache',              // 缓存目录路径
  ttl: 86400000,               // 默认过期时间：24小时（可选）
  extension: '.json'           // 文件扩展名，默认 '.json'（可选）
})

// 设置缓存值（异步）
await cache.set('key', data)
await cache.set('key2', data2, 3600000) // 单独设置过期时间：1小时

// 获取缓存值（异步）
const data = await cache.get('key')

// 删除指定项
await cache.delete('key')

// 清空所有缓存（删除整个缓存目录）
await cache.clear()
```

### API参考

```typescript
class FileCache<V> {
  constructor(options: FileCacheOptions)

  // 获取缓存值，如果不存在或已过期返回 undefined
  get(key: string): Promise<V | undefined>

  // 设置缓存值
  // ttl: 可选，覆盖默认 TTL（毫秒）
  set(key: string, value: V, ttl?: number): Promise<void>

  // 删除指定项
  delete(key: string): Promise<boolean>

  // 清空所有缓存（删除整个缓存目录并重新创建）
  clear(): Promise<void>
}
```

**选项说明：**

- `dir` - 缓存目录路径（必需）。如果目录不存在会自动创建
- `ttl` - 默认过期时间（毫秒），可选
- `extension` - 文件扩展名，默认 `'.json'`

**特性：**

- ✅ 数据持久化到磁盘
- ✅ 支持 TTL 过期机制
- ✅ 过期项在访问时自动删除
- ✅ 键名自动进行 URL 编码以确保文件系统安全
- ✅ 支持跨进程和跨重启

**注意事项：**

- 所有操作都是异步的
- 键名会被 URL 编码，确保文件系统安全
- 清空操作会删除整个缓存目录并重新创建

## 函数记忆化

### 简介

`memoize` 是一个函数记忆化装饰器，自动缓存函数的调用结果。当使用相同参数调用函数时，会直接返回缓存的结果，而不是重新执行函数。支持同步和异步函数，也支持自定义缓存和键解析策略。

**适用场景：**
- 昂贵的计算函数
- API 请求函数
- 数据库查询函数
- 需要缓存结果的任何函数

### 基本用法

```typescript
import { memoize } from '@cat-kit/be'

// 基础用法：自动缓存函数结果
const fetchUser = memoize(async (id: number) => {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
})

// 第一次调用：执行函数并缓存结果
const user = await fetchUser(1)

// 第二次调用：直接从缓存返回
const user2 = await fetchUser(1) // 不会发起网络请求

// 访问缓存
fetchUser.cache.set('custom-key', user)
const cached = fetchUser.cache.get('custom-key')

// 清空缓存
fetchUser.clear()
```

### 高级用法

```typescript
import { memoize, LRUCache } from '@cat-kit/be'

// 自定义缓存实现
const cache = new LRUCache<string, User>({ maxSize: 50 })

const fetchUser = memoize(async (id: number) => {
  return await getUserFromDB(id)
}, {
  cache,                              // 使用自定义缓存
  resolver: (id) => `user:${id}`,     // 自定义键生成函数
  ttl: 300000                        // 5分钟过期
})

// 自定义键解析器（处理多个参数）
const expensiveFunction = memoize(
  (a: number, b: number) => a + b,
  {
    resolver: (a, b) => `${a}-${b}` // 自定义键格式
  }
)
```

### API参考

```typescript
function memoize<F extends (...args: any[]) => any>(
  fn: F,
  options?: MemoizeOptions<F, unknown>
): F & {
  cache: CacheAdapter<unknown, Awaited<ReturnType<F>>>
  clear(): void
}
```

**选项说明：**

- `cache` - 自定义缓存适配器，默认使用 `LRUCache`
- `resolver` - 键解析函数，默认使用 `JSON.stringify`。用于将函数参数转换为缓存键
- `ttl` - 缓存过期时间（毫秒），可选。会传递给底层缓存

**返回值：**

返回一个带缓存功能的函数，并附带以下属性：

- `cache` - 缓存适配器实例，可以直接操作缓存
- `clear()` - 清空缓存的便捷方法

**特性：**

- ✅ 自动缓存函数结果
- ✅ 支持同步和异步函数
- ✅ 支持自定义缓存实现
- ✅ 支持自定义键解析策略
- ✅ 支持 TTL 过期
- ✅ 可以直接访问和操作缓存

## 使用示例

### API 响应缓存

```typescript
import { LRUCache } from '@cat-kit/be'

const apiCache = new LRUCache<string, ApiResponse>({
  maxSize: 1000,
  ttl: 300000 // 5分钟过期
})

async function fetchApi(url: string) {
  // 先检查缓存
  const cached = apiCache.get(url)
  if (cached) {
    return cached
  }

  // 缓存未命中，发起请求
  const response = await fetch(url)
  const data = await response.json()

  // 存入缓存
  apiCache.set(url, data)
  return data
}
```

### 数据库查询缓存

```typescript
import { memoize, LRUCache } from '@cat-kit/be'

// 使用 LRU 缓存进行查询缓存
const queryCache = new LRUCache<string, QueryResult>({
  maxSize: 500,
  ttl: 60000 // 1分钟过期
})

const cachedQuery = memoize(async (sql: string) => {
  return await db.query(sql)
}, {
  cache: queryCache,
  resolver: (sql) => `query:${hash(sql)}` // 使用 SQL 的哈希值作为键
})
```

### 文件处理结果缓存

```typescript
import { FileCache } from '@cat-kit/be'

const fileCache = new FileCache<ProcessedData>({
  dir: './cache/processed',
  ttl: 86400000 // 24小时过期
})

async function processFile(filePath: string) {
  const cacheKey = `file:${filePath}`

  // 检查缓存
  const cached = await fileCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // 处理文件
  const processed = await doProcess(filePath)

  // 存入缓存
  await fileCache.set(cacheKey, processed)

  return processed
}
```

### 组合使用不同缓存策略

```typescript
import { LRUCache, FileCache, memoize } from '@cat-kit/be'

// 热点数据使用 LRU 缓存（内存，快速）
const hotCache = new LRUCache({
  maxSize: 100,
  ttl: 300000 // 5分钟
})

// 冷数据使用文件缓存（持久化，大容量）
const coldCache = new FileCache({
  dir: './cache/cold',
  ttl: 86400000 // 24小时
})

// 函数记忆化使用热点缓存
const expensiveFunction = memoize(
  async (input: string) => {
    // 昂贵的计算
    return await compute(input)
  },
  {
    cache: hotCache,
    ttl: 300000
  }
)
```

## 选择指南

**何时使用 LRUCache：**
- 需要快速访问的内存缓存
- 数据量不大，可以放在内存中
- 需要自动淘汰最久未使用的项
- 应用重启后可以丢失的缓存

**何时使用 FileCache：**
- 需要持久化的缓存数据
- 数据量较大，不适合放在内存
- 需要跨进程或跨重启共享缓存
- 可以接受文件 I/O 的性能开销

**何时使用 memoize：**
- 需要缓存函数调用结果
- 函数参数可以唯一标识结果
- 函数执行成本较高（网络请求、数据库查询、复杂计算等）
- 需要灵活控制缓存策略

## 最佳实践

1. **合理设置缓存容量**：根据实际内存和磁盘空间设置合适的 `maxSize`
2. **设置合理的 TTL**：根据数据更新频率设置过期时间，平衡性能和一致性
3. **处理缓存未命中**：始终处理缓存未命中的情况，不要假设数据一定在缓存中
4. **监控缓存命中率**：定期检查缓存效果，调整缓存策略
5. **避免缓存穿透**：对于不存在的键，考虑缓存空值或使用布隆过滤器
6. **清理过期缓存**：定期清理过期缓存，释放存储空间
