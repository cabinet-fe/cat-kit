---
title: "@cat-kit/fe 虚拟列表 API"
description: Virtualizer 类、配置项与快照类型的完整签名
keywords:
  - Virtualizer
  - VirtualizerOptions
  - VirtualSnapshot
  - VirtualItem
  - scrollToIndex
  - scrollToOffset
  - estimateSize
  - getItemKey
  - useMeasuredAverage
  - 虚拟滚动
aliases:
  - virtual list api
  - 虚拟列表参数
  - @tanstack/virtual
  - react-window
---

# 虚拟列表 — API

本篇列出 `@cat-kit/fe` 虚拟列表模块的公共类型签名。

```ts
declare class Virtualizer {
  constructor(options?: VirtualizerOptions)
  setOptions(options: VirtualizerOptions): this
  setCount(count: number): this
  setViewport(size: number): this
  setOffset(offset: number): this
  connect(element: HTMLElement | null): this
  disconnect(): this
  measure(index: number, size: number): this
  measureMany(measurements: Iterable<VirtualMeasurement>): this
  measureElement(index: number, element: Element | null): void
  scrollToOffset(offset: number, options?: VirtualScrollOptions): this
  scrollToIndex(index: number, options?: VirtualScrollOptions): this
  reset(): this
  destroy(): void
  subscribe(listener: VirtualizerSubscriber): () => void
  getSnapshot(): VirtualSnapshot
  getItem(index: number): VirtualItem
}

type VirtualAlign = 'auto' | 'start' | 'center' | 'end'

type VirtualizerSubscriber = (snapshot: VirtualSnapshot) => void

type EstimateSize = (index: number) => number

type GetItemKey = (index: number) => number | string

interface VirtualMeasurement {
  index: number
  size: number
}

interface VirtualScrollOptions {
  align?: VirtualAlign
  behavior?: ScrollBehavior
}
```

## VirtualizerOptions

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` | 0 | 虚拟项总数 |
| `buffer` | `number` | 4 | 可视区外额外预渲染项数 |
| `horizontal` | `boolean` | false | 是否水平滚动 |
| `paddingStart` | `number` | 0 | 首项前固定内边距（px） |
| `paddingEnd` | `number` | 0 | 末项后固定内边距（px） |
| `gap` | `number` | 0 | 相邻项间距（px），语义同 CSS `gap` |
| `initialOffset` | `number` | 0 | 初始滚动偏移（仅构造时生效） |
| `initialViewport` | `number` | 0 | 未 connect 前的初始视口尺寸 |
| `estimateSize` | `EstimateSize` | () => 36 | 未测项尺寸估值函数 |
| `useMeasuredAverage` | `boolean` | true | 未测项是否用已测项平均值估值 |
| `getItemKey` | `GetItemKey` | — | 基于 index 返回稳定 key，按数据项身份复用测量缓存 |

## VirtualSnapshot / VirtualItem / VirtualRange

```ts
interface VirtualItem {
  index: number
  start: number
  end: number
  size: number
}

interface VirtualRange {
  startIndex: number
  endIndex: number
}

interface VirtualSnapshot {
  items: VirtualItem[]
  range: VirtualRange | null
  totalSize: number
  beforeSize: number
  afterSize: number
  offset: number
  viewportSize: number
  horizontal: boolean
  isScrolling: boolean
}
```

- `VirtualItem` 的 `start`/`end`/`size` 单位为 px，相对列表内容起点（不含 `paddingStart`）
- `range` 为不含 `buffer` 的原始命中范围；`count === 0` 或视口尺寸 <= 0 时为 `null`
- `beforeSize`/`afterSize` 用于 spacer 布局撑开滚动高度
- `scrollToIndex` 的 `align`：`'auto'` 最短路径、`'start'`/`'center'`/`'end'` 按对应边/中线对齐；`align` 仅对 `scrollToIndex` 生效
- `behavior: 'smooth'` 走浏览器原生平滑滚动 + rAF 校准；动画中 `snapshot.offset` 由 scroll 事件驱动，不立即等于目标值
