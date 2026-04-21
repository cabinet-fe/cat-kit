/**
 * Virtualizer —— Vue composable / 框架适配层的虚拟滚动核心。
 *
 * 定位：仅负责位置计算、测量派发与快照广播；不持有 DOM 渲染职责，
 * 具体的元素挂载/卸载由上层 composable 或组件完成。
 */

export type EstimateSize = (index: number) => number
export type VirtualAlign = 'auto' | 'start' | 'center' | 'end'
export type VirtualizerSubscriber = (snapshot: VirtualSnapshot) => void

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
  /** 相邻两项之间的间距（px），不作用于首尾；语义与 CSS `gap` 对齐，默认 0 */
  gap?: number
  /** 初始滚动偏移（px），默认 0 */
  initialOffset?: number
  /** 未 mount 前使用的初始 viewport 尺寸（px），默认 0 */
  initialViewport?: number
  /** 项预估尺寸函数，默认返回 36 */
  estimateSize?: EstimateSize
}

/** 单个虚拟项在滚动轴上的位置描述。 */
export interface VirtualItem {
  /** 对应的绝对索引 */
  index: number
  /** 在滚动轴上的起点（px，含 paddingStart） */
  start: number
  /** 在滚动轴上的终点（px，= start + size） */
  end: number
  /** 实际测量或预估的尺寸（px） */
  size: number
}

/** 当前可见范围（未挂载或 viewport 为空时为 null）。 */
export interface VirtualRange {
  /** 可视区内首个命中项的索引 */
  startIndex: number
  /** 可视区内最后一个命中项的索引 */
  endIndex: number
}

/** 外部订阅所拿到的快照；同一 recompute 期间保证不可变。 */
export interface VirtualSnapshot {
  /** 需要渲染的虚拟项列表（已含 overscan） */
  items: VirtualItem[]
  /** 纯可视区范围（不含 overscan），可能为 null */
  range: VirtualRange | null
  /** 内容总尺寸（px，含 paddingStart、gap、paddingEnd） */
  totalSize: number
  /** 首个渲染项前的占位尺寸（用于做块状 spacer） */
  beforeSize: number
  /** 末个渲染项后的占位尺寸 */
  afterSize: number
  /** 当前滚动偏移（px） */
  offset: number
  /** 当前 viewport 尺寸（px） */
  viewportSize: number
  /** 当前是否为水平模式 */
  horizontal: boolean
  /** 当前是否处于滚动中（用于 UI 控制 hover、悬浮等） */
  isScrolling: boolean
}

/** 滚动到指定位置/索引时的选项。 */
export interface VirtualScrollOptions {
  /** 对齐方式：auto 仅在不可见时滚入、start/center/end 强制对齐 */
  align?: VirtualAlign
  /** 原生 scrollTo 行为 */
  behavior?: ScrollBehavior
}

const DEFAULT_ESTIMATE_SIZE = () => 36
const DEFAULT_SCROLL_END_DELAY = 120

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getMeasuredSize(element: Element, horizontal: boolean): number {
  const rect = element.getBoundingClientRect()
  return Math.round(horizontal ? rect.width : rect.height)
}

export class Virtualizer {
  private count = 0
  private overscan = 6
  private horizontal = false
  private paddingStart = 0
  private paddingEnd = 0
  private gap = 0
  private estimateSize: EstimateSize = DEFAULT_ESTIMATE_SIZE

  private offset = 0
  private viewportSize = 0
  private isScrolling = false

  private measuredSizes = new Map<number, number>()
  private starts: number[] = []
  private ends: number[] = []
  private sizes: number[] = []
  private dirtyIndex = 0

