export interface AnimeConfig<State> {
  /** 动画持续时间, 单位毫秒 */
  duration?: number
  /** 缓动函数 */
  easingFunction?: (progress: number) => number
  /** 动画完成后的回调 */
  onComplete?(state: State): void
}

export interface TweenConfig<State> {
  /** 动画持续时间, 单位毫秒 */
  duration?: number
  /** 每一帧状态更新时的回调 */
  onUpdate?(state: State): void
  /** 动画完成后的回调 */
  onComplete?(state: State): void
  /** 缓动函数 */
  easingFunction?: (progress: number) => number
}

export class Tween<
  State extends Record<string, number> = Record<string, number>
> {
  readonly state: State

  protected duration = 300

  protected onUpdate?: (state: State) => void
  protected onComplete?: (state: State) => void

  protected frameId?: number

  protected easingFunction!: (progress: number) => number

  // private elapsed = 0

  constructor(state: State, config?: TweenConfig<State>) {
    this.state = state
    const { duration, onUpdate, onComplete, easingFunction } = config || {}

    if (duration !== undefined) {
      this.duration = duration
    }
    if (onUpdate !== undefined) {
      this.onUpdate = onUpdate
    }
    if (onComplete !== undefined) {
      this.onComplete = onComplete
    }
    this.easingFunction = easingFunction || Tween.easing.linear
  }

  /** 请求动画帧 */
  protected raf(options: {
    onComplete: () => void
    duration: number
    tick: (p: number) => void
  }) {
    const start = performance.now()
    const { onComplete, tick, duration } = options

    const update = (timestamp: number) => {
      // 经历的时间
      const elapsed = timestamp - start

      // 进度 = 时间 / 动画持续时间 且小于1
      const progress = Math.min(elapsed / duration, 1)
      tick(progress)
      if (progress < 1) {
        this.frameId = requestAnimationFrame(update)
      } else {
        tick(progress)
        this.stop()
        onComplete()
      }
    }

    this.frameId = requestAnimationFrame(update)
  }

  /**
   * 使用动画将组件状态转换为新状态。
   * @param state 新的状态
   * @param config 动画配置, 优先级高于Tween中的配置
   */
  to(state: State, config?: AnimeConfig<State>): void {
    this.stop()

    // 此前状态
    const prevState = { ...this.state }

    // 目标距离
    const stateDistance = Object.keys(state).reduce(
      (acc, key) => {
        if (
          (state[key] || state[key] === 0) &&
          (prevState[key] || prevState[key] === 0)
        ) {
          acc[key] = state[key]! - prevState[key]!
        }

        return acc
      },
      {} as Record<string, number>
    )

    const duration = config?.duration || this.duration
    const easingFunction = config?.easingFunction || this.easingFunction
    const onComplete = config?.onComplete || this.onComplete

    this.raf({
      duration,
      onComplete: () => {
        for (const key in state) {
          if (key in this.state) {
            this.state[key] = state[key]
          }
        }
        onComplete?.(this.state)
      },
      tick: progress => {
        for (const key in stateDistance) {
          const target =
            prevState[key]! +
            Math.round(easingFunction(progress) * stateDistance[key]!)
          // @ts-ignore
          this.state[key] = target
        }

        this.onUpdate?.(this.state)
      }
    })
  }

  /** 停止动画 */
  private stop(): boolean {
    if (!this.frameId) return false
    cancelAnimationFrame(this.frameId)
    this.frameId = undefined
    return true
  }

  /** 暂停动画 */
  // pause() {
  //   this.stop()
  // }

  /** 继续 */
  // resume() {}

  static readonly easing = {
    /** 匀速缓动 */
    linear: (p: number) => p,
    /** 先慢后快 */
    easeInQuad: (p: number) => p * p,
    /** 先快后慢 */
    easeOutQuad: (p: number) => p * (2 - p),
    /** 先慢后快再慢 */
    easeInOutQuad: (p: number) => (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p),
    /** 先回弹再运动 */
    easeInBack: (p: number) => p * p * ((2.70158 + 1) * p - 1),
    /** 先运动再回弹 */
    easeOutBack: (p: number) => {
      return 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2)
    },
    /** 先回弹再运动再回弹 */
    easeInOutBack: (p: number) => {
      const c1 = 1.70158
      const c2 = c1 * 1.525

      return p < 0.5
        ? (Math.pow(2 * p, 2) * ((c2 + 1) * 2 * p - c2)) / 2
        : (Math.pow(2 * p - 2, 2) * ((c2 + 1) * (p * 2 - 2) + c2) + 2) / 2
    }
  }
}
