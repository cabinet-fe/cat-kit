---
title: "@cat-kit/fe 虚拟列表"
description: 大数据列表只渲染可见区域的虚拟滚动，支持动态尺寸与滚动定位
keywords:
  - 虚拟滚动
  - 大数据量列表
  - 不定高
  - 动态尺寸
  - 滚动定位
  - Virtualizer
  - estimateSize
  - getItemKey
aliases:
  - virtual list
  - react-window
  - "@tanstack/virtual"
  - 虚拟列表
  - windowing
---

# fe — 虚拟列表

`@cat-kit/fe` 的虚拟列表模块提供 `Virtualizer` 类：为大数据量列表/表格只渲染可见区域，支持动态项尺寸（测量 + 估值）、前插/乱序数据复用测量缓存，以及滚动到指定项或偏移。单轴滚动，无 grid/masonry 布局。

## 适用场景

大数据列表/表格只渲染可见区域（单轴，无 grid/masonry）。

## 推荐 API

`Virtualizer` 及类型：`VirtualizerOptions`、`VirtualSnapshot`、`VirtualItem`、`VirtualAlign`、`VirtualMeasurement` 等

完整签名见 [apis.md](apis.md)，端到端示例见 [examples.md](examples.md)。

## 注意事项

- `connect` / DOM 测量 / 滚动需浏览器元素；可无 DOM 构造（仅更新内部状态）
- 组件卸载调用 `destroy()`；`getItemKey` 对同一数据项须稳定
- `subscribe` 立即触发，之后仅结构性变化（`items`/`totalSize`/`viewportSize` 等）回调；纯 offset 位移不回调
- 默认 `useMeasuredAverage: true`：一个真实测量会影响未测项估值
- `scrollToOffset` 的 `align` 被忽略；smooth 滚动不立即更新 `snapshot.offset`
- 快照对象引用在纯 offset 位移帧保留不变，不要用 `===` 判断是否重渲染