  private snapshot: VirtualSnapshot = {
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

  private subscribers = new Set<VirtualizerSubscriber>()
  private scrollElement: HTMLElement | null = null
  private elementIndexes = new WeakMap<Element, number>()
  private mountedItems = new Map<number, Element>()
  private itemObserver: ResizeObserver | null = null
  private containerObserver: ResizeObserver | null = null
  private scrollEndTimer: ReturnType<typeof setTimeout> | null = null
  private scrollEndListenerAttached = false

  constructor(options: VirtualizerOptions = {}) {
    this.applyOptions(options)
    this.recompute()
  }

  /**
   * 批量更新配置；仅提供的字段会生效，未提供者保持原值。
   * 完成后总会触发一次重算，可能派发 notify。
   */
  setOptions(options: VirtualizerOptions): this {
    this.applyOptions(options)
    this.recompute()
    return this
  }

  /**
   * 设置总项数。增长时仅对新增尾部失效，收缩时复用现有缓存，避免 O(count) 全量重算。
   */
  setCount(count: number): this {
    const nextCount = Math.max(0, Math.trunc(count))
    const prev = this.count
    if (nextCount === prev) {
      return this
    }

    this.count = nextCount
    this.pruneCaches()

    if (nextCount > prev) {
      this.invalidateFrom(prev)
    } else {
      this.dirtyIndex = Math.min(this.dirtyIndex, nextCount)
    }

    this.recompute()
    return this
  }

  /** 设置 viewport 尺寸；常由外部观察器或 composable 调用。 */
  setViewport(size: number): this {
    this.viewportSize = Math.max(0, Math.round(size))
    this.offset = this.clampOffset(this.offset)
    this.recompute()
    return this
  }

  /** 手动设置滚动偏移，不会驱动真实 DOM 滚动（对应方法为 scrollToOffset）。 */
  setOffset(offset: number): this {
    this.offset = this.clampOffset(offset)
    this.recompute()
    return this
  }

  /**
   * 挂载到滚动容器：注册 scroll / scrollend 监听，并用容器 ResizeObserver 跟踪 viewport。
   * 再次传入同一元素时仅做同步；传入 null 等同于 unmount。
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
      this.scrollEndListenerAttached = true
    }

    this.observeContainer(element)
    this.syncFromElement()
    return this
  }

  /** 卸载当前容器：移除监听、断开容器观察器、清理滚动结束定时器。不清除订阅者。 */
  unmount(): this {
    if (this.scrollElement) {
      this.scrollElement.removeEventListener('scroll', this.handleScroll)

      if (this.scrollEndListenerAttached) {
        this.scrollElement.removeEventListener('scrollend', this.handleScrollEnd)
        this.scrollEndListenerAttached = false
      }
    }

    this.scrollElement = null
    this.containerObserver?.disconnect()
    this.containerObserver = null
    this.stopScrollTracking()
    return this
  }

  /** 彻底销毁：unmount + 断开项观察器、清空 mounted 元素映射与订阅者。 */
  destroy(): void {
    this.unmount()
    this.itemObserver?.disconnect()
    this.itemObserver = null
    this.mountedItems.clear()
    this.subscribers.clear()
  }

  /**
   * 订阅快照变化；订阅时会立即推送一次当前快照以便初始化渲染。
   * 返回的函数用于取消订阅。
   */
  subscribe(listener: VirtualizerSubscriber): () => void {
    this.subscribers.add(listener)
    listener(this.snapshot)
    return () => {
      this.subscribers.delete(listener)
    }
  }

  /**
   * 外部提供真实尺寸进行单项测量；若尺寸发生变化会立即重算并可能 notify。
   * 越界或未变化的测量为 no-op。
   */
  measure(index: number, size: number): this {
    if (this.applyMeasurement(index, size)) {
      this.recompute()
    }
    return this
  }

  /**
   * 将 DOM 元素与索引绑定并交给 ResizeObserver 跟踪；元素变化时自动解绑旧元素。
   * 传 null 等同于解绑。会立刻基于元素的当前尺寸做一次测量。
   */
  measureElement(index: number, element: Element | null): void {
    const current = this.mountedItems.get(index)

    if (current && current !== element) {
      this.itemObserver?.unobserve(current)
      this.mountedItems.delete(index)
    }

    if (!element) {
      return
    }

    this.mountedItems.set(index, element)
    this.elementIndexes.set(element, index)
    this.ensureItemObserver()?.observe(element)
    this.measure(index, getMeasuredSize(element, this.horizontal))
  }

  /**
   * 驱动真实 DOM 滚动到指定偏移（若已 mount），并同步内部 offset。
   */
  scrollToOffset(offset: number, options: VirtualScrollOptions = {}): this {
    const target = this.clampOffset(offset)

    if (this.scrollElement) {
      this.scrollElement.scrollTo({
        [this.horizontal ? 'left' : 'top']: target,
        behavior: options.behavior
      })
    }

    this.offset = target
    this.recompute()
    return this
  }

  /**
   * 滚动到指定索引；align 为 auto 时仅在该项不完全可见时滚入。
   */
  scrollToIndex(index: number, options: VirtualScrollOptions = {}): this {
    if (!this.count) {
      return this
    }

    const targetIndex = clamp(Math.trunc(index), 0, this.count - 1)
    const item = this.getItem(targetIndex)
    const { align = 'auto', behavior } = options
    const viewportEnd = this.offset + this.viewportSize

    let nextOffset = this.offset

    if (align === 'start') {
      nextOffset = item.start
    } else if (align === 'end') {
      nextOffset = item.end - this.viewportSize
    } else if (align === 'center') {
      nextOffset = item.start - (this.viewportSize - item.size) / 2
    } else if (item.start < this.offset) {
      nextOffset = item.start
    } else if (item.end > viewportEnd) {
      nextOffset = item.end - this.viewportSize
    }

    return this.scrollToOffset(nextOffset, { behavior })
  }

  /** 清空所有测量缓存并将 offset 归零；通常用于数据源整体替换的场景。 */
  reset(): this {
    this.measuredSizes.clear()
    this.starts = []
    this.ends = []
    this.sizes = []
    this.dirtyIndex = 0
    this.offset = 0
    this.recompute()
    return this
  }

  /** 返回当前快照；同一 recompute 期内引用稳定，未变化时也不会重建对象。 */
  getSnapshot(): VirtualSnapshot {
    return this.snapshot
  }

  /**
   * 按索引获取单项的最新位置；快照不提供此类随机访问，故保留为公共方法。
   * 越界抛出 RangeError。
   */
  getItem(index: number): VirtualItem {
    this.ensureMeasurements()

    if (index < 0 || index >= this.count) {
      throw new RangeError(`Virtual item index out of range: ${index}`)
    }

    return { index, start: this.starts[index]!, end: this.ends[index]!, size: this.sizes[index]! }
  }

  private applyOptions(options: VirtualizerOptions): void {
    if (options.count !== undefined) {
      this.count = Math.max(0, Math.trunc(options.count))
      this.pruneCaches()
    }

    if (options.overscan !== undefined) {
      this.overscan = Math.max(0, Math.trunc(options.overscan))
    }

    if (options.horizontal !== undefined) {
      this.horizontal = options.horizontal
    }

    if (options.paddingStart !== undefined) {
      this.paddingStart = Math.max(0, Math.round(options.paddingStart))
      this.invalidateFrom(0)
    }

    if (options.paddingEnd !== undefined) {
      this.paddingEnd = Math.max(0, Math.round(options.paddingEnd))
    }

    if (options.gap !== undefined) {
      this.gap = Math.max(0, Math.round(options.gap))
      this.invalidateFrom(0)
    }

    if (options.estimateSize !== undefined) {
      this.estimateSize = options.estimateSize
      this.invalidateFrom(0)
    }

    if (options.initialOffset !== undefined) {
      this.offset = Math.max(0, Math.round(options.initialOffset))
    }

    if (options.initialViewport !== undefined) {
      this.viewportSize = Math.max(0, Math.round(options.initialViewport))
    }
  }

  private pruneCaches(): void {
    for (const index of this.measuredSizes.keys()) {
      if (index >= this.count) {
        this.measuredSizes.delete(index)
      }
    }

    for (const [index, element] of this.mountedItems) {
      if (index >= this.count) {
        this.itemObserver?.unobserve(element)
        this.mountedItems.delete(index)
      }
    }

    this.starts.length = this.count
    this.ends.length = this.count
    this.sizes.length = this.count
  }

  private invalidateFrom(index: number): void {
    this.dirtyIndex = Math.min(this.dirtyIndex, Math.max(0, index))
  }

  /** 仅更新单项尺寸缓存并在发生变化时标记失效，不触发 recompute。 */
  private applyMeasurement(index: number, size: number): boolean {
    if (index < 0 || index >= this.count) {
      return false
    }

    const normalized = Math.max(0, Math.round(size))
    if (this.measuredSizes.get(index) === normalized) {
      return false
    }

    this.measuredSizes.set(index, normalized)
    this.invalidateFrom(index)
    return true
  }

  private ensureMeasurements(): void {
    if (this.count === 0) {
      this.starts = []
      this.ends = []
      this.sizes = []
      this.dirtyIndex = 0
      return
    }

    const startIndex = clamp(this.dirtyIndex, 0, this.count)
    if (startIndex >= this.count) {
      return
    }

    for (let index = startIndex; index < this.count; index++) {
      const size = this.measuredSizes.get(index) ?? this.estimateSize(index)
      const start = index === 0 ? this.paddingStart : this.ends[index - 1]! + this.gap
      const end = start + size

      this.starts[index] = start
      this.ends[index] = end
      this.sizes[index] = size
    }

    this.dirtyIndex = this.count
  }

  private recompute(): void {
    this.ensureMeasurements()

    const totalSize = this.getTotalSize()
    const range = this.calculateRange()
    const items =
      range === null
        ? []
        : this.createItems(
            Math.max(0, range.startIndex - this.overscan),
            Math.min(this.count - 1, range.endIndex + this.overscan)
          )

    this.offset = this.clampOffset(this.offset)

    const next: VirtualSnapshot = {
      items,
      range,
      totalSize,
      beforeSize: items[0]?.start ?? this.paddingStart,
      afterSize:
        items.length === 0 ? totalSize : Math.max(0, totalSize - items[items.length - 1]!.end),
      offset: this.offset,
      viewportSize: this.viewportSize,
      horizontal: this.horizontal,
      isScrolling: this.isScrolling
    }

    if (this.isEquivalentSnapshot(this.snapshot, next)) {
      return
    }

    this.snapshot = next
    this.notify()
  }

  /**
   * 仅比较对视觉产出有影响的关键字段以跳过冗余 notify；
   * 出于性能考虑只对 items 的首尾做抽样比对，中间项尺寸变化通过 totalSize / 末项 end 的变动捕获。
   */
  private isEquivalentSnapshot(prev: VirtualSnapshot, next: VirtualSnapshot): boolean {
    if (prev.items.length === 0 && prev.range === null) {
      return false
    }

    if (
      prev.totalSize !== next.totalSize ||
      prev.offset !== next.offset ||
      prev.viewportSize !== next.viewportSize ||
      prev.isScrolling !== next.isScrolling ||
      prev.horizontal !== next.horizontal ||
      prev.beforeSize !== next.beforeSize ||
      prev.afterSize !== next.afterSize ||
      prev.items.length !== next.items.length
    ) {
      return false
    }

    const prevRange = prev.range
    const nextRange = next.range
    if (prevRange === null || nextRange === null) {
      if (prevRange !== nextRange) {
        return false
      }
    } else if (
      prevRange.startIndex !== nextRange.startIndex ||
      prevRange.endIndex !== nextRange.endIndex
    ) {
      return false
    }

    if (prev.items.length === 0) {
      return true
    }

    const prevFirst = prev.items[0]!
    const nextFirst = next.items[0]!
    if (
      prevFirst.index !== nextFirst.index ||
      prevFirst.start !== nextFirst.start ||
      prevFirst.size !== nextFirst.size
    ) {
      return false
    }

    const prevLast = prev.items[prev.items.length - 1]!
    const nextLast = next.items[next.items.length - 1]!
    if (
      prevLast.index !== nextLast.index ||
      prevLast.start !== nextLast.start ||
      prevLast.size !== nextLast.size
    ) {
      return false
    }

    return true
  }

  /**
   * 基于当前缓存计算总尺寸；用于 recompute 与 clampOffset，外部请通过 getSnapshot().totalSize 访问。
   */
  private getTotalSize(): number {
    this.ensureMeasurements()
    if (!this.count) {
      return this.paddingStart + this.paddingEnd
    }

    return this.ends[this.count - 1]! + this.paddingEnd
  }

  private calculateRange(): VirtualRange | null {
    if (!this.count || this.viewportSize <= 0) {
      return null
    }

    const startIndex = this.findStartIndex(this.offset)
    const viewportEnd = this.offset + this.viewportSize
    let endIndex = startIndex

    while (endIndex < this.count - 1 && this.starts[endIndex + 1]! < viewportEnd) {
      endIndex++
    }

    return { startIndex, endIndex }
  }

  private createItems(startIndex: number, endIndex: number): VirtualItem[] {
    const items: VirtualItem[] = []

    for (let index = startIndex; index <= endIndex; index++) {
      items.push({
        index,
        start: this.starts[index]!,
        end: this.ends[index]!,
        size: this.sizes[index]!
      })
    }

    return items
  }

  private findStartIndex(offset: number): number {
    let low = 0
    let high = this.count - 1
    let result = 0

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const end = this.ends[mid]!

      if (end > offset) {
        result = mid
        high = mid - 1
      } else {
        low = mid + 1
      }
    }

    return result
  }

