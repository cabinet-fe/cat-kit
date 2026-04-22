/**
 * Virtualizer —— 单轴虚拟滚动核心。
 *
 * 设计要点：
 * - 职责聚焦：位置计算、测量派发、快照广播；渲染交给上层。
 * - 抖动消除：视口前方项测量变更时，同批次累积 scroll 补偿并在 recompute 统一 flush。
 * - 通知去重：纯 offset 变化不 notify，仅 range / items / totalSize / viewport /
 *   isScrolling 等结构性变化时推送快照。
 * - 未测项估值：默认沿用「已测平均值」，降低远距离滚动时 totalSize 跳变幅度。
 * - keyed items：可选 getItemKey 让测量缓存按稳定 key 存储，前插 / 乱序 / 中段删除
 *   时未变动项仍可复用真实测量。
 * - smooth 滚动校准：委托 {@link ScrollReconciler}，详见该文件。
 */

import { ResizeTracker } from './resize-tracker'
import { ScrollReconciler, readScrollOffset, writeScroll } from './scroll-reconciler'

/**
 * 未测项的尺寸估值函数。
 *
 * @param index - 项的索引，范围 `[0, count)`。
 * @returns 该项的预估像素尺寸（水平模式下为宽度，垂直模式下为高度）。负数会被 clamp 到 0。
 *
 * @remarks
 * 函数应尽量**无副作用、可重入**：同一 index 在短时间内可能被调用多次。
 * 若启用 `useMeasuredAverage`（默认），估值一旦有至少一个真实样本就会被「已测平均值」接管，
 * `estimateSize` 仅作为冷启动兜底与关闭 `useMeasuredAverage` 时的唯一来源。
 */
export type EstimateSize = (index: number) => number

/**
 * `scrollToIndex` 对齐方式。
 *
 * - `auto`：仅当目标项已在视口外才滚动，方向按最短路径（项在视口上方 → 对齐视口顶；下方 → 对齐视口底）
 * - `start`：项顶部（或左侧，水平模式）对齐视口起点
 * - `center`：项中线对齐视口中线
 * - `end`：项底部（或右侧）对齐视口终点
 */
export type VirtualAlign = 'auto' | 'start' | 'center' | 'end'

/**
 * `subscribe` 回调签名：在**结构性**变化发生时收到当前快照。
 *
 * 「结构性」包含 `range` / `items` / `totalSize` / `viewportSize` / `horizontal` / `isScrolling`
 * / `beforeSize` / `afterSize` 的变化；纯 `offset` 位移不会触发回调，请直接读容器 `scrollTop`。
 */
export type VirtualizerSubscriber = (snapshot: VirtualSnapshot) => void

/**
 * 基于 index 返回稳定 key 的函数，用于把测量缓存按数据项身份（而非位置索引）存储。
 *
 * @param index - 项的索引，范围 `[0, count)`。
 * @returns 该数据项的稳定 key。
 *
 * @remarks
 * **约束**：必须在整个 Virtualizer 生命周期内对同一数据项保持稳定；
 * 不要基于 `Math.random()`、当前时间或每次渲染新建的对象引用生成 key，
 * 否则测量缓存无法被正确识别并复用。
 */
export type GetItemKey = (index: number) => number | string

/** Virtualizer 初始化参数。字段均可选，缺省时使用安全默认值。 */
export interface VirtualizerOptions {
  /** 虚拟项总数，默认 0 */
  count?: number
  /** 可视区外额外保留的预渲染项数，默认 4 */
  overscan?: number
  /** 是否为水平滚动（否则为垂直），默认 false */
  horizontal?: boolean
  /** 列表首项前的固定内边距（px），默认 0 */
  paddingStart?: number
  /** 列表末项后的固定内边距（px），默认 0 */
  paddingEnd?: number
  /** 相邻两项之间的间距（px），语义与 CSS `gap` 对齐，默认 0 */
  gap?: number
  /** 初始滚动偏移（px），默认 0 */
  initialOffset?: number
  /** 未 mount 前使用的初始 viewport 尺寸（px），默认 0 */
  initialViewport?: number
  /** 项预估尺寸函数，默认返回 36 */
  estimateSize?: EstimateSize
  /**
   * 未测项是否使用「已测项平均尺寸」作为估值，默认 true。
   *
   * 开启后首个样本产生即全面替换估值，配合 scrollAdjustments 可显著缓解
   * estimateSize 与真实值偏差过大带来的滚动条抖动。
   */
  useMeasuredAverage?: boolean
  /**
   * 可选：基于 index 返回稳定 key，用于把测量缓存按数据项身份存储。
   *
   * 提供后列表前插 / 乱序 / 中段删除时，未变动项的真实测量值仍可被复用；
   * 未提供时行为与旧版本一致（按 index 缓存）。
   *
   * 约束：函数必须在整个生命周期稳定，同一数据项的 key 在任何时刻都应一致；
   * 不要基于 `Math.random()` 或当前时间生成 key。
   */
  getItemKey?: GetItemKey
}

/** 单个虚拟项的位置与尺寸，所有数值都是 `px`，相对列表内容起点（不含 `paddingStart`）。 */
export interface VirtualItem {
  /** 项在数据源中的索引。 */
  index: number
  /** 项起点（顶部 / 左侧）到列表内容起点的距离。 */
  start: number
  /** 项终点（底部 / 右侧）到列表内容起点的距离，等于 `start + size`。 */
  end: number
  /** 项尺寸（高度 / 宽度）。 */
  size: number
}

