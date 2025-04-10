import { Observable } from '@cat-kit/core'

export interface VirtualizerOptions {
  /** 元素数量 */
  count: number
  /** 元素预估大小 */
  estimateSize: (index: number) => number
  /** 元素间的间距 */
  gap?: number
  /**
   * 预加载数, 用于防止虚拟化时出现白屏现象
   */
  preload?: number
  /** 滚动方向 */
  direction?: 'vertical' | 'horizontal'
}

export class Virtualizer {
  private options: Required<VirtualizerOptions>
  private optionsProxy: Observable<
    Required<VirtualizerOptions>,
    keyof Required<VirtualizerOptions>
  >

  private scrollContainer?: HTMLElement
  private totalSize = 0
  private itemSizes: Array<number> = []
  private measureCache: Array<number> = []

  updateItemSize(index: number, size: number) {
    if (index > this.options.count) {
      throw new Error('index out of range')
    }
    const oldSize = this.itemSizes[index]!
    this.itemSizes[index] = size
    // 惰性计算totalSize
    this.totalSize += size - oldSize
  }

  constructor(options: VirtualizerOptions) {
    this.optionsProxy = new Observable({
      preload: 3,
      gap: 0,
      direction: 'vertical',
      ...options
    })
    this.options = this.optionsProxy.getState()

    this.init()
  }

  /** 状态重置 */
  private reset() {
    this.itemSizes = new Array(this.options.count)
  }

  /** 初始化 */
  private init() {
    const { optionsProxy, options } = this

    this.itemSizes = Array(options.count).fill(0)
    this.measureCache = Array(options.count)
    for (let i = 0; i < options.count; i++) {
      this.updateItemSize(i, options.estimateSize(i))
    }

    // 监听方向变化
    optionsProxy.observe(['direction'], ([direction]) => {
      this.reset()
    })

    optionsProxy.observe(['count'], ([preload]) => {
      this.reset()
    })
  }

  /**
   * 测量元素大小
   *
   * @param element 元素
   */
  measureElement(element: HTMLElement) {
    const { direction } = this.options
    const { measureCache } = this
    const index = Number(element.dataset.index!)

    // 已测量跳过
    if (measureCache[index] !== undefined) {
      return
    }
    const rect = element.getBoundingClientRect()
    measureCache[index] = direction === 'vertical' ? rect.height : rect.width
    this.updateItemSize(index, measureCache[index]!)
  }

  private updateCb?: (virtualizer: Virtualizer) => void

  on(event: 'update', callback: (virtualizer: Virtualizer) => void) {
    if (event === 'update') {
      this.updateCb = callback
    }
  }

  scrollHandler = (e: Event) => {
    const { scrollContainer } = this
    if (scrollContainer && this.updateCb) {
      this.updateCb(this)
    }
  }

  /**
   * 连接可滚动元素
   * @param container 可滚动元素
   */
  connect(container: HTMLElement) {
    this.disconnect()
    this.scrollContainer = container
    container.addEventListener('scroll', this.scrollHandler, {
      passive: true
    })
    // 初始化时触发一次更新
    this.updateCb?.(this)
  }

  /**
   * 获取总大小
   *
   */
  getTotalSize() {
    const { gap, count } = this.options
    // 总大小等于所有元素大小之和加上间距
    return this.totalSize + (count > 0 ? (count - 1) * gap : 0)
  }

  setOptions(options: VirtualizerOptions) {
    const newOptions = {
      ...this.options,
      ...options
    }
    Object.assign(this.optionsProxy.getState(), newOptions)
    this.options = this.optionsProxy.getState()
    this.init()
    this.updateCb?.(this)
  }

  disconnect() {
    this.scrollContainer?.removeEventListener('scroll', this.scrollHandler)
  }

  getItems() {
    const { preload, count, direction } = this.options
    const { itemSizes, scrollContainer } = this

    if (!scrollContainer) {
      return Array.from({ length: count }).map((_, i) => {
        return {
          size: itemSizes[i]!,
          index: i,
          offset: this.getItemOffset(i)
        }
      })
    }

    const viewportSize =
      direction === 'vertical'
        ? scrollContainer.clientHeight
        : scrollContainer.clientWidth

    const scrollOffset =
      direction === 'vertical'
        ? scrollContainer.scrollTop
        : scrollContainer.scrollLeft

    // 计算起始项和结束项
    let startIndex = this.findNearestItemIndex(scrollOffset)
    let endIndex = this.findNearestItemIndex(scrollOffset + viewportSize)

    // 应用预加载
    startIndex = Math.max(0, startIndex - preload)
    endIndex = Math.min(count - 1, endIndex + preload)

    return Array.from({ length: endIndex - startIndex + 1 }).map((_, i) => {
      const index = startIndex + i
      return {
        size: itemSizes[index]!,
        index,
        offset: this.getItemOffset(index)
      }
    })
  }

  /**
   * 获取指定索引元素的偏移量
   */
  private getItemOffset(index: number): number {
    const { gap } = this.options
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += this.itemSizes[i]! + gap
    }
    return offset
  }

  /**
   * 找到最接近指定偏移量的元素索引
   */
  private findNearestItemIndex(offset: number): number {
    const { gap, count } = this.options
    let currentOffset = 0

    for (let i = 0; i < count; i++) {
      const size = this.itemSizes[i]!
      // 如果偏移量在当前元素范围内，返回当前索引
      if (currentOffset <= offset && offset <= currentOffset + size) {
        return i
      }
      currentOffset += size + gap
    }

    // 如果偏移量超出全部元素，返回最后一个索引
    return count - 1
  }
}
