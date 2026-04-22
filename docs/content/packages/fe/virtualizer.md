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

`subscribe()` 只会在可见区结构发生变化时推送新快照，例如 `range`、`items`、`totalSize`、`viewportSize`、`isScrolling` 变化；纯 `offset` 位移不会逐像素通知，避免把浏览器原生滚动再放大成额外的框架 render。

## 快速使用

```typescript
import { Virtualizer } from '@cat-kit/fe'

const virtualizer = new Virtualizer({ count: 10_000, overscan: 6, estimateSize: () => 44 })

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

## API 扩展

### `getItemKey`：按数据项身份复用测量

- 签名：`getItemKey?: (index: number) => number | string`
- 作用：提供后，内部测量缓存按 `getItemKey(index)` 的返回值（稳定 key）存储，而不是按 `index`。列表前插 / 乱序 / 删除中段项时，未变动项的真实测量值仍可被复用，避免「估值→实测」抖动与 `totalSize` 跳变。
- 约束：**必须在整个生命周期对同一数据项保持稳定**。不要基于 `Math.random()`、当前时间或每次渲染重新分配的对象引用生成 key。
- 生命周期：`setCount(n)` 收缩时，**不在 `[0, n)` 范围内的 key 会被自动清理**（`measuredByKey` 被剪裁），`measuredSum` / `averageEstimate` 会相应回刷。
- 切换 `getItemKey` 的函数引用（keyed → keyed）不清空缓存，旧 key 仍视为可信，保证前插 / 乱序可复用历史测量；**keyed ↔ non-keyed 互切**会清空缓存（两套 key 空间不互通）。
- `setOptions({ count, getItemKey })` **同轮**更新时，`count` 剪裁会按**新**的 `getItemKey` 构造 alive 集合，不会把新映射下仍存活的测量误删。

典型用法——前插 / 乱序列表：

```ts
import { Virtualizer } from '@cat-kit/fe'

let rows = [
  { id: 'r1', title: '第一条' },
  { id: 'r2', title: '第二条' }
]
const virtualizer = new Virtualizer({
  count: rows.length,
  estimateSize: () => 48,
  getItemKey: (index) => rows[index]!.id
})

