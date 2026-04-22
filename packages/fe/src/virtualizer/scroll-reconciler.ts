/**
 * ScrollReconciler —— smooth 滚动的 rAF 校准循环（自包含状态机）。
 *
 * 不变式：浏览器原生 smooth 动画期间 offset 距离 target 单调递减、不跨过 target；
 * handleScroll 观察到距离反向扩大 > SCROLL_EPSILON 即判定用户抢占并终止。
 */
import type { VirtualAlign } from './index'

/** 「目标达到」与「抢占」共享的像素阈值。 */
export const SCROLL_EPSILON = 1
/** rAF 校准循环的硬性超时（ms），保证即使没有 scroll 事件也能退出。 */
export const SCROLL_RECONCILE_TIMEOUT = 5000

export interface ScrollReconcilerHost {
  getElement(): HTMLElement | null
  isHorizontal(): boolean
  /** index + align → 纯 offset，不写 DOM；reconcile 每帧用于重算 target。 */
  targetForIndex(index: number, align: VirtualAlign): number
  clampOffset(offset: number): number
}

export function readScrollOffset(el: HTMLElement, horizontal: boolean): number {
  return horizontal ? el.scrollLeft : el.scrollTop
}

export function writeScroll(
  el: HTMLElement,
  horizontal: boolean,
  target: number,
  behavior: ScrollBehavior
): void {
  el.scrollTo({ [horizontal ? 'left' : 'top']: target, behavior })
}

interface ScrollState {
  /** 若由 scrollToIndex 发起，保留 index 以便每帧重算 target；null 表示 scrollToOffset。 */
  index: number | null
  align: VirtualAlign
  startedAt: number
  /** 最近一次 clamp 后的目标 offset，target 漂移时更新。 */
  lastTargetOffset: number
  /** 最近一次 scroll 事件观察到的 DOM offset；undefined 表示 smooth 刚启动未收到事件。 */
  lastObservedOffset: number | undefined
  /** 连续「|DOM - target| < SCROLL_EPSILON」的帧数，达到 1 即退出。 */
  stableFrames: number
}

export class ScrollReconciler {
  private state: ScrollState | null = null
  private rafId: number | null = null
  /** start 时捕获的 window；cancel 不再依赖 host.getElement()，避免 unmount 顺序耦合。 */
  private window: (Window & typeof globalThis) | null = null

  constructor(private readonly host: ScrollReconcilerHost) {}

  get active(): boolean {
    return this.state !== null
  }

  /** 启动 smooth 校准。target 已 clamp；DOM 已对齐则跳过启动避免多排一帧 rAF。 */
  start(index: number | null, align: VirtualAlign, target: number): boolean {
    this.cancel()
    const el = this.host.getElement()
    if (!el) return false
    const horizontal = this.host.isHorizontal()
    if (readScrollOffset(el, horizontal) === target) return false

    this.window = el.ownerDocument?.defaultView ?? null
    this.state = {
      index,
      align,
      startedAt: performance.now(),
      lastTargetOffset: target,
      lastObservedOffset: undefined,
      stableFrames: 0
    }
    writeScroll(el, horizontal, target, 'smooth')
    this.schedule()
    return true
  }

  cancel(): void {
    if (this.rafId !== null) {
      this.window?.cancelAnimationFrame?.(this.rafId)
      this.rafId = null
    }
    this.state = null
    this.window = null
  }

  /** 由 Virtualizer.handleScroll 调用；首帧缺乏基准时只记录，不判抢占。 */
  observeScroll(offset: number): void {
    const state = this.state
    if (!state) return
    const prev = state.lastObservedOffset
    if (prev === undefined) {
      state.lastObservedOffset = offset
      return
    }
    const prevDist = Math.abs(prev - state.lastTargetOffset)
    const currDist = Math.abs(offset - state.lastTargetOffset)
    if (currDist > prevDist + SCROLL_EPSILON) this.cancel()
    else state.lastObservedOffset = offset
  }

  private schedule(): void {
    if (this.rafId !== null) return
    const win = this.window
    if (!win || typeof win.requestAnimationFrame !== 'function') return
    this.rafId = win.requestAnimationFrame(() => {
      this.rafId = null
      this.tick()
    })
  }

  private tick(): void {
    const state = this.state
    const el = this.host.getElement()
    if (!state || !el) return

    if (performance.now() - state.startedAt > SCROLL_RECONCILE_TIMEOUT) {
      this.state = null
      return
    }

    const horizontal = this.host.isHorizontal()
    const target =
      state.index !== null
        ? this.host.clampOffset(this.host.targetForIndex(state.index, state.align))
        : state.lastTargetOffset

    if (target !== state.lastTargetOffset) {
      // 目标漂移（测量更新导致）：同步 'auto' 跳到新位置，后续 scroll 事件会对齐 lastObservedOffset。
      state.lastTargetOffset = target
      state.stableFrames = 0
      writeScroll(el, horizontal, target, 'auto')
    } else if (Math.abs(readScrollOffset(el, horizontal) - target) < SCROLL_EPSILON) {
      state.stableFrames += 1
      if (state.stableFrames >= 1) {
        this.state = null
        return
      }
    }

    // 始终排下一帧，保证 5 秒安全阀在没有 scroll 事件时也能触发。
    this.schedule()
  }
}
