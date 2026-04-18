---
title: 虚拟化
description: '@cat-kit/fe Virtualizer：适合 Vue composable 封装的轻量虚拟滚动核心'
sidebarOrder: 4
---

# 虚拟化

## 介绍

`@cat-kit/fe` 的虚拟化能力聚焦为单个 `Virtualizer` 类。它负责：

- 计算可视范围与总尺寸
- 接收真实测量结果并增量修正布局
- 提供 `mount`、`measureElement`、`scrollToIndex`、`subscribe` 等适合 Vue composable 包装的薄 API

它支持 vertical 与 horizontal 两种单轴模式，但不内置 grid/masonry。

## 快速使用

```typescript
import { Virtualizer } from '@cat-kit/fe'

const virtualizer = new Virtualizer({
  count: 10_000,
  overscan: 6,
  estimateSize: () => 44
})

virtualizer.setViewport(480)
virtualizer.setOffset(120)

const snapshot = virtualizer.getSnapshot()
console.log(snapshot.items, snapshot.totalSize)
```

如果已经拿到容器元素，也可以直接挂载：

```typescript
virtualizer.mount(containerEl)
virtualizer.measureElement(index, itemEl)
```

## API参考

### 构造参数

```typescript
interface VirtualizerOptions {
  count?: number
  overscan?: number
  horizontal?: boolean
  paddingStart?: number
  paddingEnd?: number
  initialOffset?: number
  initialViewport?: number
  estimateSize?: (index: number) => number
  onChange?: (snapshot: VirtualSnapshot) => void
}
```

### 常用实例方法

```typescript
virtualizer.setCount(2000)
virtualizer.setViewport(600)
virtualizer.setOffset(320)
virtualizer.measure(12, 88)
virtualizer.measureElement(12, element)
virtualizer.scrollToIndex(120, { align: 'center' })
virtualizer.scrollToOffset(2400)
virtualizer.mount(containerEl)
virtualizer.unmount()
```

### 快照结构

```typescript
interface VirtualSnapshot {
  items: VirtualItem[]
  range: { startIndex: number; endIndex: number } | null
  totalSize: number
  beforeSize: number
  afterSize: number
  offset: number
  viewportSize: number
  horizontal: boolean
  isScrolling: boolean
}
```

### Vue 封装建议

- 在容器 `onMounted` 时调用 `mount`
- 使用 `subscribe` 或 `onChange` 把快照同步到 `ref`
- 在每个 item 的 `ref` 回调里调用 `measureElement(index, el)`
- 渲染时优先使用 `beforeSize + items + afterSize` 的块状布局
