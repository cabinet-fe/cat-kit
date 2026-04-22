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

export type EstimateSize = (index: number) => number
export type VirtualAlign = 'auto' | 'start' | 'center' | 'end'
export type VirtualizerSubscriber = (snapshot: VirtualSnapshot) => void
export type GetItemKey = (index: number) => number | string

/** Virtualizer 初始化参数。字段均可选，缺省时使用安全默认值。 */
export interface VirtualizerOptions {
  /** 虚拟项总数，默认 0 */
  count?: number
  /** 可视区外额外保留的预渲染项数，默认 6 */
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

export interface VirtualItem {
  index: number
  start: number
  end: number
  size: number
}

export interface VirtualRange {
  startIndex: number
  endIndex: number
}

export interface VirtualSnapshot {
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

export interface VirtualScrollOptions {
  align?: VirtualAlign
  behavior?: ScrollBehavior
}

export interface VirtualMeasurement {
  index: number
  size: number
}

const DEFAULT_ESTIMATE_SIZE: EstimateSize = () => 36
const SCROLL_END_DELAY = 120
const AVERAGE_INVALIDATION_THRESHOLD = 4

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

export class Virtualizer {
  private count = 0
  private overscan = 6
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
  private mounted = new Map<number, Element>()
  private tracker: ResizeTracker
  private reconciler: ScrollReconciler

  /** 视口前方项尺寸变化的累积 delta，recompute 开头统一 flush 一次 DOM 写入。 */
  private pendingScrollAdjust = 0

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

  setOptions(options: VirtualizerOptions): this {
    this.applyOptions(options, false)
    this.recompute()
    return this
  }

  setCount(count: number): this {
    if (this.updateCount(Math.max(0, Math.trunc(count)))) this.recompute()
    return this
  }

  setViewport(size: number): this {
    const nextViewport = Math.max(0, Math.round(size))
    const nextOffset = this.clampOffsetWithViewport(this.offset, nextViewport)
    if (nextViewport === this.viewportSize && nextOffset === this.offset) return this
    this.viewportSize = nextViewport
    this.offset = nextOffset
    this.recompute()
    return this
  }

  setOffset(offset: number): this {
    const nextOffset = this.clampOffset(offset)
    if (nextOffset === this.offset) return this
    this.offset = nextOffset
    this.recompute()
    return this
  }

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

  destroy(): void {
    this.unmount()
    this.tracker.destroy()
    this.subscribers.clear()
  }

  subscribe(listener: VirtualizerSubscriber): () => void {
    this.subscribers.add(listener)
    listener(this.snapshot)
    return () => {
      this.subscribers.delete(listener)
    }
  }

  measure(index: number, size: number): this {
    return this.measureMany([{ index, size }])
  }

  measureMany(measurements: Iterable<VirtualMeasurement>): this {
    let changed = false
    for (const measurement of measurements) {
      if (this.applyMeasurement(measurement.index, measurement.size)) changed = true
    }
    if (changed) this.recompute()
    return this
  }

  measureElement(index: number, element: Element | null): void {
    const current = this.mounted.get(index)
    if (current === element && element) return

    if (element) {
      // keyed 模式下同一 DOM 节点会在 index 间迁移（行复用）：清掉 mounted[oldIndex]
      // 指向该 element 的陈旧条目，避免后续新元素进入 oldIndex 时误 unobserve 本节点。
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

    const rect = element.getBoundingClientRect()
    this.measure(index, Math.round(this.horizontal ? rect.width : rect.height))
  }

  scrollToOffset(offset: number, options: VirtualScrollOptions = {}): this {
    return this.performScroll(null, 'start', offset, options)
  }

  scrollToIndex(index: number, options: VirtualScrollOptions = {}): this {
    if (!this.count) return this
    const targetIndex = clamp(Math.trunc(index), 0, this.count - 1)
    const align = options.align ?? 'auto'
    const next = this.getOffsetForIndex(targetIndex, align)
    return this.performScroll(targetIndex, align, next, options)
  }

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

  getSnapshot(): VirtualSnapshot {
    return this.snapshot
  }

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
