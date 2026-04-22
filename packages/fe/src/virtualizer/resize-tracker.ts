/**
 * ResizeTracker —— ResizeObserver 生命周期与批量派发托管。
 *
 * 职责最小化：
 * - 懒创建 / 复用 observer；disconnect 后仍可再次 observe。
 * - unobserve / disconnect 显式清理 WeakMap 记录，避免死元素回调误判。
 * - 批量回调已按 horizontal/vertical 取好 px 尺寸（优先 borderBoxSize，回退 getBoundingClientRect）。
 */

export interface ResizeEntry {
  target: Element
  size: number
}

export interface ResizeTrackerOptions {
  isHorizontal: () => boolean
  onChange: (entries: ResizeEntry[]) => void
}

export class ResizeTracker {
  private observer: ResizeObserver | null = null
  private indexes = new WeakMap<Element, number>()
  private observed = new Set<Element>()

  constructor(private readonly opts: ResizeTrackerOptions) {}

  getIndex(el: Element): number | undefined {
    return this.indexes.get(el)
  }

  observe(index: number, el: Element): void {
    this.indexes.set(el, index)
    if (this.observed.has(el)) return
    this.observed.add(el)
    this.ensureObserver()?.observe(el, { box: 'border-box' })
  }

  unobserve(el: Element): void {
    if (!this.observed.delete(el)) return
    this.indexes.delete(el)
    this.observer?.unobserve(el)
  }

  disconnect(): void {
    this.observed.clear()
    this.observer?.disconnect()
  }

  destroy(): void {
    this.disconnect()
    this.observer = null
  }

  private ensureObserver(): ResizeObserver | null {
    if (this.observer) return this.observer
    if (typeof ResizeObserver === 'undefined') return null

    this.observer = new ResizeObserver((entries) => {
      const horizontal = this.opts.isHorizontal()
      const batch: ResizeEntry[] = []

      for (const entry of entries) {
        if (!this.observed.has(entry.target)) continue
        const box = entry.borderBoxSize?.[0]
        const size = box
          ? Math.round(horizontal ? box.inlineSize : box.blockSize)
          : Math.round(
              horizontal
                ? entry.target.getBoundingClientRect().width
                : entry.target.getBoundingClientRect().height
            )
        batch.push({ target: entry.target, size })
      }

      if (batch.length) this.opts.onChange(batch)
    })

    return this.observer
  }
}
