---
title: "@cat-kit/be 缓存 API（LRUCache FileCache memoize）"
description: "@cat-kit/be 缓存模块 API 参考：LRUCache 进程内 LRU 缓存、FileCache 磁盘持久化缓存、memoize 函数记忆化，含 TTL 过期、容量淘汰与自定义缓存适配器。"
aliases: [LRU 缓存, 文件缓存, 记忆化缓存, node-cache, lru-cache, memoize]
keywords: [LRUCache, FileCache, memoize, CacheAdapter, LRUCacheOptions, FileCacheOptions, MemoizeOptions, maxSize, ttl, resolver, extension, LRU 淘汰, 缓存过期, 磁盘缓存, 函数记忆化, 缓存持久化, 命中缓存]
---

# @cat-kit/be 缓存 API（LRUCache FileCache memoize）

`@cat-kit/be` 导出三个缓存工具：类 `LRUCache`（进程内 LRU 缓存）、类 `FileCache`（文件系统持久化缓存）、函数 `memoize`（函数记忆化），以及接口 `CacheAdapter`（自定义缓存实现）。全部为同步导入，`FileCache` 的实例方法为异步。

## 快速上手

```ts
import { LRUCache } from '@cat-kit/be'

// 最多 100 条，默认 60 秒过期
const cache = new LRUCache<string, number>({ maxSize: 100, ttl: 60_000 })

cache.set('a', 1)
console.log(cache.get('a')) // => 1（get 会刷新该条的使用顺序）
console.log(cache.has('a')) // => true
console.log(cache.size) // => 1

cache.delete('a')
console.log(cache.get('a')) // => undefined
```

## API 签名