/** 可视区命中的原始索引范围（不含 `overscan`）。当 `count === 0` 或 `viewportSize <= 0` 时为 `null`。 */
export interface VirtualRange {
  /** 视口首次命中的项索引。 */
  startIndex: number
  /** 视口最后命中的项索引。 */
  endIndex: number
}

/**
 * 虚拟化快照：渲染层应依赖的唯一真源。
 *
 * 由 {@link Virtualizer.getSnapshot} 返回、通过 {@link Virtualizer.subscribe} 推送；
 * 纯 offset 位移不会产生新对象，只会**就地**更新现有对象的 `offset` / `isScrolling`。
 * 因此**不要**把快照当作不可变值做 `===` 对比判断是否需要重渲染；请对比结构字段
 * （`range` / `totalSize` 等）或直接订阅结构化推送。
 */
export interface VirtualSnapshot {
  /** 当前应渲染的项列表（已包含 `overscan` 扩张）。 */
  items: VirtualItem[]
  /** 不含 `overscan` 的原始可视区命中范围。 */
  range: VirtualRange | null
  /** 列表内容总尺寸（含 `paddingStart` / `paddingEnd`）。 */
  totalSize: number
  /** `items[0]` 前需预留的占位空间（含 `paddingStart`），用于 spacer 布局。 */
  beforeSize: number
  /** `items[items.length - 1]` 后需预留的占位空间（含 `paddingEnd`）。 */
  afterSize: number
  /** 当前滚动偏移（像素）。 */
  offset: number
  /** 当前容器视口尺寸。 */
  viewportSize: number
  /** 是否水平滚动。 */
  horizontal: boolean
  /** 是否处于滚动中（由 `scroll` / `scrollend` 事件与 120ms 兜底计时驱动）。 */
  isScrolling: boolean
}

/** {@link Virtualizer.scrollToIndex} / {@link Virtualizer.scrollToOffset} 的可选参数。 */
export interface VirtualScrollOptions {
  /** 对齐方式，默认 `auto`。仅对 `scrollToIndex` 生效；`scrollToOffset` 始终按 `start` 语义。 */
  align?: VirtualAlign
  /** 滚动行为，传 `'smooth'` 走浏览器原生平滑动画 + rAF 校准循环；默认 `'auto'`（同步跳转）。 */
  behavior?: ScrollBehavior
}

/** {@link Virtualizer.measureMany} 的一条测量记录。 */
export interface VirtualMeasurement {
  /** 项的索引，范围 `[0, count)`；越界的测量会被静默忽略。 */
  index: number
  /** 项的真实像素尺寸。 */
  size: number
}

const DEFAULT_ESTIMATE_SIZE: EstimateSize = () => 36
const SCROLL_END_DELAY = 120
const AVERAGE_INVALIDATION_THRESHOLD = 4

/** 限制数值在指定范围内 */
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

export class Virtualizer {
  /** 虚拟项总数 */
  private count = 0
  private overscan = 4
  private horizontal = false
  private paddingStart = 0
  private paddingEnd = 0
  private gap = 0
  private estimateSize: EstimateSize = DEFAULT_ESTIMATE_SIZE
  private useMeasuredAverage = true
  private getItemKey: GetItemKey | undefined

  private offset = 0
  private viewportSize = 0
  private isScrolling = false

  /**
   * 测量缓存的唯一真源。未启用 getItemKey 时 key 就是 index；启用时 key 为
   * getItemKey(index) 的结果。内部所有读写一律通过 `keyOf(index)` 间接访问。
   */
  private measuredByKey = new Map<number | string, number>()
  private measuredSum = 0
  private averageEstimate: number | null = null
  private firstUnmeasured = 0
  private starts: number[] = []
  private sizes: number[] = []
  private dirtyIndex = 0

  private snapshot: VirtualSnapshot = emptySnapshot()
  private subscribers = new Set<VirtualizerSubscriber>()

  private scrollElement: HTMLElement | null = null
  private containerObserver: ResizeObserver | null = null
  private scrollEndTimer: ReturnType<typeof setTimeout> | null = null
  private scrollEndNative = false
  /** 已测量的元素集合 */
  private mounted = new Map<number, Element>()
  /** 尺寸测量器 */
  private tracker: ResizeTracker
  /** 滚动矫正器 */
  private reconciler: ScrollReconciler

  /** 视口前方项尺寸变化的累积 delta，recompute 开头统一 flush 一次 DOM 写入。 */
  private pendingScrollAdjust = 0

  /**
   * 创建一个 Virtualizer 实例。所有选项都可延后通过 {@link Virtualizer.setOptions} / {@link Virtualizer.setCount} 等方法调整。
   *
   * @param options - 初始化参数，详见 {@link VirtualizerOptions}。
   *
   * @remarks
   * 构造函数**不会**挂载 DOM：实例创建后仍处于「未 mount」状态，需调用 {@link Virtualizer.mount} 绑定滚动容器。
   * 初始的 `offset` / `viewportSize` 可通过 `initialOffset` / `initialViewport` 提供，用于 SSR 首屏占位。
   *
   * @example
   * ```ts
   * import { Virtualizer } from '@cat-kit/fe'
   *
   * const v = new Virtualizer({
   *   count: 10_000,
   *   overscan: 6,
   *   estimateSize: () => 44,
   *   getItemKey: (i) => rows[i].id
   * })
   * ```
   */
  constructor(options: VirtualizerOptions = {}) {
    this.tracker = new ResizeTracker({
      isHorizontal: () => this.horizontal,
      onChange: (entries) => {
        let touched = false
        for (const e of entries) {
          const idx = this.tracker.getIndex(e.target)
          if (idx !== undefined && this.applyMeasurement(idx, e.size)) touched = true
        }
        if (touched) this.recompute()
      }
    })
    this.reconciler = new ScrollReconciler({
      getElement: () => this.scrollElement,
      isHorizontal: () => this.horizontal,
      targetForIndex: (index, align) => this.getOffsetForIndex(index, align),
      clampOffset: (offset) => this.clampOffset(offset)
    })

    this.applyOptions(options, true)
    this.recompute()
  }

