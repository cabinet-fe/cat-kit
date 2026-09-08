---
title: "Virtualizer 虚拟滚动列表 API"
description: "@cat-kit/fe Virtualizer 类完整 API：11 个配置项默认值、16 个实例方法（connect/measure/measureElement/scrollToIndex/subscribe 等）的返回与抛错、VirtualSnapshot 快照结构与结构性触发规则、smooth 滚动 rAF 校准行为。"
aliases: [Virtualizer api, virtual list api, 虚拟列表参数, 虚拟滚动签名]
keywords: [Virtualizer, VirtualizerOptions, VirtualSnapshot, VirtualItem, VirtualRange, EstimateSize, GetItemKey, useMeasuredAverage, scrollToIndex, scrollToOffset, measureElement, measureMany, subscribe, connect, destroy, getSnapshot, getItem, setCount, 虚拟滚动, 滚动定位]
---

# Virtualizer 虚拟滚动列表 API

`@cat-kit/fe` 从包根导出 `Virtualizer` 类。实例维护「项位置表 + 测量缓存 + 快照」三份数据：配置与测量变更触发内部重算（懒计算），结构性变化推送给 `subscribe` 的订阅者，滚动方法写容器 `scrollTop` / `scrollLeft`。

## 快速上手

```ts
import { Virtualizer } from '@cat-kit/fe'

const v = new Virtualizer({ count: 10_000, estimateSize: () => 44 })

// 无 DOM 也能计算快照：手动给视口尺寸与滚动偏移
v.setViewport(600)
v.setOffset(440)

const snap = v.getSnapshot()
console.log(snap.totalSize) // => 440000
console.log(snap.items[0].index) // => 6（buffer 默认 4，可视区前多渲染 4 项）
```

## API 签名

```ts
export type EstimateSize = (index: number) => number
export type VirtualAlign = 'auto' | 'start' | 'center' | 'end'
export type GetItemKey = (index: number) => number | string
export type VirtualizerSubscriber = (snapshot: VirtualSnapshot) => void

export interface VirtualizerOptions {
  /** 虚拟项总数，默认 0 */
  count?: number
  /** 可视区外额外保留的预渲染项数，默认 4 */
  buffer?: number
  /** 是否水平滚动（否则垂直），默认 false */
  horizontal?: boolean
  /** 首项前固定内边距（px），默认 0 */
  paddingStart?: number
  /** 末项后固定内边距（px），默认 0 */
  paddingEnd?: number
  /** 相邻项间距（px），语义同 CSS gap，默认 0 */
  gap?: number
  /** 初始滚动偏移（px），仅构造时生效，默认 0 */
  initialOffset?: number
  /** connect 前的初始视口尺寸（px），仅构造时生效，默认 0 */
  initialViewport?: number
  /** 未测项估值函数，默认 () => 36；返回负数 clamp 到 0，四舍五入取整 */
  estimateSize?: EstimateSize
  /** 未测项是否用「已测项平均值」估值，默认 true */
  useMeasuredAverage?: boolean
  /** 按 index 返回稳定 key，按数据项身份存储测量缓存；不传时按 index 缓存 */
  getItemKey?: GetItemKey
}

export interface VirtualItem {
  index: number
  /** 项起点到列表内容起点的距离（px，不含 paddingStart） */
  start: number
  end: number
  size: number
}

export interface VirtualRange {
  startIndex: number
  endIndex: number
}

export interface VirtualSnapshot {
  /** 当前应渲染的项（已含 buffer 扩张） */
  items: VirtualItem[]
  /** 不含 buffer 的原始可视区命中范围；count === 0 或 viewportSize <= 0 时为 null */
  range: VirtualRange | null
  /** 列表内容总尺寸（含 paddingStart/paddingEnd） */
  totalSize: number
  /** items[0] 前占位空间（含 paddingStart），用于 spacer 布局 */
  beforeSize: number
  /** 最后一项后占位空间（含 paddingEnd） */
  afterSize: number
  offset: number
  viewportSize: number
  horizontal: boolean
  /** 是否滚动中：scroll/scrollend 事件驱动，无原生 scrollend 时 120ms 计时兜底 */
  isScrolling: boolean
}

export interface VirtualScrollOptions {
  /** 对齐方式，默认 'auto'。仅 scrollToIndex 生效 */
  align?: VirtualAlign
  /** 'smooth' 走原生平滑滚动 + rAF 校准；默认 'auto' 同步跳转 */
  behavior?: ScrollBehavior
}

export interface VirtualMeasurement {
  /** 项索引，越界测量被静默忽略 */
  index: number
  /** 真实像素尺寸，负数 clamp 到 0 */
  size: number
}

export declare class Virtualizer {
  constructor(options?: VirtualizerOptions)
  setOptions(options: VirtualizerOptions): this
  setCount(count: number): this
  setViewport(size: number): this
  setOffset(offset: number): this
  connect(element: HTMLElement | null): this
  disconnect(): this
  destroy(): void
  subscribe(listener: VirtualizerSubscriber): () => void
  measure(index: number, size: number): this
  measureMany(measurements: Iterable<VirtualMeasurement>): this
  measureElement(index: number, element: Element | null): void
  scrollToOffset(offset: number, options?: VirtualScrollOptions): this
  scrollToIndex(index: number, options?: VirtualScrollOptions): this
  reset(): this
  getSnapshot(): VirtualSnapshot
  getItem(index: number): VirtualItem
}
```