function prepend(row: { id: string; title: string }) {
  rows = [row, ...rows]
  virtualizer.setCount(rows.length)
}
```

### `scrollToIndex` / `scrollToOffset` 的 `behavior: 'smooth'`

- 走浏览器原生平滑滚动（`el.scrollTo({ behavior: 'smooth' })`），并开启 rAF 校准循环：动画过程中若测量使目标 offset 漂移，自动以 `behavior: 'auto'` 跳到修正后的目标位置。
- **终止条件**：用户在动画期间滚动（包括滚轮 / 触摸 / 键盘 / 编程写 `scrollTop`）、再次调用 `scrollToIndex` / `scrollToOffset`、`unmount()` / `destroy()` —— 都会立即终止校准循环。另有 5 秒硬性安全阀兜底。
- **`snapshot.offset` 语义**：smooth 动画期间不再由 `scrollTo*` 调用预写为目标值，而是由浏览器滚动事件逐帧驱动。业务代码**不要**在 `scrollTo*` 调用后立即假设 `snapshot.offset` 已经等于目标值，需要同步获取时请直接读容器 `scrollTop` / `scrollLeft` 或监听 `subscribe`。

## 交互示例

### 异高卡片列表

下面的 demo 会实时展示 `scrollToIndex`、当前可见范围以及实际渲染项数量。示例会先按卡片档位给出较接近真实值的 `estimateSize`，目标项挂载后再补一次对齐，同时保留不等高 item，方便直观看到 `measureElement` 对异高列表的修正效果。

::: demo fe/virtualizer/basic.vue
:::

### 表格虚拟滚动（2000 × 20）

大数据量表格 demo：2000 行 × 20 列、行高 30~60 随机；视口固定 800px。这个示例在 `onMounted` 阶段一次性把数据层已知的行高通过 `measureMany()` 批量上报给 `Virtualizer`，随后由纯 JS 原生 DOM API 直接管理 `<tbody>` 下的行节点池：行 `<tr>` 创建一次即永久缓存，每次快照只在前后两个 spacer 之间做最小 `insertBefore` / `removeChild`，Vue 组件树几乎不参与滚动期间的重渲染。`<tbody v-once>` 明确告诉编译器该节点只渲染一次，彻底避免父组件其它响应式数据（例如 `targetIndex` 输入框）变更时误 patch tbody 子树。默认启用 `useMeasuredAverage`，未测项使用已测平均尺寸做估值；一次性 `measureMany` 之后全部项目均已精确测量，远距离 `scrollToIndex` 不会再遇到 `totalSize` 跳变。

- 点击 `暴力滚动 × 50` 会在 5 秒内由 `requestAnimationFrame` 驱动 top↔bottom 往返 50 次，用来主动复现高频滚动压力；实测空闲 + 压测合计 ≈4% CPU 占用，FPS 稳定在 120，剖面里没有任何 Vue patch / render 热路径，证明虚拟列表已经彻底脱离宿主框架。面板里的 `帧耗时` 显示的是短窗口平滑后的平均值，不再直接暴露每帧瞬时抖动。
- 组件卸载时会调用 `virtualizer.destroy()`，`ResizeTracker` 会断开全部被观察元素，防止组件频繁重建导致的观察器泄露；demo 额外在 `onBeforeUnmount` 中清空行节点池，帮助 GC 快速回收。
- 当行高本来就是数据层已知值时，优先一次性批量 `measureMany()` 并让宿主框架退出滚动热路径 —— 让 Vue/React 只渲染一次静态骨架，行节点由 JS 原生 DOM API 按 range 差集做 insert/remove，才是虚拟滚动性能的真正上限。
- 样式层条纹 / 斑马纹 **必须绑定到数据 `index` 的稳定类**，不要用 `:nth-of-type` / `:nth-child`。虚拟滚动每次 `insertBefore` / `removeChild` 会让剩余行的 DOM 兄弟位序整体位移，`nth-*` 的命中集合随之翻转，一次滚动就被放大成 N 行 × M 列的全量 paint，高刷屏下是首要掉帧来源。本 demo 在 `ensureRow` 时按 `index & 1` 直接 `tr.classList.add('row-stripe')`，CSS 匹配该稳定类，滚动中只有新增/移除的那几行会 paint。

::: demo fe/virtualizer/table.vue
:::

## API 参考

### 构造参数 `VirtualizerOptions`

```typescript
interface VirtualizerOptions {
  count?: number
  overscan?: number
  horizontal?: boolean
  paddingStart?: number
  paddingEnd?: number
  gap?: number
  initialOffset?: number
  initialViewport?: number
  estimateSize?: (index: number) => number
  useMeasuredAverage?: boolean
  getItemKey?: (index: number) => number | string
}
```

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `count` | `0` | 虚拟项总数。 |
| `overscan` | `6` | 可视区外两侧额外预渲染的项数。数值越大滚动越不容易露白，但单帧渲染预算也越高。 |
| `horizontal` | `false` | 水平滚动（默认垂直）。切换方向会重新按新轴向读写 `scrollLeft` / `scrollTop`。 |
| `paddingStart` / `paddingEnd` | `0` | 列表首 / 末的固定内边距（px）。计入 `totalSize` 与 `beforeSize` / `afterSize`。 |
| `gap` | `0` | 相邻两项间距（px），语义与 CSS `gap` 对齐，不作用于首尾。若只需首尾留白请用 `paddingStart` / `paddingEnd`。 |
| `initialOffset` | `0` | **仅构造时生效**的初始滚动偏移，用于 SSR 水合前占位。`setOptions` 里传入会被忽略。 |
| `initialViewport` | `0` | **仅构造时生效**的初始视口尺寸，用于 SSR 首屏。 |
| `estimateSize` | `() => 36` | 未测项的尺寸估值函数。启用 `useMeasuredAverage` 后，只要有一个真实样本就会被「已测平均值」接管。 |
| `useMeasuredAverage` | `true` | 未测项是否使用已测平均尺寸作为估值。开启时只在平均值发生整数级漂移时回刷未测段；关闭后完全受 `estimateSize` 控制。 |
| `getItemKey` | `undefined` | 按数据项身份缓存测量值；见下文「[keyed items](#getitemkey-按数据项身份复用测量)」。 |

### 构造与生命周期

#### `new Virtualizer(options?)`

创建一个实例。**不会**挂载 DOM，创建后仍处于「未 mount」状态。

```ts
const v = new Virtualizer({
  count: 10_000,
  overscan: 6,
  estimateSize: () => 44,
  getItemKey: (i) => rows[i].id
})
```

#### `virtualizer.mount(element): this`

绑定滚动容器。

- 传入相同元素：只触发一次内部同步（`syncFromElement`），不重建事件监听
- 传入不同元素：先 `unmount` 旧容器再挂载新容器
- 传入 `null`：等价于 `unmount()`

mount 会订阅容器的 `scroll`（驱动 `offset` / `isScrolling`）、原生 `scrollend`（若支持）或 120ms 兜底计时器（驱动 `isScrolling = false`），以及 `ResizeObserver`（若可用，驱动 `viewportSize`）。

```ts
onMounted(() => v.mount(scrollRef.value))
onBeforeUnmount(() => v.destroy())
```

#### `virtualizer.unmount(): this`

解绑当前容器：取消 rAF 校准、卸下全部事件监听、清空 `mounted` 映射与 `ResizeTracker`。**不**清空测量缓存与订阅者，实例仍可再次 `mount` 到新容器。

#### `virtualizer.destroy(): void`

`unmount` + 释放 `ResizeTracker` + 清空订阅者。调用后不应再调用任何实例方法。组件卸载时必须调用。

### 选项与尺寸更新

#### `virtualizer.setOptions(options): this`

批量更新选项，只传需要变更的字段。

关键语义：

- `initialOffset` / `initialViewport` 在此处传入**无效**
- `getItemKey` 始终先于 `count` 应用 —— `setOptions({ count, getItemKey })` 同轮更新时 `count` 剪裁使用的是**新** key 空间
- `getItemKey` 切换语义：
  - `function → function`（keyed → keyed）：保留测量缓存，旧 key 仍被复用（前插 / 乱序场景）
  - `undefined ↔ function`（key 空间切换）：清空 `measuredByKey` / `measuredSum` / `averageEstimate`

```ts
v.setOptions({ count: newRows.length, getItemKey: (i) => newRows[i].id })
```

#### `virtualizer.setCount(count): this`

更新总数。

- **收缩**：`[count, prevCount)` 范围的测量缓存与 `mounted` 元素会被剪裁 / `unobserve`
- **扩张**：从 `prevCount` 起按 `estimateSize` / 已测平均值给出估值
- 数值未变化时为 no-op

#### `virtualizer.setViewport(size): this`

设置视口尺寸。一般由 `mount` 后的 `ResizeObserver` 自动同步；仅在 SSR / 手动布局 / 测试环境下直接调用。`offset` 会按新视口重新 clamp。

#### `virtualizer.setOffset(offset): this`

只更新逻辑 offset，不写 DOM。用于 SSR 水合前恢复滚动位置。要让 DOM 真正跳转请用 `scrollToOffset`。

### 测量

#### `virtualizer.measure(index, size): this`

单条真实测量。等价于 `measureMany([{ index, size }])`。越界 `index` 静默忽略。

#### `virtualizer.measureMany(measurements): this`

批量真实测量。同批次内多条「视口前方」项的尺寸变化会被合并成**一次** `scrollTop` DOM 写入。

大数据量首屏优先路径：

```ts
v.measureMany(rows.map((r, i) => ({ index: i, size: r.height })))
```

一次 `measureMany` 后全部项都被精确测量，后续远距离 `scrollToIndex` 不会再遇到 `totalSize` 跳变。

#### `virtualizer.measureElement(index, element): void`

绑定 DOM 元素到 index，交给内部 `ResizeObserver` 异步测量。

- 支持 `ResizeObserver` 的浏览器走异步路径，避免滚动中新挂载项触发同步布局读取
- 不支持时回退到 `getBoundingClientRect()` 并立即调用 `measure`
- `element: null` 表示卸载该 index（同步 `unobserve`）
- keyed 模式下同一 element 迁移到新 index 时会自动清理旧 index 的 `mounted` 条目

```html
<div v-for="item in items" :ref="(el) => v.measureElement(item.index, el as Element)">
  ...
