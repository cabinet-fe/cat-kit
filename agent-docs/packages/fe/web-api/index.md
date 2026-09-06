---
title: "@cat-kit/fe Web API"
description: 剪贴板读写与浏览器权限预查
keywords:
  - 剪贴板
  - clipboard
  - readText
  - queryPermission
  - 权限预查
  - 复制文本
  - Blob 复制
  - clipboard-write
aliases:
  - clipboard api
  - navigator.clipboard
  - 浏览器权限
  - copy paste
---

# fe — Web API

`@cat-kit/fe` 的 Web API 模块封装了系统剪贴板（`clipboard`：写入文本/Blob、读取内容）与权限预查（`queryPermission`：只查询浏览器权限状态，不发起授权请求）。

## 适用场景

读写剪贴板，或预查浏览器权限状态（不发起授权请求）。

## 推荐 API

`clipboard`、`queryPermission`

```ts
import { clipboard, queryPermission } from '@cat-kit/fe'

await clipboard.copy('done')
const text = await clipboard.readText()
const ok = await queryPermission('clipboard-write')
```

完整签名见 [apis.md](apis.md)。

## 注意事项

- `queryPermission`：仅 `denied` 返回 `false`；`prompt` 返回 `true`；查询失败视为可用（`true`）；**不**弹出授权
- 文本复制旧回退路径（`document.execCommand('copy')`）会对文本使用 `JSON.stringify`，粘贴结果可能带引号
- 浏览器不支持 Clipboard API 时：非字符串数据 `copy` 直接拒绝；`read`/`readText` 抛错