  /**
   * 批量更新选项。只传需要变更的字段，未传字段保持当前值。
   *
   * @param options - 需要更新的字段集合，详见 {@link VirtualizerOptions}。
   * @returns 自身，支持链式调用。
   *
   * @remarks
   * - `initialOffset` / `initialViewport` 仅在构造时生效，这里传入会被忽略。
   * - **同轮更新顺序**：`getItemKey` 始终先于 `count` 应用，保证 `count` 剪裁使用的是新 key 空间，
   *   避免 `setOptions({ count, getItemKey })` 把数据重排后仍存活的测量误删。
   * - **`getItemKey` 切换语义**：
   *   - `function → function`（keyed → keyed）：保留 `measuredByKey`，旧 key 的真实测量值仍被复用（前插 / 乱序场景）。
   *   - `undefined ↔ function`（key 空间切换）：清空 `measuredByKey` / `measuredSum` / `averageEstimate`，避免跨空间污染。
   * - 任何触发「全量失效」的字段（`paddingStart` / `gap` / `estimateSize` / `useMeasuredAverage` / `getItemKey`）都会调用 `invalidate(0)` 重排所有项。
   *
   * @example
   * ```ts
   * v.setOptions({ count: 500, overscan: 8 })
   * v.setOptions({ count: newRows.length, getItemKey: (i) => newRows[i].id })
   * ```
   */
  setOptions(options: VirtualizerOptions): this {
    this.applyOptions(options, false)
    this.recompute()
    return this
  }

  /**
   * 更新虚拟项总数。
   *
   * @param count - 新的项数，负数会被 clamp 到 0，小数会被截断。
   * @returns 自身，支持链式调用。
   *
   * @remarks
   * - **收缩时**（`count < prevCount`）：`[count, prevCount)` 范围的测量缓存会被剪裁
   *   （keyed 模式按新 key 空间构造 alive 集合）；`mounted` 中同范围的元素会被 `unobserve`。
   * - **扩张时**（`count > prevCount`）：从 `prevCount` 起标记为待重算，后续渲染按 `estimateSize` / 已测平均值给出估值。
   * - 数值未变化时为 no-op，不触发快照更新。
   */
  setCount(count: number): this {
    if (this.updateCount(Math.max(0, Math.trunc(count)))) this.recompute()
    return this
  }

  /**
   * 设置可视区尺寸（px）。一般由 `mount` 后的 `ResizeObserver` 自动同步；
   * 仅在手动布局（SSR、无 ResizeObserver 环境、测试）时直接调用。
   *
   * @param size - 新的视口尺寸，负数会被 clamp 到 0，小数会被四舍五入。
   * @returns 自身，支持链式调用。
   *
   * @remarks `offset` 会按新视口重新 clamp，避免越界到 `totalSize - newViewport` 之外。
   */
  setViewport(size: number): this {
    const nextViewport = Math.max(0, Math.round(size))
    const nextOffset = this.clampOffsetWithViewport(this.offset, nextViewport)
    if (nextViewport === this.viewportSize && nextOffset === this.offset) return this
    this.viewportSize = nextViewport
    this.offset = nextOffset
    this.recompute()
    return this
  }

  /**
   * 直接设置逻辑 offset（px），不会写 DOM。
   *
   * @param offset - 目标偏移量，会被 clamp 到 `[0, totalSize - viewportSize]`，小数会被四舍五入。
   *
   * @remarks
   * 这是「只更新内部状态」的低阶入口，常用于 SSR 水合前恢复滚动位置；
   * 要让 DOM 真正跳转请用 {@link Virtualizer.scrollToOffset}。
   */
  setOffset(offset: number): this {
    const nextOffset = this.clampOffset(offset)
    if (nextOffset === this.offset) return this
    this.offset = nextOffset
    this.recompute()
    return this
  }

  /**
   * 绑定滚动容器。传入相同元素会触发一次 `syncFromElement` 但不重建事件监听；
   * 传入不同元素会先 `unmount` 旧容器再挂载新容器；传入 `null` 等价于 `unmount()`。
   *
   * @param element - 滚动容器，需是可滚动元素（`overflow: auto/scroll`）。
   * @returns 自身，支持链式调用。
   *
   * @remarks
   * mount 会：
   * 1. 订阅容器的 `scroll` 事件（passive）驱动 `offset` / `isScrolling`；支持原生 `scrollend` 时优先使用，否则 120ms 计时器兜底；
   * 2. 订阅容器的 `ResizeObserver`（若可用）驱动 `viewportSize`；
   * 3. 同步首帧：读取当前 `scrollTop` / `clientHeight` 写回到 `offset` / `viewportSize`。
   *
   * @example
   * ```ts
   * onMounted(() => virtualizer.mount(scrollRef.value))
   * onBeforeUnmount(() => virtualizer.destroy())
   * ```
   */
  mount(element: HTMLElement | null): this {
    if (!element) {
      this.unmount()
      return this
    }
    if (this.scrollElement === element) {
      this.syncFromElement()
      return this
    }
    this.unmount()
    this.scrollElement = element
    element.addEventListener('scroll', this.handleScroll, { passive: true })

    if ('onscrollend' in element) {
      element.addEventListener('scrollend', this.handleScrollEnd, { passive: true })
      this.scrollEndNative = true
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.containerObserver = new ResizeObserver(() => this.syncFromElement())
      this.containerObserver.observe(element)
    }
    this.syncFromElement()
    return this
  }

