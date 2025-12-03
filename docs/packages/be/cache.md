# 缓存工具

缓存工具模块提供了多种缓存实现，包括 LRU 缓存、TTL 缓存、文件缓存和函数记忆化。

## LRU 缓存

### LRUCache

最近最少使用（LRU）缓存，支持 TTL（生存时间）。

```typescript
import { LRUCache } from '@cat-kit/be'

// 创建缓存
const cache = new LRUCache<string, User>({
  maxSize: 100, // 最大容量
  ttl: 3600000 // 1小时过期（可选）
})

// 设置值
cache.set('user:1', user)
cache.set('user:2', user2, 1800000) // 30分钟过期

// 获取值
const user = cache.get('user:1')

// 检查是否存在
if (cache.has('user:1')) {
  // ...
}

// 删除
cache.delete('user:1')

// 清空
cache.clear()

// 遍历
for (const key of cache.keys()) {
  console.log(key)
}

for (const value of cache.values()) {
  console.log(value)
}

// 获取大小
console.log(cache.size)
```

#### API

```typescript
class LRUCache<K, V> {
  constructor(options?: LRUCacheOptions)

  get(key: K): V | undefined
  set(key: K, value: V, ttl?: number): void
  has(key: K): boolean
  delete(key: K): boolean
  clear(): void
  keys(): IterableIterator<K>
  values(): IterableIterator<V>
  get size(): number
}
```

**选项：**

- `maxSize` - 最大缓存容量，默认 `100`
- `ttl` - 默认过期时间（毫秒），可选

**特性：**

- 自动淘汰最久未使用的项
- 支持 TTL，过期项自动删除
- 访问时自动更新使用顺序

## TTL 缓存

### TTLCache

基于时间的缓存，所有项都有过期时间，支持自动清理。

```typescript
import { TTLCache } from '@cat-kit/be'

// 创建缓存
const cache = new TTLCache<string, string>({
  ttl: 60000, // 1分钟过期
  maxSize: 1000, // 最大容量（可选）
  cleanupInterval: 30000 // 清理间隔（可选）
})

// 设置值
cache.set('key', 'value')
cache.set('key2', 'value2', 120000) // 2分钟过期

// 获取值（过期项会自动删除）
const value = cache.get('key')

// 停止自动清理
cache.stopCleanup()
```

#### API

```typescript
class TTLCache<K, V> {
  constructor(options: TTLCacheOptions)

  set(key: K, value: V, ttl?: number): void
  get(key: K): V | undefined
  has(key: K): boolean
  delete(key: K): boolean
  clear(): void
  stopCleanup(): void
}
```

**选项：**

- `ttl` - 默认过期时间（毫秒），必需
- `maxSize` - 最大容量，默认 `Infinity`
- `cleanupInterval` - 自动清理间隔（毫秒），可选

**特性：**

- 所有项都有过期时间
- 支持定期自动清理过期项
- 访问时检查过期并自动删除

## 文件缓存

### FileCache

基于文件系统的缓存，数据持久化到磁盘。

```typescript
import { FileCache } from '@cat-kit/be'

// 创建缓存
const cache = new FileCache<CacheData>({
  dir: './cache',
  ttl: 86400000, // 24小时过期
  extension: '.json' // 文件扩展名（可选）
})

// 设置值
await cache.set('key', data)
await cache.set('key2', data2, 3600000) // 1小时过期

// 获取值
const data = await cache.get('key')

// 删除
await cache.delete('key')

// 清空
await cache.clear()
```

#### API

```typescript
class FileCache<V> {
  constructor(options: FileCacheOptions)

  get(key: string): Promise<V | undefined>
  set(key: string, value: V, ttl?: number): Promise<void>
  delete(key: string): Promise<boolean>
  clear(): Promise<void>
}
```

**选项：**

- `dir` - 缓存目录路径
- `ttl` - 默认过期时间（毫秒），可选
- `extension` - 文件扩展名，默认 `'.json'`

**特性：**

- 数据持久化到磁盘
- 支持 TTL，过期项自动删除
- 键名会进行 URL 编码以确保文件系统安全

## 函数记忆化

### memoize

为函数添加缓存能力，自动缓存函数结果。

```typescript
import { memoize } from '@cat-kit/be'

// 基础用法
const fetchUser = memoize(async (id: number) => {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
})

// 使用缓存
const user = await fetchUser(1) // 第一次调用，执行函数
const user2 = await fetchUser(1) // 从缓存返回

// 访问缓存
fetchUser.cache.set('custom-key', user)
const cached = fetchUser.cache.get('custom-key')

// 清空缓存
fetchUser.clear()
```

#### 高级用法

```typescript
import { memoize, LRUCache } from '@cat-kit/be'

// 自定义缓存
const cache = new LRUCache<string, User>({ maxSize: 50 })

const fetchUser = memoize(async (id: number) => {
  return await getUserFromDB(id)
}, {
  cache, // 使用自定义缓存
  resolver: (id) => `user:${id}`, // 自定义键生成
  ttl: 300000 // 5分钟过期
})

// 自定义键解析器
const expensiveFunction = memoize(
  (a: number, b: number) => a + b,
  {
    resolver: (a, b) => `${a}-${b}` // 自定义键格式
  }
)
```

#### API

```typescript
function memoize<F extends (...args: any[]) => any>(
  fn: F,
  options?: MemoizeOptions<F, unknown>
): F & {
  cache: CacheAdapter<unknown, Awaited<ReturnType<F>>>
  clear(): void
}
```

**选项：**

- `cache` - 自定义缓存适配器，默认使用 `LRUCache`
- `resolver` - 键解析函数，默认使用 JSON.stringify
- `ttl` - 缓存过期时间（毫秒），可选

**返回值：**

- 带缓存功能的函数，并附带 `cache` 和 `clear` 属性

**特性：**

- 自动缓存函数结果
- 支持异步函数
- 支持自定义缓存和键解析
- 支持 TTL

## 使用示例

### API 响应缓存

```typescript
import { LRUCache } from '@cat-kit/be'

const apiCache = new LRUCache<string, ApiResponse>({
  maxSize: 1000,
  ttl: 300000 // 5分钟
})

async function fetchApi(url: string) {
  const cached = apiCache.get(url)
  if (cached) {
    return cached
  }

  const response = await fetch(url)
  const data = await response.json()

  apiCache.set(url, data)
  return data
}
```

### 数据库查询缓存

```typescript
import { memoize, TTLCache } from '@cat-kit/be'

const queryCache = new TTLCache<string, QueryResult>({
  ttl: 60000, // 1分钟
  cleanupInterval: 30000
})

const cachedQuery = memoize(async (sql: string) => {
  return await db.query(sql)
}, {
  cache: queryCache,
  resolver: (sql) => `query:${hash(sql)}`
})
```

### 文件缓存

```typescript
import { FileCache } from '@cat-kit/be'

const fileCache = new FileCache<ProcessedData>({
  dir: './cache/processed',
  ttl: 86400000 // 24小时
})

async function processFile(filePath: string) {
  const cacheKey = `file:${filePath}`

  const cached = await fileCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const processed = await doProcess(filePath)
  await fileCache.set(cacheKey, processed)

  return processed
}
```

### 组合使用

```typescript
import { LRUCache, TTLCache, memoize } from '@cat-kit/be'

// 热点数据使用 LRU
const hotCache = new LRUCache({ maxSize: 100 })

// 临时数据使用 TTL
const tempCache = new TTLCache({ ttl: 60000 })

// 函数记忆化
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

