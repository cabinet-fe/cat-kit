# be — 缓存

## 何时使用

需要限制进程内缓存容量、跨进程重启保留 JSON 缓存，或缓存函数结果时使用。

## 如何选择

- `LRUCache<K, V>`：同步、进程内缓存；支持最大条目数和全局/单条 TTL。
- `FileCache<V>`：异步文件缓存；适合可 JSON 序列化且允许磁盘 I/O 的值。
- `memoize(fn, options?)`：按参数缓存同步或异步函数结果；可自定义键解析器和同步 `CacheAdapter`。

## 最小示例

```ts
import { LRUCache } from '@cat-kit/be'

const users = new LRUCache<string, { name: string }>({ maxSize: 500, ttl: 5 * 60_000 })

users.set('user:1', { name: 'Mimi' })
const user = users.get('user:1')
```

## 约束与边界

- `LRUCache` 默认最多 100 条；`get` 会刷新最近使用顺序，过期项在访问时失效。
- `FileCache` 的 `get`、`set`、`delete`、`clear` 都必须 `await`；值必须能由 JSON 正确往返。
- `memoize` 默认单参数键为 `String(arg)`，多参数键为 `JSON.stringify(args)`；对象身份敏感或不可序列化参数应提供 `resolver`。
- 异步函数只在 Promise 成功完成后写入缓存；同一键的并发首次调用仍可能重复执行。
- 这些缓存只提供本地存储，不提供分布式一致性。

## 精确类型入口

[LRUCache](../../generated/be/cache/lru-cache.d.ts) · [FileCache](../../generated/be/cache/file-cache.d.ts) · [memoize](../../generated/be/cache/memoize.d.ts)
