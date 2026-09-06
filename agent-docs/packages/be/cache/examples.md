---
title: "@cat-kit/be 缓存示例"
description: "LRU、文件缓存与 memoize 的基本用法"
keywords:
  - LRUCache
  - FileCache
  - memoize
  - maxSize
  - ttl
  - 文件缓存
  - 函数记忆化
  - 磁盘持久化缓存
aliases:
  - 缓存示例
  - node-cache
  - lru-cache
  - memoize
---

# 缓存示例

三种缓存的典型用法：进程内 LRU、磁盘持久化缓存、函数记忆化。

```ts
import { FileCache, LRUCache, memoize } from '@cat-kit/be'

const memory = new LRUCache<string, number>({ maxSize: 100, ttl: 60_000 })
memory.set('a', 1)

const disk = new FileCache<string>({ dir: './.cache' })
await disk.set('user:1', 'alice')

const loadUser = memoize(async (id: string) => ({ id }), { ttl: 60_000 })
await loadUser('1')
loadUser.clear()
```

相关文档：[缓存](index.md)、[缓存 API](apis.md)。