## 参数说明

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `count` | `number` | `0` | 否 | 负数 clamp 到 0，小数截断 |
| `buffer` | `number` | `4` | 否 | 负数 clamp 到 0，小数截断 |
| `horizontal` | `boolean` | `false` | 否 | `true` 时读 `scrollLeft` / `clientWidth` |
| `paddingStart` / `paddingEnd` | `number` | `0` | 否 | px；负数 clamp 到 0，四舍五入取整 |
| `gap` | `number` | `0` | 否 | px；相邻项之间的间距，负数 clamp 到 0 |
| `initialOffset` | `number` | `0` | 否 | 仅构造时生效；`setOptions` 传入被忽略 |
| `initialViewport` | `number` | `0` | 否 | 仅构造时生效；`setOptions` 传入被忽略 |
| `estimateSize` | `EstimateSize` | `() => 36` | 否 | 必须无副作用、可重入；同一 index 会被多次调用 |
| `useMeasuredAverage` | `boolean` | `true` | 否 | 开启后首个真实测量产生即用平均值替换全部未测项估值 |
| `getItemKey` | `GetItemKey` | — | 否 | 整个生命周期内同一数据项必须返回相同 key；keyed 与 non-keyed 互切会清空测量缓存 |

`VirtualScrollOptions`：`align` 默认 `'auto'`（仅 `scrollToIndex` 生效）；`behavior` 取 `'auto'`（默认，同步跳转）或 `'smooth'`（原生平滑 + rAF 校准）。

## 方法与事件

全部方法同步，无 Promise；除 `measureElement` / `destroy` / `getSnapshot` / `getItem` / `subscribe` 外返回 `this` 支持链式调用。唯一会抛错的是 `getItem`。

配置与状态：

- `setOptions(options)`：合并更新，未传字段不变；`initialOffset` / `initialViewport` 在此被忽略。同轮更新时 `getItemKey` 先于 `count` 应用；`getItemKey` 在 keyed 与 non-keyed 之间切换会清空全部测量缓存，keyed 到 keyed（函数身份变化）则保留。`paddingStart` / `gap` / `estimateSize` / `useMeasuredAverage` / `getItemKey` 变更会使全部位置缓存失效重排
- `setCount(count)`：clamp 到 `[0, +∞)` 并截断小数；收缩时剪裁范围外的测量缓存与已挂载元素，扩张时新增段按估值计算；数值不变时 no-op
- `setViewport(size)`：四舍五入取整、负数 clamp 到 0；`offset` 按新视口重新 clamp
- `setOffset(offset)`：clamp 到 `[0, totalSize - viewportSize]`，四舍五入；只更新内部状态，**不写 DOM**（SSR 水合恢复滚动位置用；让 DOM 跳转用 `scrollToOffset`）
- `getSnapshot()`：返回当前快照。纯 `offset` 位移帧中**同一对象引用保持不变**（仅就地改 `offset` / `isScrolling`），禁止用 `===` 判断是否需要重渲染
- `getItem(index)`：越界（不在 `[0, count)`）时抛 `RangeError(\`Virtual item index out of range: ${index}\`)`

生命周期：

- `connect(element)`：绑定滚动容器（需 `overflow: auto/scroll`）。订阅 `scroll`（passive）驱动 `offset` / `isScrolling`，容器支持原生 `scrollend` 时优先使用，否则 120ms 计时兜底；有 `ResizeObserver` 时观察容器尺寸驱动 `viewportSize`；并立即同步一次 `scrollTop` / `clientHeight`。传同一元素只重新同步；传 `null` 等价 `disconnect()`
- `disconnect()`：取消校准循环、卸下事件与观察器、清空已挂载元素映射；**保留**测量缓存与订阅者，实例可再次 `connect` 复用
- `destroy()`：`disconnect()` + 释放内部测量器 + 清空订阅者；销毁后禁止再调用任何方法。组件卸载时调用
- `reset()`：清空测量缓存与位置缓存、`offset` 归零、重算快照；不解绑容器、不清订阅者。用于数据源整体替换；部分变化且有稳定 key 时优先更新 `getItemKey` 而不是 `reset()`

测量：

- `measure(index, size)`：单条上报，等价 `measureMany([{ index, size }])`；越界 index 静默忽略
- `measureMany(measurements)`：批量上报；同批次视口前方项的尺寸变化合并为**一次** `scrollTop` 写入（滚动锚定补偿），且只触发一次快照推送
- `measureElement(index, element)`：绑定 DOM 元素自动测量。有 `ResizeObserver` 时走异步测量（`border-box`），缺失时回退 `getBoundingClientRect()` 立即上报；重复传同一元素幂等；传 `null` 卸载该 index

