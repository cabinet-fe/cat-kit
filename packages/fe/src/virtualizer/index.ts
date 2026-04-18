export type EstimateSize = (index: number) => number
export type VirtualAlign = 'auto' | 'start' | 'center' | 'end'
export type VirtualizerSubscriber = (snapshot: VirtualSnapshot) => void

export interface VirtualizerOptions {
  count?: number
  overscan?: number
  horizontal?: boolean
  paddingStart?: number
  paddingEnd?: number
  initialOffset?: number
  initialViewport?: number
  estimateSize?: EstimateSize
  onChange?: VirtualizerSubscriber
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
  private estimateSize: EstimateSize = DEFAULT_ESTIMATE_SIZE
  private onChange?: VirtualizerSubscriber

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

  constructor(options: VirtualizerOptions = {}) {
    this.applyOptions(options)
    this.recompute()
  }

  setOptions(options: VirtualizerOptions): this {
    this.applyOptions(options)
    this.recompute()
    return this
  }

  setCount(count: number): this {
    this.count = Math.max(0, Math.trunc(count))
    this.pruneCaches()
    this.invalidateFrom(0)
    this.recompute()
    return this
  }

  setViewport(size: number): this {
    this.viewportSize = Math.max(0, Math.round(size))
    this.offset = this.clampOffset(this.offset)
    this.recompute()
    return this
  }

  setOffset(offset: number): this {
    this.offset = this.clampOffset(offset)
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
    this.scrollElement.addEventListener('scroll', this.handleScroll, { passive: true })
    this.observeContainer(element)
    this.syncFromElement()
    return this
  }

  unmount(): this {
    if (this.scrollElement) {
      this.scrollElement.removeEventListener('scroll', this.handleScroll)
    }

    this.scrollElement = null
    this.containerObserver?.disconnect()
    this.containerObserver = null
    this.stopScrollTracking()
    return this
  }

  destroy(): void {
    this.unmount()
    this.itemObserver?.disconnect()
    this.itemObserver = null
    this.mountedItems.clear()
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
    if (index < 0 || index >= this.count) {
      return this
    }

    const normalized = Math.max(0, Math.round(size))
    if (this.measuredSizes.get(index) === normalized) {
      return this
    }

    this.measuredSizes.set(index, normalized)
    this.invalidateFrom(index)
    this.recompute()
    return this
  }

  resizeItem(index: number, size: number): this {
    return this.measure(index, size)
  }

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

  getSnapshot(): VirtualSnapshot {
    return this.snapshot
  }

  getItems(): VirtualItem[] {
    return this.snapshot.items
  }

  getRange(): VirtualRange | null {
    return this.snapshot.range
  }

  getTotalSize(): number {
    this.ensureMeasurements()
    if (!this.count) {
      return this.paddingStart + this.paddingEnd
    }

    return this.ends[this.count - 1]! + this.paddingEnd
  }

  getItem(index: number): VirtualItem {
    this.ensureMeasurements()

    if (index < 0 || index >= this.count) {
      throw new RangeError(`Virtual item index out of range: ${index}`)
    }

    return {
      index,
      start: this.starts[index]!,
      end: this.ends[index]!,
      size: this.sizes[index]!
    }
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

    if (options.onChange !== undefined) {
      this.onChange = options.onChange
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
      const start = index === 0 ? this.paddingStart : this.ends[index - 1]!
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
    this.snapshot = {
      items,
      range,
      totalSize,
      beforeSize: items[0]?.start ?? this.paddingStart,
      afterSize: items.length === 0 ? totalSize : Math.max(0, totalSize - items[items.length - 1]!.end),
      offset: this.offset,
      viewportSize: this.viewportSize,
      horizontal: this.horizontal,
      isScrolling: this.isScrolling
    }

    this.notify()
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

  private observeContainer(element: HTMLElement): void {
    if (typeof ResizeObserver === 'undefined') {
      return
    }

    this.containerObserver = new ResizeObserver(() => {
      this.syncFromElement()
    })

    this.containerObserver.observe(element)
  }

  private ensureItemObserver(): ResizeObserver | null {
    if (this.itemObserver || typeof ResizeObserver === 'undefined') {
      return this.itemObserver
    }

    this.itemObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const index = this.elementIndexes.get(entry.target)
        if (index === undefined) {
          continue
        }

        const box = entry.borderBoxSize?.[0]
        const size = box
          ? Math.round(this.horizontal ? box.inlineSize : box.blockSize)
          : getMeasuredSize(entry.target, this.horizontal)

        this.measure(index, size)
      }
    })

    return this.itemObserver
  }

  private syncFromElement(): void {
    if (!this.scrollElement) {
      return
    }

    this.viewportSize = this.horizontal ? this.scrollElement.clientWidth : this.scrollElement.clientHeight
    this.offset = this.horizontal ? this.scrollElement.scrollLeft : this.scrollElement.scrollTop
    this.offset = this.clampOffset(this.offset)
    this.recompute()
  }

  private handleScroll = (): void => {
    if (!this.scrollElement) {
      return
    }

    this.isScrolling = true
    this.offset = this.clampOffset(
      this.horizontal ? this.scrollElement.scrollLeft : this.scrollElement.scrollTop
    )
    this.recompute()

    this.stopScrollTracking()
    this.scrollEndTimer = setTimeout(() => {
      this.isScrolling = false
      this.recompute()
    }, DEFAULT_SCROLL_END_DELAY)
  }

  private stopScrollTracking(): void {
    if (this.scrollEndTimer !== null) {
      clearTimeout(this.scrollEndTimer)
      this.scrollEndTimer = null
    }
  }

  private notify(): void {
    this.onChange?.(this.snapshot)
    for (const subscriber of this.subscribers) {
      subscriber(this.snapshot)
    }
  }
}