</div>
```

### 滚动

#### `virtualizer.scrollToOffset(offset, options?): this`

滚动到像素偏移。`options.align` 对本方法无效。

- `behavior: 'auto'`（默认）：同步写 + 同步 `recompute()`，`snapshot.offset` 立即等于目标值
- `behavior: 'smooth'`：浏览器原生平滑 + rAF 校准循环；见下文「[smooth 语义](#scrolltoindex--scrolltooffset-的-behavior-smooth)」

#### `virtualizer.scrollToIndex(index, options?): this`

滚动到某项。`options.align` 支持 `'auto' | 'start' | 'center' | 'end'`，默认 `'auto'`（仅当项在视口外才滚动，按最短路径）。`count === 0` 时为 no-op。

```ts
v.scrollToIndex(120, { align: 'center' })
v.scrollToIndex(9999, { behavior: 'smooth' })
```

### 快照与订阅

#### `virtualizer.getSnapshot(): VirtualSnapshot`

读取当前快照。**重要**：同一对象引用在纯 `offset` 位移帧里会保留不变（仅就地改 `offset` / `isScrolling` 字段）。不要用 `===` 判断是否需要重渲染；请对比结构字段或直接走 `subscribe`。

#### `virtualizer.subscribe(listener): () => void`

注册结构化快照推送。注册时会**立即同步**调用一次 listener 便于初次渲染；之后仅在「结构性」变化时触发。「结构性」包含：`range` / `items` / `totalSize` / `viewportSize` / `horizontal` / `isScrolling` / `beforeSize` / `afterSize` 中任一字段变化。纯 `offset` 位移**不会**触发 listener。

```ts
const unsubscribe = v.subscribe((snap) => {
  render(snap.items, snap.beforeSize, snap.afterSize)
})
onBeforeUnmount(unsubscribe)
```

#### `virtualizer.getItem(index): VirtualItem`

读取某个 index 的 `{ start, end, size }`。越界会抛 `RangeError`。常用于业务侧计算「第 N 项是否可见」；滚动对齐由 `scrollToIndex` 自动处理，无需手动调用。

### 数据源整体重置

#### `virtualizer.reset(): this`

清空全部测量缓存与位置缓存、取消 rAF 校准、把 `offset` 归零后重算快照。**不**解绑滚动容器，**不**清除订阅者。

当数据仅部分变化且能提供稳定 key 时，优先用 `getItemKey` 保留历史测量；只有「数据源整体替换」才需要 `reset()`。

### 快照结构 `VirtualSnapshot`

```typescript
interface VirtualSnapshot {
  items: VirtualItem[]               // 当前应渲染的项（已含 overscan 扩张）
  range: { startIndex: number; endIndex: number } | null // 不含 overscan 的原始命中范围
  totalSize: number                  // 列表内容总尺寸（含 padding）
  beforeSize: number                 // items[0] 前需预留的占位空间
  afterSize: number                  // items 末项后需预留的占位空间
  offset: number                     // 当前滚动偏移
  viewportSize: number               // 视口尺寸
  horizontal: boolean                // 是否水平滚动
  isScrolling: boolean               // 是否处于滚动中
}