  private clampOffset(offset: number): number {
    const maxOffset = Math.max(0, this.getTotalSize() - this.viewportSize)
    return clamp(Math.round(offset), 0, maxOffset)
  }

  /** 容器尺寸变化时同步 viewport，不重新绑定项观察器。 */
  private observeContainer(element: HTMLElement): void {
    if (typeof ResizeObserver === 'undefined') {
      return
    }

    this.containerObserver = new ResizeObserver(() => {
      this.syncFromElement()
    })

    this.containerObserver.observe(element)
  }

  /**
   * 懒创建项观察器。回调内对一整批 entries 先批量 applyMeasurement，
   * 只有当存在实际尺寸变化时才触发一次 recompute，避免 N 项 resize 引发 N 次布局重算。
   */
  private ensureItemObserver(): ResizeObserver | null {
    if (this.itemObserver || typeof ResizeObserver === 'undefined') {
      return this.itemObserver
    }

    this.itemObserver = new ResizeObserver((entries) => {
      let changed = false

      for (const entry of entries) {
        const index = this.elementIndexes.get(entry.target)
        if (index === undefined) {
          continue
        }

        const box = entry.borderBoxSize?.[0]
        const size = box
          ? Math.round(this.horizontal ? box.inlineSize : box.blockSize)
          : getMeasuredSize(entry.target, this.horizontal)

        if (this.applyMeasurement(index, size)) {
          changed = true
        }
      }

      if (changed) {
        this.recompute()
      }
    })

    return this.itemObserver
  }