  /**
   * 解绑当前滚动容器：取消 rAF 校准循环、卸下 `scroll` / `scrollend` / `ResizeObserver`、
   * 清空 `mounted` 映射与 `ResizeTracker`。实例仍可被复用（再次 `mount` 到新容器）。
   *
   * @returns 自身，支持链式调用。
   *
   * @remarks 不清空测量缓存与订阅者；如需重置请用 {@link Virtualizer.reset} 或 {@link Virtualizer.destroy}。
   */
  unmount(): this {
    this.reconciler.cancel()
    this.pendingScrollAdjust = 0
    const el = this.scrollElement
    if (el) {
      el.removeEventListener('scroll', this.handleScroll)
      if (this.scrollEndNative) {
        el.removeEventListener('scrollend', this.handleScrollEnd)
        this.scrollEndNative = false
      }
    }
    this.scrollElement = null
    this.containerObserver?.disconnect()
    this.containerObserver = null
    if (this.scrollEndTimer !== null) {
      clearTimeout(this.scrollEndTimer)
      this.scrollEndTimer = null
    }
    this.tracker.disconnect()
    this.mounted.clear()
    return this
  }

  /**
   * 彻底销毁实例：`unmount` + 释放 `ResizeTracker` 内部引用 + 清空订阅者。
   * 销毁后不应再调用任何实例方法。
   *
   * @remarks 组件卸载时（Vue `onBeforeUnmount` / React `useEffect` cleanup）应调用此方法。
   */
  destroy(): void {
    this.unmount()
    this.tracker.destroy()
    this.subscribers.clear()
  }

  /**
   * 订阅结构化快照推送。注册时会**立即同步**调用一次 listener（传入当前快照），
   * 便于初次渲染；之后仅在结构性变化时触发。
   *
   * @param listener - 回调函数，入参为当前 {@link VirtualSnapshot}。
   * @returns 取消订阅函数；多次调用幂等。
   *
   * @remarks
   * - 「结构性变化」定义：`range` / `items` / `totalSize` / `viewportSize` / `horizontal` / `isScrolling` / `beforeSize` / `afterSize` 中任一字段变化。
   * - 纯 `offset` 位移**不会**触发 listener：业务若需要逐帧位移请直接读容器 `scrollTop` / `scrollLeft`。
   *
   * @example
   * ```ts
   * const unsubscribe = v.subscribe((snap) => {
   *   render(snap.items, snap.beforeSize, snap.afterSize)
   * })
   * // 后续卸载时
   * unsubscribe()
   * ```
   */
  subscribe(listener: VirtualizerSubscriber): () => void {
    this.subscribers.add(listener)
    listener(this.snapshot)
    return () => {
      this.subscribers.delete(listener)
    }
  }

  /**
   * 上报单条真实测量。等价于 `measureMany([{ index, size }])`。
   *
   * @param index - 项的索引，范围 `[0, count)`；越界静默忽略。
   * @param size - 真实像素尺寸，负数会被 clamp 到 0。
   * @returns 自身，支持链式调用。
   *
   * @remarks
   * 当数据层能直接提供真实行高 / 列宽（例如后端分页返回尺寸元信息）时使用；
   * 若尺寸需由 DOM 推断，优先用 {@link Virtualizer.measureElement}。
   */
  measure(index: number, size: number): this {
    return this.measureMany([{ index, size }])
  }

  /**
   * 批量上报真实测量。同批次内多条视口前方项的尺寸变化会被合并成**一次** `scrollTop` DOM 写入，
   * 避免抖动。
   *
   * @param measurements - 可迭代的测量记录，每条包含 `{ index, size }`。
   * @returns 自身，支持链式调用。
   *
   * @remarks
   * 大数据量首屏优先路径：
   * ```ts
   * virtualizer.measureMany(rows.map((r, i) => ({ index: i, size: r.height })))
   * ```
   * 一次 `measureMany` 后全部项均被精确测量，后续远距离 `scrollToIndex` 不会再遇到 `totalSize` 跳变。
   */
  measureMany(measurements: Iterable<VirtualMeasurement>): this {
    let changed = false
    for (const measurement of measurements) {
      if (this.applyMeasurement(measurement.index, measurement.size)) changed = true
    }
    if (changed) this.recompute()
    return this
  }

  /**
   * 测量元素尺寸
   *
   * @param index - 项的索引，范围 `[0, count)`。
   * @param element - 对应的 DOM 元素；传 `null` 表示卸载该 index（同步 `unobserve`）。
   *
   * @remarks
   * - 支持 `ResizeObserver` 的浏览器走异步路径，避免滚动中新挂载项触发同步布局读取；
   *   不支持时回退到 `getBoundingClientRect()` 并立即调用 `measure`。
   * - **keyed 模式下的 DOM 行复用**：同一 element 迁移到新 index 时，旧 index 的 `mounted` 条目会被自动清理，
   *   避免后续新元素进入旧 index 时误 `unobserve` 本节点（见 plan-42 修复）。
   * - 幂等：`measureElement(i, sameEl)` 不会重复 observe。
   *
   * @example
   * ```html
   * <div v-for="item in items" :ref="(el) => v.measureElement(item.index, el as Element)">
   *   ...
   * </div>
   * ```
   */
  measureElement(index: number, element: Element | null): void {
    const current = this.mounted.get(index)
    if (current === element && element) return

    if (element) {
      const oldIndex = this.tracker.getIndex(element)
      if (oldIndex !== undefined && oldIndex !== index) {
        if (this.mounted.get(oldIndex) === element) this.mounted.delete(oldIndex)
      }
    }

    if (current && current !== element) {
      this.tracker.unobserve(current)
      this.mounted.delete(index)
    }
    if (!element) return

    this.mounted.set(index, element)
    this.tracker.observe(index, element)

    // 优先交给 ResizeObserver 异步测量，避免滚动中新挂载项触发同步布局读取。
    if (typeof ResizeObserver !== 'undefined') return
    console.log(index)

    const rect = element.getBoundingClientRect()
    this.measure(index, Math.round(this.horizontal ? rect.width : rect.height))
  }