interface VirtualItem {
  index: number
  start: number  // 到列表内容起点的距离
  end: number    // 等于 start + size
  size: number
}
```

渲染层推荐使用 `beforeSize + items + afterSize` 的块状布局：前后两个 spacer 填充已滚过 / 未滚到的空间，中间只渲染 `items`。

### Vue 封装建议

- 在容器 `onMounted` 时调用 `mount`
- 使用 `subscribe` 把快照同步到 `ref`
- 如果业务确实需要每次滚动位移，优先直接读容器 `scrollTop` / `scrollLeft`，不要把 `subscribe` 当作逐帧 offset 事件流
- 在每个 item 的 `ref` 回调里调用 `measureElement(index, el)`
- 渲染时优先使用 `beforeSize + items + afterSize` 的块状布局
- 如果存在 FPS 面板、滚动压测按钮、调试计数器这类每帧变化的状态，优先用 DOM 直写、子组件隔离或 `v-memo`/memo 化，而不是让它们驱动整个虚拟列表父组件重渲染
- 极致性能场景（大表格、已知行高）可以让宿主框架只渲染一次静态骨架，用 `<div v-once>` / `<tbody v-once>` 标记容器，随后由 `subscribe` 回调里原生 DOM API（`insertBefore` / `removeChild` / `style.height`）增量更新行节点池与前后 spacer；这样可以把框架 render 从滚动热路径彻底挪走