  private syncFromElement(): void {
    if (!this.scrollElement) {
      return
    }

    this.viewportSize = this.horizontal
      ? this.scrollElement.clientWidth
      : this.scrollElement.clientHeight
    this.offset = this.horizontal ? this.scrollElement.scrollLeft : this.scrollElement.scrollTop
    this.offset = this.clampOffset(this.offset)
    this.recompute()
  }

  /** 滚动事件：同步 offset 并标记滚动中；不支持 scrollend 时用 setTimeout 兜底判定结束。 */
  private handleScroll = (): void => {
    if (!this.scrollElement) {
      return
    }

    this.isScrolling = true
    this.offset = this.clampOffset(
      this.horizontal ? this.scrollElement.scrollLeft : this.scrollElement.scrollTop
    )
    this.recompute()

    if (this.scrollEndListenerAttached) {
      return
    }

    this.stopScrollTracking()
    this.scrollEndTimer = setTimeout(() => {
      this.scrollEndTimer = null
      this.markScrollEnd()
    }, DEFAULT_SCROLL_END_DELAY)
  }

  private handleScrollEnd = (): void => {
    this.markScrollEnd()
  }

  /** 统一的滚动结束收束：仅在仍处于 isScrolling 时关闭并触发一次重算。 */
  private markScrollEnd(): void {
    if (!this.isScrolling) {
      return
    }

    this.isScrolling = false
    this.recompute()
  }

  private stopScrollTracking(): void {
    if (this.scrollEndTimer !== null) {
      clearTimeout(this.scrollEndTimer)
      this.scrollEndTimer = null
    }
  }

  private notify(): void {
    for (const subscriber of this.subscribers) {
      subscriber(this.snapshot)
    }
  }
}