  /**
   * 滚动到指定像素偏移。
   *
   * @param offset - 目标 offset（px），会被 clamp 到 `[0, totalSize - viewportSize]`。
   * @param options - 可选 `behavior`（`'auto'` 默认 / `'smooth'`）；`align` 字段对本方法无效。
   * @returns 自身，支持链式调用。
   *
   * @remarks
   * - `behavior: 'auto'`（默认）：同步写 `scrollTop` + 同步 `recompute()`，`snapshot.offset` 立即等于目标值。
   * - `behavior: 'smooth'`：浏览器原生平滑滚动 + rAF 校准；`snapshot.offset` 由 scroll 事件逐帧驱动，**不**预写为目标值。
   *   用户在动画中手动滚动 / 再次调用 `scrollTo*` / `unmount` 会立即终止校准，另有 5 秒硬性安全阀兜底。
   * - 未绑定滚动容器时仍会更新逻辑 offset（`behavior: 'auto'`），但无 DOM 侧副作用。
   */
  scrollToOffset(offset: number, options: VirtualScrollOptions = {}): this {
    return this.performScroll(null, 'start', offset, options)
  }

  /**
   * 滚动到指定项。
   *
   * @param index - 目标项索引，会被 clamp 到 `[0, count - 1]`，小数截断。
   * @param options - 可选参数：`align` 对齐方式（默认 `'auto'`），`behavior` 滚动行为（默认 `'auto'`）。
   * @returns 自身，支持链式调用。
   *
   * @remarks
   * - `count === 0` 时为 no-op。
   * - `behavior: 'smooth'` 走浏览器原生平滑滚动 + rAF 校准循环：动画中若测量更新导致目标漂移（例如 `overscan` 外的未测项在滚入视口时才拿到真实尺寸），
   *   自动以 `behavior: 'auto'` 跳到修正后的目标位置。
   * - smooth 期间**不要**在调用后立即同步读 `snapshot.offset`，该值由 scroll 事件驱动；如需精确的中间状态，请订阅 {@link Virtualizer.subscribe} 或直接读容器 `scrollTop` / `scrollLeft`。
   *
   * @example
   * ```ts
   * v.scrollToIndex(120, { align: 'center' })
   * v.scrollToIndex(9999, { behavior: 'smooth' })
   * ```
   */
  scrollToIndex(index: number, options: VirtualScrollOptions = {}): this {
    if (!this.count) return this
    const targetIndex = clamp(Math.trunc(index), 0, this.count - 1)
    const align = options.align ?? 'auto'
    const next = this.getOffsetForIndex(targetIndex, align)
    return this.performScroll(targetIndex, align, next, options)
  }

  /**
   * 清空所有测量缓存与位置缓存、取消 rAF 校准、把 `offset` 归零后重算快照。
   *
   * @returns 自身，支持链式调用。
   *
   * @remarks
   * 常用于「数据源整体替换」（新的 `count` 与全新的数据项）；
   * 如果数据仅部分变化且能提供稳定 key，优先用 `getItemKey` 保留历史测量，而不是 `reset()` 全量清空。
   * 不会解绑滚动容器，也不会清除订阅者。
   */
  reset(): this {
    this.reconciler.cancel()
    this.pendingScrollAdjust = 0
    this.measuredByKey.clear()
    this.measuredSum = 0
    this.averageEstimate = null
    this.firstUnmeasured = 0
    this.sizes = []
    this.starts = []
    this.dirtyIndex = 0
    this.offset = 0
    this.recompute()
    return this
  }

  /**
   * 读取当前快照。同一对象引用在纯 `offset` 位移帧里会保留不变（仅就地改 `offset` / `isScrolling`），
   * 因此**不要**用 `===` 判断是否需要重渲染；请对比结构字段（`range` / `totalSize` 等）或走 {@link Virtualizer.subscribe}。
   *
   * @returns 当前 {@link VirtualSnapshot}。
   */
  getSnapshot(): VirtualSnapshot {
    return this.snapshot
  }

  /**
   * 读取某个 index 对应的虚拟项位置信息。会确保内部位置缓存已重算（懒计算）。
   *
   * @param index - 项的索引，必须落在 `[0, count)`。
   * @returns 该项的 {@link VirtualItem}（包含 `start` / `end` / `size`）。
   * @throws `RangeError` 当 `index` 超出 `[0, count)` 范围。
   *
   * @remarks 常用于业务侧计算「第 N 项是否可见」「第 N 项在视口内的相对位置」等；内部滚动对齐由 `scrollToIndex` 自动处理，无需手动调用此方法。
   */
  getItem(index: number): VirtualItem {
    this.ensureMeasurements()
    if (index < 0 || index >= this.count) {
      throw new RangeError(`Virtual item index out of range: ${index}`)
    }
    const size = this.sizes[index]!
    const start = this.starts[index]!
    return { index, start, end: start + size, size }
  }