滚动：

- `scrollToIndex(index, options?)`：`count === 0` 时 no-op；index clamp 到 `[0, count - 1]` 并截断小数。`align: 'auto'`（默认）仅当目标项在视口外才滚动，按最短路径（上方对齐视口顶、下方对齐视口底）；`'start'` / `'center'` / `'end'` 按项边或中线对齐。`behavior: 'auto'` 同步写 `scrollTop`，`snapshot.offset` 立即等于目标；`'smooth'` 走原生平滑滚动 + rAF 校准循环——测量更新导致目标漂移时自动以 `'auto'` 跳到修正位置，用户反向滚动立即终止，5 秒硬性超时兜底
- `scrollToOffset(offset, options?)`：clamp 到 `[0, totalSize - viewportSize]`；恒按 `'start'` 语义，`options.align` 无效。未绑定容器时仅更新逻辑 offset，无 DOM 副作用

订阅：

- `subscribe(listener)`：**立即同步回调一次**（携带当前快照）；返回退订函数，重复调用幂等。之后只在「结构性变化」（`items` / `range` / `totalSize` / `viewportSize` / `horizontal` / `isScrolling` / `beforeSize` / `afterSize` 任一变化）时回调；纯 `offset` 位移不回调

## 典型示例

### connect + measureElement 动态高度（Vue）

```ts
import { Virtualizer } from '@cat-kit/fe'

const rows: Array<{ id: string; text: string }> = [
  { id: 'a', text: '第一行' },
  { id: 'b', text: '第二行' }
] // 实际场景来自接口或 store

const v = new Virtualizer({ count: rows.length, getItemKey: (i) => rows[i].id })

const stop = v.subscribe(({ items, beforeSize, afterSize }) => {
  // 渲染 items；用 beforeSize / afterSize 撑起上下占位
  console.log(items.length, beforeSize, afterSize)
})

// 模板里对每个渲染项：:ref="(el) => v.measureElement(item.index, el)"
// 卸载时：
stop()
v.destroy()
```

### 后端下发真实行高：一次 measureMany 精确布局

```ts
import { Virtualizer } from '@cat-kit/fe'

const rows: Array<{ id: string; height: number }> = [
  { id: 'a', height: 40 },
  { id: 'b', height: 56 }
]

const v = new Virtualizer({
  count: rows.length,
  estimateSize: () => 44,
  getItemKey: (i) => rows[i].id
})
v.setViewport(480)
v.measureMany(rows.map((row, index) => ({ index, size: row.height })))

console.log(v.getSnapshot().totalSize) // => 96（全部真实值，无估值）
console.log(v.getItem(1).size) // => 56
```

### 滚动定位与水平模式

```ts
import { Virtualizer } from '@cat-kit/fe'

const v = new Virtualizer({ count: 1000, estimateSize: () => 40 })
v.setViewport(600)

v.scrollToIndex(200, { align: 'center' }) // 项中线对齐视口中线
console.log(v.getSnapshot().offset) // => 7720（同步生效）

v.scrollToIndex(0, { behavior: 'smooth' }) // 平滑滚回顶部
// smooth 期间 offset 由 scroll 事件逐帧驱动，不要立即读 snapshot.offset 断言

const h = new Virtualizer({ count: 100, horizontal: true, estimateSize: () => 120 })
h.setViewport(800)
h.scrollToOffset(960)
console.log(h.getSnapshot().offset) // => 960
```

## 注意事项

> [!WARNING]
> - 快照对象在纯 `offset` 滚动帧**引用不变**（就地更新 `offset` / `isScrolling`）；本库不是每次滚动都返回新对象，禁止用 `===` 判断重渲染，请对比 `range` / `totalSize` 等结构字段或走 `subscribe`。
> - `subscribe` 对纯 `offset` 位移**不回调**；要跟踪滚动位置请直接读容器 `scrollTop` 或 `snapshot.offset`。
> - `useMeasuredAverage` 默认 `true`：任何一个真实测量都会改变全部未测项的估值（首个样本即生效）。与「各项独立按 `estimateSize` 估值」的库不同；要独立估值需显式传 `useMeasuredAverage: false`。
> - `align` 仅对 `scrollToIndex` 生效；`scrollToOffset` 恒为 `'start'` 语义，不是居中。
> - `measure` / `measureMany` 对越界 index 静默忽略、不抛错；`getItem` 越界抛 `RangeError`。
> - `estimateSize` 返回负数会被 clamp 到 0，返回值四舍五入取整；`measure` 传入的 size 同样取整。
> - 本库是单轴虚拟化（垂直或水平二选一），不是 grid / masonry。
> - `behavior: 'smooth'` 需要 `connect` 到真实容器才生效；smooth 期间 `snapshot.offset` 由 scroll 事件驱动，不预写目标值。
