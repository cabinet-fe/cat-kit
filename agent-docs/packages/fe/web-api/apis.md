---
title: "@cat-kit/fe Web API 签名"
description: clipboard 对象与 queryPermission 的类型签名
keywords:
  - clipboard
  - copy
  - read
  - readText
  - queryPermission
  - WebPermissionName
  - 剪贴板复制
  - 权限查询
aliases:
  - clipboard api
  - 剪贴板签名
  - navigator.clipboard
  - web api types
---

# Web API — API

本篇列出 `@cat-kit/fe` Web API 模块的公共类型签名。

```ts
declare const clipboard: {
  copy(data: string | Blob | Array<string | Blob>): Promise<void>
  read(): Promise<Blob[]>
  readText(): Promise<string>
}

type WebPermissionName = PermissionName | 'clipboard-read' | 'clipboard-write'

declare function queryPermission(name: WebPermissionName): Promise<boolean>
```

## 说明

- `clipboard.copy`：接受字符串、`Blob` 或两者混合的数组；需要 `clipboard-write` 权限（Chrome 等浏览器会自动尝试查询）
- `clipboard.read`：返回剪贴板内全部条目的 `Blob` 列表（按 MIME 类型逐个取出）
- `clipboard.readText`：返回剪贴板纯文本
- `queryPermission`：仅 `denied` 状态返回 `false`，`prompt` 视为可用；查询异常时视为可用；不会触发授权弹窗
