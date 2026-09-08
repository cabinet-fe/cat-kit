---
title: "storage 本地存储与 Cookie"
description: "@cat-kit/fe 的存储模块：storage.local / storage.session 提供带过期时间（秒）与类型化键的 Web Storage 封装，storageKey 创建类型化键，cookie 提供 set/get/remove/has/getAll/clear 六个 Cookie 操作。"
aliases: [browser storage, 本地存储, 本地缓存, cookie 封装, web storage]
keywords: [storage, storageKey, StorageKey, ExtractStorageKey, cookie, CookieOptions, localStorage, sessionStorage, 过期时间, 类型化存储, 键值存取, 批量读取, 缓存监听]
---

# storage 本地存储与 Cookie

`@cat-kit/fe` 的 `storage` 模块导出两块能力：`storage`（`storage.local` / `storage.session` 两个入口）封装 `localStorage` / `sessionStorage`，支持秒级过期时间、默认值、批量读取与键级变更回调，键通过 `storageKey<T>()` 携带类型信息；`cookie` 封装 `document.cookie` 的设置、读取、删除、存在性检查与清空。

## 安装

```bash
npm install @cat-kit/fe
```

全部导出仅从包根提供：`import { storage, storageKey, cookie } from '@cat-kit/fe'`。

运行前提：浏览器环境。首次访问 `storage.local` / `storage.session` 时会读取全局 `localStorage` / `sessionStorage`，非浏览器环境抛 `ReferenceError: localStorage is not defined`；`cookie` 依赖 `document.cookie`。

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `storage` | 存储入口：`storage.local`（localStorage）与 `storage.session`（sessionStorage），实例支持 `set` / `get` / `getExpire` / `remove` / `on` / `off` | `packages/fe/storage/apis.md` |
| `storageKey` | `storageKey<T>(str)` 创建类型化键 `StorageKey<T>`，运行时就是字符串 | `packages/fe/storage/apis.md` |
| `StorageKey` | 类型化键类型（类型） | `packages/fe/storage/apis.md` |
| `ExtractStorageKey` | `StorageKey<T> -> T` 工具类型，批量 `get` 返回值用（类型） | `packages/fe/storage/apis.md` |
| `cookie` | Cookie 对象：`set` / `get` / `remove` / `has` / `getAll` / `clear` | `packages/fe/storage/apis.md` |
| `CookieOptions` | Cookie 选项：`expires` / `path` / `domain` / `secure` / `sameSite`（类型） | `packages/fe/storage/apis.md` |
