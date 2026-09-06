---
title: "@cat-kit/be 缓存"
description: "进程内 LRU 缓存、磁盘文件缓存与函数结果记忆化"
keywords:
  - LRUCache
  - FileCache
  - memoize
  - CacheAdapter
  - TTL
  - 文件缓存
  - 函数记忆化
  - LRU 淘汰
aliases:
  - node-cache
  - lru-cache
  - memoize
  - 缓存
---

# 缓存

缓存模块提供三种能力：进程内 `LRUCache`（最近最少使用淘汰 + TTL 过期）、基于文件系统的 `FileCache`（持久化 + TTL）、以及函数结果记忆化 `memoize`（相同参数直接返回缓存值）。

详情见 [API](apis.md) 与 [示例](examples.md)。

## 注意事项

- `LRUCache` 容量超限自动淘汰最久未使用项；`ttl: 0` 表示不过期
- `FileCache` 的 `ttl: 0` 立即过期；`get` 命中过期文件会自动删除
- `FileCache.delete()` 对缺失键也可能返回 `true`（实现调用强制删除）
- `memoize`：单参用 `String(arg)` 作键，多参用 `JSON.stringify`；异步结果在 fulfilled 后缓存；并发相同调用不合并；拒绝（rejected）结果不缓存
- `memoize` 返回值附带 `cache`（`CacheAdapter`）与 `clear()`，可自定义键解析（`resolver`）与缓存实现（`cache`）

## 类型定义

- `LRUCache`、`LRUCacheOptions`
- `FileCache`、`FileCacheOptions`
- `memoize`、`MemoizeOptions`、`CacheAdapter`
