---
title: "@cat-kit/be 热点数据与磁盘持久化缓存场景"
description: 用 @cat-kit/be 为后端服务搭建两级缓存：LRUCache 承接热点键的进程内读取，FileCache 把构建产物持久化到磁盘跨进程复用，memoize 去重昂贵的查询函数。
aliases: [两级缓存, 缓存场景, 热点缓存, 磁盘缓存]
keywords: [LRUCache, FileCache, memoize, ttl, maxSize, resolver, clear, 热点数据, 磁盘持久化, 缓存过期, 缓存淘汰, 函数记忆化, 读多写少, 构建缓存]
---

# @cat-kit/be 热点数据与磁盘持久化缓存场景

本方案为一个读多写少的服务接入缓存：进程内用 `LRUCache` 承接热点键，磁盘用 `FileCache` 让缓存跨进程重启存活，查询函数用 `memoize` 自动去重。全部 API 来自 `@cat-kit/be` 包根导出。

## 场景

- 何时用本方案：同一份数据被反复读取（热点配置、会话、构建产物），且可接受过期窗口内的旧值。
- 何时不用：数据每次都必须是最新的（如支付扣款结果），缓存会返回旧值——这类调用不应缓存；需要跨机器共享缓存时本模块只覆盖单机，改用外部缓存服务。

## 完整示例

```ts
// src/cache-service.ts
import { FileCache, LRUCache, memoize } from '@cat-kit/be'

interface Product {
  id: string
  name: string
  price: number
}

// 假装这是一次昂贵的数据库查询
async function queryProduct(id: string): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return { id, name: `product-${id}`, price: 100 }
}

// 第一级：磁盘缓存，进程重启后仍可命中，1 小时过期
const disk = new FileCache<Product>({ dir: './.cache/products', ttl: 3_600_000 })

// 第二级：进程内 LRU，最多 500 条，5 分钟过期
const memory = new LRUCache<string, Product>({ maxSize: 500, ttl: 300_000 })

// memoize 挡住并发同参查询：Promise 未完成期间的重复调用虽会重复执行，
// 但完成后的同参调用全部命中缓存
let dbCalls = 0
const loadProduct = memoize(
  async (id: string): Promise<Product> => {
    // 先查两级缓存，都未命中才回源
    const fromMemory = memory.get(id)
    if (fromMemory !== undefined) return fromMemory

    const fromDisk = await disk.get(id)
    if (fromDisk !== undefined) {
      memory.set(id, fromDisk)
      return fromDisk
    }

    dbCalls++
    const product = await queryProduct(id)
    memory.set(id, product)
    await disk.set(id, product)
    return product
  },
  { resolver: (id: string) => id, ttl: 300_000 }
)

async function main(): Promise<void> {
  try {
    const first = await loadProduct('p1')
    const second = await loadProduct('p1') // 命中 memoize 缓存，不回源
    console.log(first.name, second.name) // => 'product-p1 product-p1'
    console.log(dbCalls) // => 1

    // 数据更新时主动失效两级缓存
    await disk.delete('p1')
    memory.delete('p1')
    loadProduct.clear()
  } catch (err) {
    console.error('缓存链路失败，降级为直接回源', err)
  }
}

void main()
```

运行：

```bash
bun run src/cache-service.ts
```

输出：

```text
product-p1 product-p1
1
```

进程退出后重新运行：`.cache/products/p1.json` 已存在，`dbCalls` 保持 `1`，第二次运行不再回源。

## 要点说明

- `LRUCache({ maxSize: 500, ttl: 300_000 })`：容量与时间是两条独立的淘汰线，任一触发即失效；`get` 命中会刷新该条的使用顺序，`has` 不会。
- `FileCache({ dir, ttl })` 的 `dir` 不存在时在首次 `set` 自动创建；`get` 命中过期文件会顺手删除该文件。
- `memoize` 的 `resolver: (id) => id` 显式声明键规则；不传时单参数默认用 `String(arg)`，本例效果相同，显式写出可避免将来改成多参后键规则漂移。
- 失效要清三层：`disk.delete`、`memory.delete`、`loadProduct.clear()`，漏掉任何一层都会读到旧值。
- 磁盘缓存读写都放在 `try` 内：`FileCache` 非 `ENOENT` 的 IO 错误会 reject，捕获后可降级为直接回源。

## 注意事项

> [!WARNING]
> - 本库 `FileCache` 的 `ttl: 0` 是立即过期，`LRUCache` 的 `ttl: 0` 是永不过期——两级缓存写同一配置值时会表现相反。
> - 本库 `memoize` 不合并并发相同参数的调用；要挡住并发风暴必须在 `Promise.all` 侧复用同一个 Promise，或接受回源多次。
> - 本库 `FileCache` 把值整个序列化为单个 JSON 文件，禁止用来存大对象集合（一个键一个文件）；大量小键值才适合。
> - 本库 `LRUCache` 的 `size` 包含已过期但未被访问的条目；清理过期项靠访问触发，没有后台扫描线程。