  private applyOptions(o: VirtualizerOptions, initial: boolean): void {
    // getItemKey 必须先于 count：同轮 setOptions({ count, getItemKey }) 时 updateCount
    // -> pruneMeasured 需按新 key 空间构造 alive 集合，用旧 getItemKey 会误删新映射
    // 下仍存活的条目。切换语义：keyed↔non-keyed（key 类型变）须清空 measured 避免
    // 跨空间污染；keyed→keyed（函数身份变）保留旧 key 可信（前插/乱序复用测量）。
    // firstUnmeasured 按 index 维护已测前缀，任一 key 语义变化都须重置。
    if (Object.prototype.hasOwnProperty.call(o, 'getItemKey')) {
      if (this.getItemKey !== o.getItemKey) {
        const prevKeyed = this.getItemKey !== undefined
        const nextKeyed = o.getItemKey !== undefined
        this.getItemKey = o.getItemKey
        if (prevKeyed !== nextKeyed) {
          this.measuredByKey.clear()
          this.measuredSum = 0
          this.averageEstimate = null
        }
        this.firstUnmeasured = 0
        this.invalidate(0)
      }
    }
    if (o.count !== undefined) this.updateCount(Math.max(0, Math.trunc(o.count)))
    if (o.overscan !== undefined) this.overscan = Math.max(0, Math.trunc(o.overscan))
    if (o.horizontal !== undefined) this.horizontal = o.horizontal
    if (o.paddingStart !== undefined) {
      this.paddingStart = Math.max(0, Math.round(o.paddingStart))
      this.invalidate(0)
    }
    if (o.paddingEnd !== undefined) this.paddingEnd = Math.max(0, Math.round(o.paddingEnd))
    if (o.gap !== undefined) {
      this.gap = Math.max(0, Math.round(o.gap))
      this.invalidate(0)
    }
    if (o.estimateSize !== undefined) {
      this.estimateSize = o.estimateSize
      this.invalidate(0)
    }
    if (o.useMeasuredAverage !== undefined) {
      this.useMeasuredAverage = o.useMeasuredAverage
      this.invalidate(0)
    }
    if (o.initialOffset !== undefined && initial) {
      this.offset = Math.max(0, Math.round(o.initialOffset))
    }
    if (o.initialViewport !== undefined && initial) {
      this.viewportSize = Math.max(0, Math.round(o.initialViewport))
    }
  }

  /** 更新 count 并同步测量 / mounted 剪裁与 dirty 指针。返回是否发生变化。 */
  private updateCount(next: number): boolean {
    if (next === this.count) return false
    const prev = this.count
    this.count = next
    this.pruneMeasured(next)
    this.sizes.length = next
    this.starts.length = next
    if (next > prev) this.invalidate(prev)
    else this.dirtyIndex = Math.min(this.dirtyIndex, next)
    this.pruneMounted(next)
    return true
  }

  private keyOf(index: number): number | string {
    return this.getItemKey ? this.getItemKey(index) : index
  }

  /** 未测项估值：优先已测平均值（若启用），否则 estimateSize。 */
  private estimate(index: number): number {
    if (this.useMeasuredAverage && this.averageEstimate !== null) {
      return this.averageEstimate
    }
    return Math.max(0, Math.round(this.estimateSize(index)))
  }

  private pruneMeasured(count: number): void {
    if (this.measuredByKey.size === 0) return
    // keyed 模式按新 key 空间构造 alive；non-keyed 直接按 index 数值剪裁。
    const getKey = this.getItemKey
    if (getKey) {
      const alive = new Set<number | string>()
      for (let i = 0; i < count; i++) alive.add(getKey(i))
      for (const [key, size] of this.measuredByKey) {
        if (!alive.has(key)) {
          this.measuredByKey.delete(key)
          this.measuredSum -= size
        }
      }
    } else {
      for (const [key, size] of this.measuredByKey) {
        if (typeof key === 'number' && key >= count) {
          this.measuredByKey.delete(key)
          this.measuredSum -= size
        }
      }
    }
    this.syncAverageEstimate()
    this.firstUnmeasured = Math.min(this.firstUnmeasured, count)
  }

  private pruneMounted(count: number): void {
    for (const [i, el] of this.mounted) {
      if (i >= count) {
        this.tracker.unobserve(el)
        this.mounted.delete(i)
      }
    }
  }

  private invalidate(fromIndex: number): void {
    const v = Math.max(0, fromIndex)
    if (v < this.dirtyIndex) this.dirtyIndex = v
  }

