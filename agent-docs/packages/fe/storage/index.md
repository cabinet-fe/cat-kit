---
title: "@cat-kit/fe 浏览器存储"
description: 类型化 localStorage 与 sessionStorage 封装，以及 Cookie 读写
---

# fe — 浏览器存储

`@cat-kit/fe` 的存储模块提供类型化 Web Storage 封装（`storage`，基于 `storageKey` 带过期时间的键值存取）与 Cookie 管理（`cookie`）。`storageKey<T>` 给键附加类型信息，读写时自动校验值类型。

## 何时使用

需要带过期时间的类型化 `localStorage`/`sessionStorage`，或管理可由 JavaScript 访问的 Cookie。

## 推荐公开 API

`storage`、`storageKey`、`cookie`

```ts
import { cookie, storage, storageKey } from '@cat-kit/fe'

const TOKEN = storageKey<string>('token')
storage.local.set(TOKEN, 'abc', 3600) // 过期单位为秒，0 表示不过期
storage.local.get(TOKEN)
cookie.set('theme', 'dark', { expires: 86400 })
```

完整签名见 [apis.md](apis.md)。

## 约束

- 过期单位为**秒**；`0` 表示不过期
- `null`/函数/symbol/`undefined` 等会静默跳过；`bigint` 可能在 JSON 序列化时抛错
- `storageKey` 运行时只是字符串
- `cookie.clear()` 只能清 `document.cookie` 可见项，无法可靠删除不同 path/domain 创建的 cookie

## 类型声明

[storage.d.ts](../../../../packages/fe/dist/storage/storage.d.ts) · [cookie.d.ts](../../../../packages/fe/dist/storage/cookie.d.ts)
