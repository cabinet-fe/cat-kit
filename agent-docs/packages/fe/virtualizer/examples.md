---
title: "@cat-kit/fe 虚拟列表示例"
description: 虚拟列表测量、订阅渲染与销毁的完整示例
keywords:
  - Virtualizer
  - measureMany
  - subscribe
  - scrollToIndex
  - destroy
  - 虚拟滚动示例
  - 视口设置
  - 平滑滚动
aliases:
  - virtual list example
  - 虚拟列表用法
  - react-window 示例
---

# 虚拟列表 — 示例

以下示例演示 `Virtualizer` 的典型接入流程：构造、设置视口、上报真实测量、订阅快照渲染，以及卸载时清理。

```ts
import { Virtualizer } from '@cat-kit/fe'

const rows = [
  { id: 'a', height: 40 },
  { id: 'b', height: 56 }
]

const v = new Virtualizer({
  count: rows.length,
  estimateSize: () => 44,
  getItemKey: (i) => rows[i]!.id
})

v.setViewport(480)
v.measureMany(rows.map((row, index) => ({ index, size: row.height })))

const stop = v.subscribe(({ items, beforeSize, afterSize }) => {
  // 渲染 items，并用 beforeSize/afterSize 撑开滚动高度
  void items
  void beforeSize
  void afterSize
})

// 卸载：
stop()
v.destroy()
```

## 滚动到指定项

```ts
v.scrollToIndex(200, { align: 'center' })
v.scrollToIndex(0, { behavior: 'smooth' })
```

- `align: 'auto'`（默认）按最短路径对齐；仅在目标项已可见时为 no-op
- `behavior: 'smooth'` 期间不要立即同步读 `snapshot.offset`，该值由 scroll 事件驱动
