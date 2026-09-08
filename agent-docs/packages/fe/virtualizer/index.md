---
title: "Virtualizer 虚拟滚动列表"
description: "@cat-kit/fe 的虚拟滚动模块：Virtualizer 类为大数据量列表只渲染可视区，支持动态项尺寸测量（ResizeObserver 或手动上报）、getItemKey 按数据项身份复用测量、scrollToIndex/scrollToOffset 滚动定位与快照订阅。"
aliases: [virtual list, virtualizer, 虚拟列表, 虚拟滚动, windowing, react-window, "@tanstack/virtual"]
keywords: [Virtualizer, VirtualizerOptions, VirtualSnapshot, VirtualItem, estimateSize, getItemKey, useMeasuredAverage, buffer, scrollToIndex, scrollToOffset, measureElement, measureMany, subscribe, connect, destroy, 虚拟滚动, 虚拟列表, 大数据量渲染, 不定高列表]
---

# Virtualizer 虚拟滚动列表

`@cat-kit/fe` 的虚拟滚动模块导出 `Virtualizer` 类与配套类型。`Virtualizer` 对大数据量列表只计算并渲染可视区附近的项：未测项用 `estimateSize` 估值（默认返回 36），真实尺寸通过 `measureElement`（DOM 自动测量）或 `measure` / `measureMany`（手动上报）修正；`getItemKey` 让前插、乱序、删除数据时仍能复用未变动项的测量值。滚动定位提供 `scrollToIndex`（四种对齐）与 `scrollToOffset`。单轴（垂直或水平）虚拟化，无 grid / masonry 布局。

## 安装

```bash
npm install @cat-kit/fe
```

全部导出仅从包根提供：`import { Virtualizer } from '@cat-kit/fe'`。

运行前提：`connect`、`measureElement` 与滚动方法需要浏览器 DOM（`HTMLElement`、`ResizeObserver`、`scroll` 事件）；无 DOM 时可构造实例并用 `setViewport` + `setOffset` 计算快照（SSR、测试）。

## 模块速查

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `Virtualizer` | 虚拟滚动核心类：配置、测量、滚动、订阅 | `packages/fe/virtualizer/apis.md` |
| `VirtualizerOptions` | 构造参数：`count` / `buffer` / `gap` / `estimateSize` / `getItemKey` 等（类型） | `packages/fe/virtualizer/apis.md` |
| `VirtualSnapshot` | 快照：`items` / `range` / `totalSize` / `beforeSize` / `afterSize` / `offset` / `viewportSize` / `horizontal` / `isScrolling`（类型） | `packages/fe/virtualizer/apis.md` |
| `VirtualItem` | 单个虚拟项：`index` / `start` / `end` / `size`（类型） | `packages/fe/virtualizer/apis.md` |
| `VirtualRange` | 不含 buffer 的可视区索引范围（类型） | `packages/fe/virtualizer/apis.md` |
| `VirtualAlign` | 对齐方式 `'auto' \| 'start' \| 'center' \| 'end'`（类型） | `packages/fe/virtualizer/apis.md` |
| `VirtualizerSubscriber` | `subscribe` 回调签名（类型） | `packages/fe/virtualizer/apis.md` |
| `EstimateSize` | 未测项估值函数 `(index: number) => number`（类型） | `packages/fe/virtualizer/apis.md` |
| `GetItemKey` | 稳定 key 函数 `(index: number) => number \| string`（类型） | `packages/fe/virtualizer/apis.md` |
| `VirtualScrollOptions` | 滚动选项：`align` / `behavior`（类型） | `packages/fe/virtualizer/apis.md` |
| `VirtualMeasurement` | 手动测量记录 `{ index, size }`（类型） | `packages/fe/virtualizer/apis.md` |
| （场景示例） | 浏览器端完整接入（HTML + 渲染 + 测量 + 销毁） | `packages/fe/virtualizer/examples.md` |