```ts
export interface LRUCacheOptions {
  /** 最大缓存容量，小于 1 时按 1 处理。默认 100 */
  maxSize?: number
  /** 默认过期时间（毫秒）；不指定时条目永不过期 */
  ttl?: number
}

/**
 * 进程内 LRU 缓存。容量超限自动淘汰最久未使用项。
 * 键与值类型由泛型决定；所有实例方法均为同步。
 */
export class LRUCache<K, V> {
  constructor(options?: LRUCacheOptions)
  /** 读取并刷新使用顺序；不存在或已过期返回 undefined，过期条目被立即删除 */
  get(key: K): V | undefined
  /** 判断键存在且未过期；过期条目被立即删除并返回 false */
  has(key: K): boolean
  /** 写入条目；容量超限淘汰最久未使用项；同键覆盖旧值并重新计时 */
  set(key: K, value: V, ttl?: number): void
  /** 删除条目；键存在返回 true，否则 false */
  delete(key: K): boolean
  /** 清空全部条目 */
  clear(): void
  /** 全部键的迭代器（包含已过期键） */
  keys(): IterableIterator<K>
  /** 未过期值的迭代器（惰性过滤过期项） */
  values(): IterableIterator<V>
  /** 条目数量（包含已过期但未被访问的条目） */
  get size(): number
}

export interface FileCacheOptions {
  /** 缓存目录路径。必填 */
  dir: string
  /** 默认过期时间（毫秒）；不指定时条目永不过期 */
  ttl?: number
  /** 缓存文件后缀。默认 '.json' */
  extension?: string
}

/**
 * 文件系统持久化缓存。每个键对应一个 JSON 文件（键经 encodeURIComponent 编码）。
 * 所有实例方法均为异步。
 */
export class FileCache<V> {
  constructor(options: FileCacheOptions)
  /** 读取条目；不存在或已过期返回 undefined，过期文件被自动删除 */
  get(key: string): Promise<V | undefined>
  /** 写入条目；目录不存在自动创建 */
  set(key: string, value: V, ttl?: number): Promise<void>
  /** 删除条目对应的缓存文件 */
  delete(key: string): Promise<boolean>
  /** 删除整个缓存目录并重建 */
  clear(): Promise<void>
}

export interface CacheAdapter<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V, ttl?: number): void
  has(key: K): boolean
  delete(key: K): boolean
  clear(): void
}

export interface MemoizeOptions<F extends (...args: any[]) => any, K> {
  /** 自定义缓存实现。默认内部 new LRUCache() */
  cache?: CacheAdapter<K, Awaited<ReturnType<F>>>
  /** 缓存键解析函数。默认：单参 String(arg)，多参 JSON.stringify(args) */
  resolver?: (...args: Parameters<F>) => K
  /** 缓存过期时间（毫秒），写入缓存时传入 */
  ttl?: number
}

/**
 * 函数记忆化。返回原函数，附带 cache 与 clear 两个属性。
 * 异步函数在 Promise 完成后缓存结果值；抛错（throw 或 reject）不缓存。
 */
export function memoize<F extends (...args: any[]) => any>(
  fn: F,
  options?: MemoizeOptions<F, unknown>
): F & { cache: CacheAdapter<unknown, Awaited<ReturnType<F>>>; clear(): void }
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `maxSize` | `number` | `100` | 否 | 最小取 1，传入 `0` 或负数按 `1` 处理 |
| `ttl`（LRUCache 构造） | `number` | 无 | 否 | 毫秒；不传则条目永不过期；`0` 同样表示不过期 |
| `ttl`（`set` 第三参） | `number` | 构造时的 `ttl` | 否 | 逐条覆盖默认过期时间 |
| `dir` | `string` | — | 是 | 目录不存在时 `set` 自动创建 |
| `ttl`（FileCache 构造） | `number` | 无 | 否 | 毫秒；`0` 表示立即过期（与 `LRUCache` 不同） |
| `extension` | `string` | `'.json'` | 否 | 缓存文件后缀，键经 `encodeURIComponent` 后拼接后缀作为文件名 |
| `cache` | `CacheAdapter<K, V>` | 内部 `LRUCache` | 否 | 必须实现 `get` / `set` / `has` / `delete` / `clear` 五个同步方法 |
| `resolver` | `(...args) => K` | `String` / `JSON.stringify` | 否 | 返回值作为缓存键；参数不同的调用视为不同键 |
| `ttl`（memoize） | `number` | 无 | 否 | 毫秒；写入缓存条目时的过期时间 |

## 方法与事件

`LRUCache` 实例方法全部为同步，均不抛错：

- `get(key)`：返回 `V | undefined`；命中时把该条移到最新位置（刷新 LRU 顺序）
- `has(key)`：返回 `boolean`；不刷新 LRU 顺序（仅 `get` 刷新），过期条目被立即删除并返回 `false`
- `set(key, value, ttl?)`：返回 `void`；无抛错路径
- `delete(key)` / `clear()` / `keys()` / `values()` / `size`：见上方签名

`FileCache` 实例方法全部为异步（返回 `Promise`）：

- `get(key)`：resolve `V | undefined`；文件读取失败且错误码非 `ENOENT` 时 reject
- `set(key, value, ttl?)`：resolve `void`；写入失败时 reject
- `delete(key)`：resolve `boolean`；文件不存在也返回 `true`，仅非 `ENOENT` 错误时 reject
- `clear()`：resolve `void`；目录删除或重建失败时 reject

`memoize` 返回值：

- 调用行为与原函数一致（保留 `this`）；返回类型 `F`
- `memoized.cache`：实际使用的 `CacheAdapter`，可检查或手工操作缓存
- `memoized.clear()`：清空全部缓存；同步，无返回值

## 典型示例

### LRU 容量淘汰与逐条 TTL

```ts
import { LRUCache } from '@cat-kit/be'

const cache = new LRUCache<string, number>({ maxSize: 2 })

cache.set('a', 1)
cache.set('b', 2)
cache.get('a') // 刷新 a 的使用顺序
cache.set('c', 3) // 容量超限，淘汰最久未使用的 b

console.log(cache.has('a')) // => true
console.log(cache.has('b')) // => false

// 逐条 TTL：short 50ms 过期，long 走默认（未设则永不过期）
const timed = new LRUCache<string, string>({ ttl: 1000 })
timed.set('short', 'v1', 50)
timed.set('long', 'v2')

