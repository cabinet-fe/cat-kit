---
title: "Virtualizer 虚拟列表浏览器接入"
description: 用 Virtualizer 在浏览器接入一个动态高度虚拟列表的端到端方案：spacer 布局撑开滚动高度、measureElement 自动测量、subscribe 订阅结构性快照、scrollToIndex 定位与卸载销毁。
aliases: [virtual list example, 虚拟列表用法, 虚拟滚动接入, react-window 示例]
keywords: [Virtualizer, measureElement, subscribe, beforeSize, afterSize, scrollToIndex, destroy, getItemKey, buffer, 虚拟滚动示例, 动态高度, spacer 布局, 大数据量列表]
---

# Virtualizer 虚拟列表浏览器接入

场景：数据量在数千到数十万行、行高不定（图文混排）的列表，需要只渲染可视区附近条目并保持滚动条位置准确。方案使用 `@cat-kit/fe` 的 `Virtualizer`：`connect` 绑定滚动容器，`subscribe` 拿结构性快照渲染，`measureElement` 让每行真实高度回灌测量缓存。

## 场景

- 何时用本方案：列表项总数大（渲染全部会卡顿）、项高度不固定且会随内容变化、需要按索引或按钮跳转到某一项
- 何时不用：数据量小（可视区能一次渲染完）直接全量渲染即可；二维网格 / 瀑布流布局本库不支持，需自行基于 `VirtualItem` 扩展或改用其他方案

## 完整示例

```html
<!-- index.html -->
<!doctype html>
<html lang="zh-CN">
  <body>
    <div id="scroller" style="height: 600px; overflow: auto; position: relative">
      <div id="content"></div>
    </div>
    <button id="jump">跳到第 5000 行</button>
    <script type="module" src="/src/list.ts"></script>
  </body>
</html>
```

```ts
// src/list.ts
import { Virtualizer } from '@cat-kit/fe'

interface Row {
  id: number
  text: string
}

// 数据源：10000 行，行高由内容决定
const rows: Row[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: i,
  text: `第 ${i} 行：`.padEnd(8, '内容') + (i % 7 === 0 ? '这行特别长'.repeat(6) : '普通行')
}))

const virtualizer = new Virtualizer({
  count: rows.length,
  estimateSize: () => 36, // 未测项冷启动估值
  getItemKey: (i) => rows[i].id // 前插/删除时按 id 复用已测行高
})

const scroller = document.querySelector<HTMLElement>('#scroller')!
const content = document.querySelector<HTMLElement>('#content')!

virtualizer.connect(scroller)

const unsubscribe = virtualizer.subscribe(({ items, beforeSize, afterSize }) => {
  // 结构性变化才回调：重渲染可视区，上下用 spacer 撑开真实滚动高度
  content.style.paddingTop = `${beforeSize}px`
  content.style.paddingBottom = `${afterSize}px`
  content.replaceChildren(
    ...items.map((item) => {
      const el = document.createElement('div')
      el.textContent = rows[item.index].text
      // 真实高度回灌：ResizeObserver 异步测量，重复传同一元素幂等
      virtualizer.measureElement(item.index, el)
      return el
    })
  )
})

document.querySelector<HTMLButtonElement>('#jump')!.addEventListener('click', () => {
  virtualizer.scrollToIndex(5000, { align: 'start' })
})

// 页面卸载时销毁，防止事件与观察器泄漏
window.addEventListener('beforeunload', () => {
  unsubscribe()
  virtualizer.destroy()
})
```

## 要点说明

- `beforeSize` / `afterSize`：快照里的上下占位高度（含 `paddingStart` / `paddingEnd`），写入容器的 `padding` 即 spacer 布局，保证滚动条总高度等于 `totalSize`
- `measureElement(item.index, el)`：有 `ResizeObserver` 的浏览器走异步测量（`border-box`），避免滚动中同步读布局；行 DOM 复用导致元素换索引时本库会自行清理旧映射
- `getItemKey`：按数据项身份（`id`）存测量缓存；前插、乱序、删除时未变动项的真实行高仍被复用。key 必须在整个生命周期内稳定，禁止用随机数或每次新建的对象引用
- `subscribe` 只在结构性变化（`items` / `range` / `totalSize` / `viewportSize` / `isScrolling` 等）时回调；纯滚动位移不回调，滚动位置直接读容器 `scrollTop` 或 `snapshot.offset`
- `connect` 的容器必须是可滚动元素（`overflow: auto/scroll`）；`ResizeObserver` 会在容器尺寸变化时自动同步 `viewportSize`
- `scrollToIndex(5000, { align: 'start' })`：未测段按估值定位，滚入视口测得真实尺寸后本库自动补偿，无需业务干预

## 注意事项

> [!WARNING]
> - 快照对象在纯 `offset` 滚动帧引用不变，禁止用 `===` 判断是否重渲染；本方案依赖 `subscribe` 的结构性回调，不要自己缓存快照引用做比较。
> - `behavior: 'smooth'` 滚动期间 `snapshot.offset` 由 scroll 事件逐帧驱动，不要调用后立即同步读它断言目标值。
> - `estimateSize` 返回值与真实值偏差过大时，默认开启的 `useMeasuredAverage`（首个真实测量即接管全部未测项估值）能缓解抖动；确需逐项独立估值才传 `useMeasuredAverage: false`。
> - 卸载时必须调用 `virtualizer.destroy()`，否则 `scroll` 监听与 `ResizeObserver` 泄漏。
