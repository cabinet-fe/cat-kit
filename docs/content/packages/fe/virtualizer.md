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

## API参考

### 构造参数

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

`gap` 语义与 CSS `gap` 对齐：只在相邻两项之间插入间距，不作用于首尾；默认 `0`。若只需要列表首尾留白请使用 `paddingStart` / `paddingEnd`。

`useMeasuredAverage`（默认 `true`）控制未测量项的估值来源：开启时使用已测项的平均尺寸作为估值，并且只在平均值发生明显整数级漂移时才回刷未测段，兼顾滚动条稳定性与滚动时 CPU 开销；关闭后退化为「完全受控于 `estimateSize`」，适合对估值精确性有自定义要求的场景。

### 常用实例方法

```typescript
virtualizer.setCount(2000)
virtualizer.setViewport(600)
virtualizer.setOffset(320)
virtualizer.measure(12, 88)
virtualizer.measureMany([
  { index: 12, size: 88 },
  { index: 13, size: 76 }
])
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
- 使用 `subscribe` 把快照同步到 `ref`
- 如果业务确实需要每次滚动位移，优先直接读容器 `scrollTop` / `scrollLeft`，不要把 `subscribe` 当作逐帧 offset 事件流
- 在每个 item 的 `ref` 回调里调用 `measureElement(index, el)`
- 渲染时优先使用 `beforeSize + items + afterSize` 的块状布局
- 如果存在 FPS 面板、滚动压测按钮、调试计数器这类每帧变化的状态，优先用 DOM 直写、子组件隔离或 `v-memo`/memo 化，而不是让它们驱动整个虚拟列表父组件重渲染
- 极致性能场景（大表格、已知行高）可以让宿主框架只渲染一次静态骨架，用 `<div v-once>` / `<tbody v-once>` 标记容器，随后由 `subscribe` 回调里原生 DOM API（`insertBefore` / `removeChild` / `style.height`）增量更新行节点池与前后 spacer；这样可以把框架 render 从滚动热路径彻底挪走