setTimeout(() => {
  console.log(timed.get('short')) // => undefined
  console.log(timed.get('long')) // => 'v2'
}, 100)
```

### FileCache 磁盘持久化

```ts
import { FileCache } from '@cat-kit/be'

interface Session {
  userId: string
  expiresAt: number
}

// 目录不存在会在首次 set 时自动创建
const sessions = new FileCache<Session>({ dir: './.cache/sessions', ttl: 3_600_000 })

try {
  await sessions.set('sess-1', { userId: 'u1', expiresAt: Date.now() + 60_000 })
  const hit = await sessions.get('sess-1')
  console.log(hit?.userId) // => 'u1'
} catch (err) {
  console.error('缓存读写失败', err) // 磁盘 IO 错误在此捕获
}

// 进程重启后再次 new FileCache 并 get 同一键仍能命中（未过期时）
const missing = await sessions.get('no-such-key')
console.log(missing) // => undefined
```

### memoize 缓存异步结果

```ts
import { memoize } from '@cat-kit/be'

let calls = 0
const fetchUser = memoize(
  async (id: string) => {
    calls++
    return { id, name: `user-${id}` }
  },
  { ttl: 60_000, resolver: (id: string) => `user:${id}` }
)

const first = await fetchUser('42')
const second = await fetchUser('42') // 命中缓存，原函数不再执行
console.log(calls) // => 1
console.log(second.name) // => 'user-42'
console.log([...fetchUser.cache.keys()]) // => ['user:42']

// 失败不缓存：reject 后的再次调用会重新执行原函数
const failing = memoize(async () => {
  throw new Error('boom')
})
try {
  await failing()
} catch (err) {
  console.log((err as Error).message) // => 'boom'
}
fetchUser.clear() // 清空全部缓存
```

## 注意事项

> [!WARNING]
> - `LRUCache` 与 `FileCache` 的 `ttl: 0` 语义相反：`LRUCache` 中 `0` 表示永不过期，`FileCache` 中 `0` 表示立即过期。
> - 本库 `FileCache` 没有 `has()` 方法，判断条目存在用 `await cache.get(key) !== undefined`，不是 `has`。
> - 本库 `FileCache.delete()` 对不存在的键返回 `true`，不是 `false`（内部用 `force` 删除，`ENOENT` 不报错）。
> - 本库 `LRUCache.has()` 不刷新使用顺序，`get()` 刷新；依赖访问顺序做淘汰时以 `get` 为准。
> - 本库 `memoize` 缓存的是完成后的值：并发相同参数的调用不合并，Promise 未完成前的重复调用会重复执行原函数；这与 lodash `memoize` 缓存 Promise 本身的行为不同。
> - 本库 `memoize` 的默认键：单参 `String(arg)`，多参 `JSON.stringify(args)`；对象参数每次字面量不同即视为不同键。

## 常见问题

### 相同参数的异步函数被执行了两次

原因：第一次调用返回的 Promise 尚未完成时发起了第二次调用，`memoize` 只缓存已完成的结果。修复：复用第一次调用返回的 Promise。

```ts
import { memoize } from '@cat-kit/be'

const fetchConfig = memoize(async (name: string) => {
  const res = await fetch(`https://example.com/config/${name}`)
  return res.json()
})

// 调用方保存并复用同一个 Promise，并发期间只执行一次
const pending = fetchConfig('app')
const [a, b] = await Promise.all([pending, pending])
console.log(a === b) // => true
```

### `FileCache.delete` 返回了 `true` 但文件本就不存在

原因：`delete` 内部忽略 `ENOENT`，对缺失键恒返回 `true`。返回值不能用于判断条目是否存在；需要判断时用 `get`。

```ts
import { FileCache } from '@cat-kit/be'

const cache = new FileCache<string>({ dir: './.cache' })
await cache.set('k', 'v')
console.log(await cache.delete('missing')) // => true（不代表删除过东西）
console.log((await cache.get('k')) !== undefined) // => true（用 get 判断存在）
```