  /**
   * 应用测量：更新缓存、触发 invalidate、并在必要时做 scrollAdjustments 抑制抖动。
   * 返回 true 表示发生了有效变化，调用方需 recompute。
   */
  private applyMeasurement(index: number, rawSize: number): boolean {
    if (index < 0 || index >= this.count) return false
    const size = Math.max(0, Math.round(rawSize))
    const key = this.keyOf(index)
    const prev = this.measuredByKey.get(key)
    if (prev === size) return false

    const prevAverage = this.averageEstimate

    // 抖动抑制：若该项已在当前 offset 前方（视口上方），尺寸变化会把
    // 可视区内容"挤走"。此时用旧估值与新真实值的差做反向 scrollTop 补偿。
    const prevSize = prev ?? this.estimate(index)
    const delta = size - prevSize
    const itemStart = this.starts[index]
    const needAdjust =
      delta !== 0 &&
      itemStart !== undefined &&
      itemStart + prevSize <= this.offset &&
      this.scrollElement !== null

    if (prev === undefined) this.measuredSum += size
    else this.measuredSum += size - prev
    this.measuredByKey.set(key, size)
    if (index === this.firstUnmeasured) this.advanceFirstUnmeasured()
    this.syncAverageEstimate()
    const averageDirtyFrom = prevAverage === null ? 0 : this.findNextUnmeasured(index + 1)

    this.invalidate(index)

    // 抖动抑制：逻辑 offset 立即推进，DOM 写入累积到 recompute 统一 flush。
    if (needAdjust) {
      this.offset += delta
      this.pendingScrollAdjust += delta
    }

    // 平均值仅在整数级漂移时回刷未测段：首次建立全量回刷（averageDirtyFrom=0），后续
    // 只回刷当前测量点之后的未测区间，避免退化成从 0 重算整表。
    if (
      this.useMeasuredAverage &&
      this.shouldInvalidateAverage(prevAverage, this.averageEstimate) &&
      averageDirtyFrom < this.count
    ) {
      this.invalidate(averageDirtyFrom)
    }

    return true
  }

  private syncAverageEstimate(): void {
    this.averageEstimate =
      this.measuredByKey.size > 0 ? Math.round(this.measuredSum / this.measuredByKey.size) : null
  }

  private shouldInvalidateAverage(prev: number | null, next: number | null): boolean {
    if (prev === next) return false
    if (next === null) return false
    if (prev === null) return true
    return Math.abs(next - prev) >= AVERAGE_INVALIDATION_THRESHOLD
  }

  private advanceFirstUnmeasured(): void {
    while (
      this.firstUnmeasured < this.count &&
      this.measuredByKey.has(this.keyOf(this.firstUnmeasured))
    ) {
      this.firstUnmeasured++
    }
  }

  private findNextUnmeasured(fromIndex: number): number {
    let index = clamp(fromIndex, 0, this.count)
    while (index < this.count && this.measuredByKey.has(this.keyOf(index))) index++
    return index
  }

  private ensureMeasurements(): void {
    if (this.count === 0) {
      this.starts = []
      this.sizes = []
      this.dirtyIndex = 0
      return
    }
    const from = clamp(this.dirtyIndex, 0, this.count)
    if (from >= this.count) return

    let cursor =
      from === 0 ? this.paddingStart : this.starts[from - 1]! + this.sizes[from - 1]! + this.gap

    for (let i = from; i < this.count; i++) {
      const size = this.measuredByKey.get(this.keyOf(i)) ?? this.estimate(i)
      this.starts[i] = cursor
      this.sizes[i] = size
      cursor += size
      if (i < this.count - 1) cursor += this.gap
    }
    this.dirtyIndex = this.count
  }

  private recompute(): void {
    // 累积的滚动补偿在这里合并成一次 DOM 写入（所有 mutation 最终都走 recompute）。
    if (this.pendingScrollAdjust !== 0) {
      const el = this.scrollElement
      if (el) {
        if (this.horizontal) el.scrollLeft = this.offset
        else el.scrollTop = this.offset
      }
      this.pendingScrollAdjust = 0
    }
    this.ensureMeasurements()
    const totalSize = this.computeTotalSize()
    const nextOffset = this.clampOffsetWithViewport(this.offset, this.viewportSize)
    if (nextOffset !== this.offset) this.offset = nextOffset

    const range = this.calculateRange(this.offset)
    const itemStartIndex = range ? Math.max(0, range.startIndex - this.overscan) : -1
    const itemEndIndex = range ? Math.min(this.count - 1, range.endIndex + this.overscan) : -1
    const itemsLength = itemStartIndex === -1 ? 0 : itemEndIndex - itemStartIndex + 1
    const beforeSize = itemsLength ? this.starts[itemStartIndex]! : this.paddingStart
    const afterSize = itemsLength
      ? Math.max(0, totalSize - (this.starts[itemEndIndex]! + this.sizes[itemEndIndex]!))
      : totalSize

    if (
      this.isStructuralEqual(
        this.snapshot,
        totalSize,
        range,
        beforeSize,
        afterSize,
        itemStartIndex,
        itemsLength
      )
    ) {
      // 结构未变只是 offset 变化：不 notify、不分配新快照，就地更新 offset/isScrolling。
      // 高刷下 scroll 每秒可触发上百次，spread 新对象会形成可观 GC 压力。
      this.snapshot.offset = this.offset
      this.snapshot.isScrolling = this.isScrolling
      return
    }

    const items = itemsLength ? this.createItems(itemStartIndex, itemEndIndex) : []
    const next: VirtualSnapshot = {
      items,
      range,
      totalSize,
      beforeSize,
      afterSize,
      offset: this.offset,
      viewportSize: this.viewportSize,
      horizontal: this.horizontal,
      isScrolling: this.isScrolling
    }

    this.snapshot = next
    for (const sub of this.subscribers) sub(next)
  }

  /** 只比较会影响视觉结构的字段；offset 变化不算"结构性差异"。 */
  private isStructuralEqual(
    prev: VirtualSnapshot,
    totalSize: number,
    range: VirtualRange | null,
    beforeSize: number,
    afterSize: number,
    itemStartIndex: number,
    itemsLength: number
  ): boolean {
    if (
      prev.totalSize !== totalSize ||
      prev.viewportSize !== this.viewportSize ||
      prev.horizontal !== this.horizontal ||
      prev.isScrolling !== this.isScrolling ||
      prev.beforeSize !== beforeSize ||
      prev.afterSize !== afterSize ||
      prev.items.length !== itemsLength ||
      prev.range?.startIndex !== range?.startIndex ||
      prev.range?.endIndex !== range?.endIndex
    ) {
      return false
    }
    if (itemsLength === 0) return true

    for (let i = 0; i < itemsLength; i++) {
      const index = itemStartIndex + i
      const item = prev.items[i]!
      if (
        item.index !== index ||
        item.start !== this.starts[index] ||
        item.size !== this.sizes[index]
      ) {
        return false
      }
    }

    return true
  }

