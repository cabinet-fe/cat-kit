---
title: "@cat-kit/be 缓存模块总览"
description: "@cat-kit/be 缓存模块总览：进程内 LRUCache（LRU 淘汰 + TTL）、持久化 FileCache（文件系统 + TTL）与函数记忆化 memoize 的选型与文档入口。"
aliases: [cache, 缓存, LRU 缓存, 文件缓存, 函数记忆化]
keywords: [LRUCache, FileCache, memoize, CacheAdapter, LRUCacheOptions, FileCacheOptions, MemoizeOptions, maxSize, ttl, resolver, 缓存, LRU 淘汰, 过期时间, 记忆化, 磁盘缓存]
---

# @cat-kit/be 缓存模块总览

缓存模块从 `@cat-kit/be` 包根导出三个工具：进程内 `LRUCache`（容量淘汰 + TTL 过期）、持久化到磁盘的 `FileCache`（文件系统 + TTL 过期）、函数记忆化 `memoize`（相同参数直接返回缓存值）。三者共享 `CacheAdapter` 适配器接口，`memoize` 可替换为任意自定义缓存实现。

## 安装

```bash
bun add @cat-kit/be
```

缓存相关导出从包根导入：

```ts
import { LRUCache, FileCache, memoize } from '@cat-kit/be'
```

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `LRUCache` | 进程内 LRU 缓存类：容量满时淘汰最久未使用项，支持构造级与逐条 TTL | `packages/be/cache/apis.md` |
| `LRUCacheOptions` | `LRUCache` 构造选项：`maxSize`（默认 `100`）、`ttl` | `packages/be/cache/apis.md` |
| `FileCache` | 基于文件系统的持久化缓存类：值序列化为 JSON 文件，支持 TTL | `packages/be/cache/apis.md` |
| `FileCacheOptions` | `FileCache` 构造选项：`dir`（必填）、`ttl`、`extension`（默认 `'.json'`） | `packages/be/cache/apis.md` |
| `memoize` | 函数记忆化：缓存同步返回值与异步结果，附带 `cache` 与 `clear()` | `packages/be/cache/apis.md` |
| `MemoizeOptions` | `memoize` 选项：`cache`、`resolver`、`ttl` | `packages/be/cache/apis.md` |
| `CacheAdapter` | 缓存适配器接口：`get` / `set` / `has` / `delete` / `clear` | `packages/be/cache/apis.md` |

选型规则：数据只需进程内存活用 `LRUCache`；进程重启后还要命中用 `FileCache`；要缓存「函数调用结果」而不是手工管理键值用 `memoize`。完整签名与示例见 `packages/be/cache/apis.md`，端到端场景见 `packages/be/cache/examples.md`。
