---
title: "@cat-kit/fe 前端浏览器工具库总览"
description: 浏览器专用工具库：虚拟滚动列表 Virtualizer、数值补间 Tween、文件分块读取 readChunks 与下载 saveBlob、带过期时间的本地存储 storage、Cookie 工具 cookie、剪贴板 clipboard 与权限查询 queryPermission。
aliases: [fe, cat-kit fe, 前端工具包, 浏览器工具库, fe utils]
keywords: [Virtualizer, Tween, tweenEasings, storage, storageKey, cookie, clipboard, queryPermission, readChunks, saveBlob, 虚拟滚动, 数值补间, 分块读取, 文件下载, 本地存储, 剪贴板, 权限查询]
---

# @cat-kit/fe 前端浏览器工具库总览

`@cat-kit/fe`（当前版本 1.2.1）是浏览器专用工具库，从包根统一导出五个模块的能力：虚拟滚动（`virtualizer`）、数值补间（`tween`）、文件读取与下载（`file`）、键值存储与 Cookie（`storage`）、剪贴板与权限查询（`web-api`）。所有 API 依赖 DOM 与浏览器 Web API，不适用于 Node.js 服务端；基础类型工具来自依赖包 `@cat-kit/core`。

## 安装

```bash
npm install @cat-kit/fe
```

```bash
pnpm add @cat-kit/fe
```

```bash
bun add @cat-kit/fe
```

全部导出仅从包根提供，统一用 `import { xxx } from '@cat-kit/fe'` 导入；包内不提供子路径导出。

```ts
import { Virtualizer, Tween, storage, cookie, clipboard, readChunks, saveBlob, queryPermission } from '@cat-kit/fe'
```

## 模块速查

| 模块 | 导出名 | 说明 | 文档路径 |
| --- | --- | --- | --- |
| virtualizer | `Virtualizer` | 虚拟滚动列表类：只渲染可视区，支持动态测量与滚动定位 | `packages/fe/virtualizer/apis.md` |
| virtualizer | `VirtualizerOptions` | `Virtualizer` 构造参数（类型） | `packages/fe/virtualizer/apis.md` |
| virtualizer | `VirtualSnapshot` | 虚拟化快照：`items` / `totalSize` / `beforeSize` / `afterSize` 等（类型） | `packages/fe/virtualizer/apis.md` |
| virtualizer | `VirtualItem` | 单个虚拟项的位置与尺寸（类型） | `packages/fe/virtualizer/apis.md` |
| virtualizer | `VirtualRange` | 不含 buffer 的可视区索引范围（类型） | `packages/fe/virtualizer/apis.md` |
| virtualizer | `VirtualAlign` | `scrollToIndex` 对齐方式：`'auto' \| 'start' \| 'center' \| 'end'`（类型） | `packages/fe/virtualizer/apis.md` |
| virtualizer | `VirtualizerSubscriber` | `subscribe` 回调签名（类型） | `packages/fe/virtualizer/apis.md` |
| virtualizer | `EstimateSize` | 未测项尺寸估值函数（类型） | `packages/fe/virtualizer/apis.md` |
| virtualizer | `GetItemKey` | 按 index 返回稳定 key 的函数（类型） | `packages/fe/virtualizer/apis.md` |
| virtualizer | `VirtualScrollOptions` | 滚动方法选项：`align` / `behavior`（类型） | `packages/fe/virtualizer/apis.md` |
| virtualizer | `VirtualMeasurement` | `measureMany` 的测量记录（类型） | `packages/fe/virtualizer/apis.md` |
| virtualizer | （场景示例） | 浏览器端接入的端到端示例 | `packages/fe/virtualizer/examples.md` |
| tween | `Tween` | 数值补间动画类：播放 / 暂停 / 恢复 / 取消 / 跳转 | `packages/fe/tween/apis.md` |
| tween | `tweenEasings` | 内置缓动函数集：`linear` / `easeInQuad` / `easeOutQuad` / `easeInOutQuad` | `packages/fe/tween/apis.md` |
| tween | `TweenOptions` | `Tween` 构造参数（类型） | `packages/fe/tween/apis.md` |
| tween | `TweenFrame` | 每帧回调数据：`elapsed` / `progress` / `easedProgress` / `value` / `state`（类型） | `packages/fe/tween/apis.md` |
| tween | `TweenState` | 状态机：`idle` / `running` / `paused` / `finished` / `cancelled`（类型） | `packages/fe/tween/apis.md` |
| tween | `TweenEasing` | 缓动函数签名 `(progress: number) => number`（类型） | `packages/fe/tween/apis.md` |
| tween | `TweenScheduler` | 自定义帧调度器（类型） | `packages/fe/tween/apis.md` |
| file | `readChunks` | 按 `Blob.slice()` 分块异步读取 `Blob`/`File`，返回 `AsyncGenerator<Uint8Array>` | `packages/fe/file/apis.md` |
| file | `ReadChunksOptions` | `readChunks` 选项：`chunkSize` / `offset`（类型） | `packages/fe/file/apis.md` |
| file | `saveBlob` | 通过 `Object URL` + `a[download]` 触发浏览器下载一个 `Blob` | `packages/fe/file/apis.md` |
| storage | `storage` | `localStorage` / `sessionStorage` 封装入口：`storage.local` 与 `storage.session` | `packages/fe/storage/apis.md` |
| storage | `storageKey` | 创建带类型信息的存储键 `StorageKey<T>` | `packages/fe/storage/apis.md` |
| storage | `StorageKey` | 类型化存储键的品牌类型（类型） | `packages/fe/storage/apis.md` |
| storage | `ExtractStorageKey` | 从 `StorageKey<T>` 提取 `T` 的工具类型（类型） | `packages/fe/storage/apis.md` |
| storage | `cookie` | Cookie 读写对象：`set` / `get` / `remove` / `has` / `getAll` / `clear` | `packages/fe/storage/apis.md` |
| storage | `CookieOptions` | Cookie 选项：`expires` / `path` / `domain` / `secure` / `sameSite`（类型） | `packages/fe/storage/apis.md` |
| web-api | `clipboard` | 系统剪贴板对象：`copy` / `read` / `readText` | `packages/fe/web-api/apis.md` |
| web-api | `queryPermission` | 查询浏览器权限状态，返回 `Promise<boolean>`，不发起授权 | `packages/fe/web-api/apis.md` |
| web-api | `WebPermissionName` | 权限名：`PermissionName \| 'clipboard-read' \| 'clipboard-write'`（类型） | `packages/fe/web-api/apis.md` |
| （跨模块） | （组合场景） | 上传记录 + 分块读取 + 剪贴板 + 虚拟列表的组合示例 | `packages/fe/examples.md` |
