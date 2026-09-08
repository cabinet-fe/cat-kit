---
title: "web-api 剪贴板与权限查询"
description: "@cat-kit/fe 的 Web API 模块：clipboard 对象写入文本/Blob 到系统剪贴板并读取内容（不支持时回退 execCommand），queryPermission 预查浏览器权限状态（仅 denied 返回 false，不发起授权弹窗）。"
aliases: [clipboard api, navigator.clipboard, 剪贴板, 浏览器权限, web api 封装]
keywords: [clipboard, copy, read, readText, queryPermission, WebPermissionName, clipboard-write, clipboard-read, 剪贴板复制, 复制文本, 读取剪贴板, 权限预查, execCommand]
---

# web-api 剪贴板与权限查询

`@cat-kit/fe` 的 `web-api` 模块导出 `clipboard` 与 `queryPermission`：`clipboard.copy` 写入字符串、`Blob` 或两者混合数组到系统剪贴板（优先 `navigator.clipboard.write`，缺失时字符串走 `document.execCommand('copy')` 回退），`clipboard.read` / `readText` 读取剪贴板内容；`queryPermission` 查询指定权限的浏览器状态，只有 `denied` 返回 `false`，查询失败也视为可用，且从不触发授权弹窗。

## 安装

```bash
npm install @cat-kit/fe
```

全部导出仅从包根提供：`import { clipboard, queryPermission } from '@cat-kit/fe'`。

运行前提：`navigator.clipboard` 只在安全上下文（HTTPS 或 `localhost`）存在；非安全环境下 `copy` 的字符串走 `execCommand` 回退，`read` / `readText` 抛错。`queryPermission` 依赖 `navigator.permissions`，缺失时返回 `true`。

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `clipboard` | 剪贴板对象：`copy`（写入文本/Blob/数组）、`read`（读取全部 Blob）、`readText`（读取纯文本） | `packages/fe/web-api/apis.md` |
| `queryPermission` | `queryPermission(name)` 查询权限状态，返回 `Promise<boolean>`，不发起授权 | `packages/fe/web-api/apis.md` |
| `WebPermissionName` | 权限名类型：`PermissionName \| 'clipboard-read' \| 'clipboard-write'`（类型） | `packages/fe/web-api/apis.md` |
