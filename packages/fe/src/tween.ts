export type TweenState = 'idle' | 'running' | 'paused' | 'finished' | 'cancelled'
export type TweenEasing = (progress: number) => number

export interface TweenScheduler {
  now(): number
  requestFrame(callback: FrameRequestCallback): number
  cancelFrame(handle: number): void
}

export interface TweenFrame {
  elapsed: number
  progress: number
  easedProgress: number
  value: number
  state: TweenState
}

export interface TweenOptions {
  from?: number
  to?: number
  duration?: number
  delay?: number
  easing?: TweenEasing
  autoplay?: boolean
  scheduler?: TweenScheduler
  onUpdate?: (frame: TweenFrame) => void
  onFinish?: (frame: TweenFrame) => void
  onCancel?: (frame: TweenFrame) => void
}

const defaultScheduler: TweenScheduler = {
  now: () => performance.now(),
  requestFrame: (callback) => {
    if (typeof requestAnimationFrame === 'function') {
      return requestAnimationFrame(callback)
    }

    return setTimeout(() => callback(performance.now()), 16) as unknown as number
  },
  cancelFrame: (handle) => {
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(handle)
      return
    }

    clearTimeout(handle)
  }
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1)
}

export const tweenEasings = {
  linear: (progress: number) => progress,
  easeInQuad: (progress: number) => progress * progress,
  easeOutQuad: (progress: number) => progress * (2 - progress),
  easeInOutQuad: (progress: number) =>
    progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress
} satisfies Record<string, TweenEasing>

export class Tween {
  private from = 0
  private to = 1
  private duration = 300
  private delay = 0
  private easing: TweenEasing = tweenEasings.linear
  private scheduler: TweenScheduler = defaultScheduler
  private onUpdate?: (frame: TweenFrame) => void
  private onFinish?: (frame: TweenFrame) => void
  private onCancel?: (frame: TweenFrame) => void

  private state: TweenState = 'idle'
  private startedAt = 0
  private pausedElapsed = 0
  private handle: number | null = null
  private progress = 0
  private value = 0

  constructor(options: TweenOptions = {}) {
    this.applyOptions(options)
    this.startedAt = this.scheduler.now()
    this.value = this.from

    if (options.autoplay) {
      this.play()
    }
  }

  getState(): TweenState {
    return this.state
  }

  getValue(): number {
    return this.value
  }

  getProgress(): number {
    return this.progress
  }

  setOptions(options: TweenOptions): this {
    this.applyOptions(options)
    this.emitUpdate()
    return this
  }

  play(): this {
    this.cancelFrame()
    this.state = 'running'
    this.startedAt = this.scheduler.now() - this.pausedElapsed
    this.schedule()
    return this
  }

  pause(): this {
    if (this.state !== 'running') {
      return this
    }

    this.pausedElapsed = this.currentElapsed(this.scheduler.now())
    this.state = 'paused'
    this.cancelFrame()
    this.emitUpdate()
    return this
  }

  resume(): this {
    if (this.state !== 'paused') {
      return this
    }

    this.state = 'running'
    this.startedAt = this.scheduler.now() - this.pausedElapsed
    this.schedule()
    return this
  }

  cancel(): this {
    if (this.state === 'cancelled' || this.state === 'finished') {
      return this
    }

    this.state = 'cancelled'
    this.cancelFrame()
    const frame = this.createFrame(this.scheduler.now())
    this.onCancel?.(frame)
    this.onUpdate?.(frame)
    return this
  }

  reset(): this {
    this.cancelFrame()
    this.progress = 0
    this.value = this.from
    this.pausedElapsed = 0
    this.startedAt = this.scheduler.now()
    this.state = 'idle'
    this.emitUpdate()
    return this
  }

  seek(progress: number): this {
    this.progress = clamp01(progress)
    const easedProgress = this.easing(this.progress)
    this.value = this.interpolate(easedProgress)
    this.startedAt = this.scheduler.now()
    this.emitUpdate()
    return this
  }

  private applyOptions(options: TweenOptions): void {
    if (options.from !== undefined) {
      this.from = options.from
    }

    if (options.to !== undefined) {
      this.to = options.to
    }

    if (options.duration !== undefined) {
      this.duration = Math.max(0, options.duration)
    }

    if (options.delay !== undefined) {
      this.delay = Math.max(0, options.delay)
    }

    if (options.easing !== undefined) {
      this.easing = options.easing
    }

    if (options.scheduler !== undefined) {
      this.scheduler = options.scheduler
    }

    if (options.onUpdate !== undefined) {
      this.onUpdate = options.onUpdate
    }

    if (options.onFinish !== undefined) {
      this.onFinish = options.onFinish
    }

    if (options.onCancel !== undefined) {
      this.onCancel = options.onCancel
    }
  }

  private schedule(): void {
    this.handle = this.scheduler.requestFrame(this.tick)
  }

  private tick = (time: number): void => {
    if (this.state !== 'running') {
      return
    }

    const elapsed = this.currentElapsed(time)
    if (elapsed < 0) {
      this.handle = this.scheduler.requestFrame(this.tick)
      return
    }

    if (this.duration === 0) {
      this.progress = 1
    } else {
      this.progress = clamp01(elapsed / this.duration)
    }

    const easedProgress = this.easing(this.progress)
    this.value = this.interpolate(easedProgress)
    this.onUpdate?.(this.createFrame(time, easedProgress, elapsed))

    if (this.progress >= 1) {
      this.state = 'finished'
      this.cancelFrame()
      this.onFinish?.(this.createFrame(time, easedProgress, elapsed))
      return
    }

    this.handle = this.scheduler.requestFrame(this.tick)
  }

  private currentElapsed(now: number): number {
    return now - this.startedAt - this.delay
  }

  private interpolate(progress: number): number {
    return this.from + (this.to - this.from) * progress
  }

  private createFrame(
    now: number,
    easedProgress = this.easing(this.progress),
    elapsed = this.currentElapsed(now)
  ): TweenFrame {
    return {
      elapsed: Math.max(0, elapsed),
      progress: this.progress,
      easedProgress,
      value: this.value,
      state: this.state
    }
  }

  private emitUpdate(): void {
    this.onUpdate?.(this.createFrame(this.scheduler.now()))
  }

  private cancelFrame(): void {
    if (this.handle === null) {
      return
    }

    this.scheduler.cancelFrame(this.handle)
    this.handle = null
  }
}
