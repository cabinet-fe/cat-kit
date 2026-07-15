# fe — Virtualizer

## 适用场景

`Virtualizer` 计算大列表或表格当前应渲染的项、占位尺寸和滚动目标。它不创建组件或 DOM，适合由 React、Vue、原生 DOM 等宿主负责渲染。

## 如何选择

| 数据与布局             | 推荐配置                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------- |
| 固定项尺寸             | `estimateSize` 返回真实尺寸，并设 `useMeasuredAverage: false`；无需 DOM 测量       |
| 每项尺寸由数据层已知   | 初始化后用 `measureMany` 批量上报，单项变化用 `measure`                            |
| 尺寸取决于实际 DOM     | 渲染项挂载/更新时调用 `measureElement(index, element)`，卸载时传 `null`            |
| 数据会前插、删除或重排 | 提供基于数据 ID 的稳定 `getItemKey`                                                |
| 服务端预渲染或测试     | 构造时提供 `initialViewport` / `initialOffset`，或手动 `setViewport` / `setOffset` |
| 横向列表               | 设置 `horizontal: true`；尺寸和偏移均按宽度/`scrollLeft` 解释                      |

如果只渲染几十个简单节点，或需要框架现成组件、网格布局与无障碍交互，应先选择更直接的方案。

## 公共 API

### 创建与选项

```ts
new Virtualizer(options?: VirtualizerOptions)
virtualizer.setOptions(options: VirtualizerOptions): this
virtualizer.setCount(count: number): this
```

| `VirtualizerOptions` 字段           | 作用与默认值                                 |
| ----------------------------------- | -------------------------------------------- |
| `count`                             | 数据项数量，默认 `0`                         |
| `buffer`                            | 可视区两侧额外渲染项数，默认 `4`             |
| `horizontal`                        | 是否横向，默认 `false`                       |
| `paddingStart` / `paddingEnd`       | 首尾留白像素，默认 `0`                       |
| `gap`                               | 项间距像素，默认 `0`                         |
| `estimateSize(index)`               | 未获得真实尺寸时的估值，默认 `36`            |
| `useMeasuredAverage`                | 是否用已测项平均尺寸估计未测项，默认 `true`  |
| `getItemKey(index)`                 | 返回当前数据项稳定的 `string` 或 `number` ID |
| `initialOffset` / `initialViewport` | 仅构造时生效的初始状态                       |

### 连接与读取

```ts
virtualizer.connect(element: HTMLElement | null): this
virtualizer.disconnect(): this
virtualizer.destroy(): void

virtualizer.subscribe(listener: (snapshot: VirtualSnapshot) => void): () => void
virtualizer.getSnapshot(): VirtualSnapshot
virtualizer.getItem(index: number): VirtualItem
```

`VirtualSnapshot` 的主要字段：

- `items`：应渲染的 `{ index, start, end, size }[]`，已包含 `buffer`
- `range`：不含 `buffer` 的可视索引范围；无有效视口时为 `null`
- `totalSize`：完整内容尺寸
- `beforeSize` / `afterSize`：首个/最后一个渲染项外的占位尺寸
- `offset` / `viewportSize` / `horizontal` / `isScrolling`：当前滚动状态

### 测量与滚动

```ts
virtualizer.measure(index: number, size: number): this
virtualizer.measureMany(records: Iterable<{ index: number; size: number }>): this
virtualizer.measureElement(index: number, element: Element | null): void

virtualizer.scrollToOffset(
  offset: number,
  options?: { behavior?: ScrollBehavior }
): this
virtualizer.scrollToIndex(
  index: number,
  options?: {
    align?: 'auto' | 'start' | 'center' | 'end'
    behavior?: ScrollBehavior
  }
): this

virtualizer.setViewport(size: number): this
virtualizer.setOffset(offset: number): this
virtualizer.reset(): this
```

## 最小示例

```ts
import { Virtualizer } from '@cat-kit/fe'

const rows = Array.from({ length: 10_000 }, (_, index) => `Row ${index}`)
const viewport = document.querySelector<HTMLElement>('#viewport')!
const content = document.createElement('div')

viewport.style.cssText = 'height:320px;overflow:auto'
content.style.position = 'relative'
viewport.append(content)

const virtualizer = new Virtualizer({
  count: rows.length,
  estimateSize: () => 40,
  useMeasuredAverage: false
})

const unsubscribe = virtualizer.subscribe(({ items, totalSize }) => {
  content.style.height = `${totalSize}px`
  content.replaceChildren(
    ...items.map((item) => {
      const row = document.createElement('div')
      row.textContent = rows[item.index] ?? ''
      row.style.cssText = `position:absolute;inset-inline:0;top:${item.start}px;height:${item.size}px`
      return row
    })
  )
})

virtualizer.connect(viewport)

// 组件卸载时：
unsubscribe()
virtualizer.destroy()
```

## 必要边界

- `connect` 的元素必须是真正发生滚动的容器。组件卸载时调用 `destroy()`；只想临时换容器时可 `disconnect()` 后重新连接。
- `subscribe` 注册时会立即调用一次，只在渲染结构或滚动状态变化时通知；逐像素但可见项未变化的滚动不保证通知。需要像素级位置时读取容器的 `scrollTop` / `scrollLeft`。
- 不要用 `getSnapshot()` 返回对象的引用相等性决定是否渲染；读取字段或使用 `subscribe`。
- `measureElement` 在支持 `ResizeObserver` 时异步更新尺寸，调用后不要假设快照已立即变化；元素卸载时传 `null`。
- `getItemKey` 必须对同一数据项持续返回同一个字符串或数字，不能使用随机数、时间或位置本身代替业务 ID。
- `setOffset` 只改逻辑状态，不滚动 DOM；真实跳转用 `scrollToOffset` / `scrollToIndex`。
- `scrollToIndex` 的 `align` 仅对该方法有效；`behavior: 'smooth'` 时偏移随浏览器滚动更新，调用后不要同步假设已到目标。
- `getItem` 越界会抛 `RangeError`。`reset()` 适合数据源整体替换；局部重排优先更新 `count` 和稳定 `getItemKey`。
- 只有根入口 `@cat-kit/fe` 是公开导入路径。

## 类型入口

[Virtualizer 声明](../../generated/fe/virtualizer/index.d.ts)