  private computeTotalSize(): number {
    if (!this.count) return this.paddingStart + this.paddingEnd
    const lastStart = this.starts[this.count - 1]!
    const lastSize = this.sizes[this.count - 1]!
    return lastStart + lastSize + this.paddingEnd
  }

  private calculateRange(offset: number): VirtualRange | null {
    if (!this.count || this.viewportSize <= 0) return null

    const startIndex = this.findStartIndex(offset)
    return { startIndex, endIndex: this.findEndIndex(offset + this.viewportSize, startIndex) }
  }

  private createItems(from: number, to: number): VirtualItem[] {
    const out: VirtualItem[] = []
    out.length = to - from + 1
    for (let i = from; i <= to; i++) {
      const start = this.starts[i]!
      const size = this.sizes[i]!
      out[i - from] = { index: i, start, end: start + size, size }
    }
    return out
  }

  private findStartIndex(offset: number): number {
    let lo = 0
    let hi = this.count - 1
    let result = 0
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const end = this.starts[mid]! + this.sizes[mid]!
      if (end > offset) {
        result = mid
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return result
  }

  private findEndIndex(viewportEnd: number, startIndex: number): number {
    let lo = startIndex
    let hi = this.count - 1
    let result = startIndex
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (this.starts[mid]! < viewportEnd) {
        result = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return result
  }

  private clampOffset(offset: number): number {
    return this.clampOffsetWithViewport(offset, this.viewportSize)
  }

  private clampOffsetWithViewport(offset: number, viewportSize: number): number {
    const max = Math.max(0, this.computeTotalSize() - viewportSize)
    return clamp(Math.round(offset), 0, max)
  }

  /** align 换算：纯函数，不写 DOM；供 scrollToIndex 与 Reconciler 共用。 */
  private getOffsetForIndex(index: number, align: VirtualAlign): number {
    const item = this.getItem(index)
    const viewportEnd = this.offset + this.viewportSize
    if (align === 'start') return item.start
    if (align === 'end') return item.end - this.viewportSize
    if (align === 'center') return item.start - (this.viewportSize - item.size) / 2
    if (item.start < this.offset) return item.start
    if (item.end > viewportEnd) return item.end - this.viewportSize
    return this.offset
  }

  /**
   * scroll 入口：non-smooth 同步写 + recompute；smooth 委托 Reconciler 的 rAF 校准循环
   * 并不预写 this.offset（由 scroll 事件驱动）。
   */
  private performScroll(
    index: number | null,
    align: VirtualAlign,
    offset: number,
    options: VirtualScrollOptions
  ): this {
    const target = this.clampOffset(offset)
    const el = this.scrollElement
    const behavior = options.behavior

    // 新的 scrollTo* 先终止上一次 reconcile，避免历史状态泄漏到本次。
    this.reconciler.cancel()

    if (behavior === 'smooth' && el !== null) {
      this.reconciler.start(index, align, target)
      return this
    }

    const currentDom = el ? readScrollOffset(el, this.horizontal) : null
    if (target === this.offset && (currentDom === null || currentDom === target)) return this
    if (el) writeScroll(el, this.horizontal, target, behavior)
    this.offset = target
    this.recompute()
    return this
  }

  private syncFromElement(): void {
    const el = this.scrollElement
    if (!el) return
    const nextViewport = this.horizontal ? el.clientWidth : el.clientHeight
    const nextOffset = this.clampOffsetWithViewport(
      readScrollOffset(el, this.horizontal),
      nextViewport
    )
    if (nextViewport === this.viewportSize && nextOffset === this.offset) return
    this.viewportSize = nextViewport
    this.offset = nextOffset
    this.recompute()
  }

  private handleScroll = (): void => {
    const el = this.scrollElement
    if (!el) return
    const nextOffset = this.clampOffset(readScrollOffset(el, this.horizontal))

    // smooth 抢占检测委托 Reconciler（按「距离 target 单调递减」不变式识别并 cancel）。
    this.reconciler.observeScroll(nextOffset)

    if (this.isScrolling && nextOffset === this.offset) {
      if (!this.scrollEndNative) this.kickScrollEndTimer()
      return
    }
    this.isScrolling = true
    this.offset = nextOffset
    this.recompute()
    if (!this.scrollEndNative) this.kickScrollEndTimer()
  }

  private handleScrollEnd = (): void => {
    this.markScrollEnd()
  }

  private kickScrollEndTimer(): void {
    if (this.scrollEndTimer !== null) clearTimeout(this.scrollEndTimer)
    this.scrollEndTimer = setTimeout(() => {
      this.scrollEndTimer = null
      this.markScrollEnd()
    }, SCROLL_END_DELAY)
  }

  private markScrollEnd(): void {
    if (!this.isScrolling) return
    this.isScrolling = false
    this.recompute()
  }
}

function emptySnapshot(): VirtualSnapshot {
  return {
    items: [],
    range: null,
    totalSize: 0,
    beforeSize: 0,
    afterSize: 0,
    offset: 0,
    viewportSize: 0,
    horizontal: false,
    isScrolling: false
  }
}
