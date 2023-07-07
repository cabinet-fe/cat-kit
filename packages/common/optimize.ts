/**
 * 防抖
 * @param fn 要调用的目标函数
 * @param delay 延迟时间
 * @param immediate 是否立即调用一次, 默认true
 * @returns
 */
export function debounce<T extends any[]>(
  fn: (...args: T) => void,
  delay = 300,
  immediate = true
) {
  let timer: NodeJS.Timeout | undefined = undefined

  return function (this: any, ...args: T) {
    timer !== undefined && clearTimeout(timer)

    if (immediate) {
      // 空闲中
      let isFree = timer === undefined
      // 如果在开头已经调用则定时器中不再触发调用
      let hasCall = false
      if (isFree) {
        fn.call(this, ...args)
        hasCall = true
      }
      timer = setTimeout(() => {
        timer = undefined
        !hasCall && fn.call(this, ...args)
      }, delay)
    } else {
      timer = setTimeout(() => {
        fn.call(this, ...args)
      }, delay)
    }
  }
}

/**
 * 节流
 * @param fn 要调用的目标函数
 * @param delay 间隔时间
 * @param cb 结果回调
 * @returns
 */
export function throttle<T extends any[], R>(
  fn: (...args: T) => R,
  delay = 300,
  cb?: (v: R) => void
) {
  let start = Date.now()
  return function (this: any, ...args: T) {
    let current = Date.now()
    if (current - start >= delay) {
      start = current
      const result = fn.call(this, ...args)
      cb?.(result)
    }
  }
}

/** 并发状态 */
export type ConcurrenceStatus =
  | 'ready'
  | 'running'
  | 'success'
  | 'failed'
  | 'paused'

type SuccessCallback<Result> = (e: { result: Result[] }) => void
type CompleteCallback<Result> = (e: { result: Result[]; errors: any[] }) => void
type FailedCallback<Result> = (e: { result: Result[]; errors: any[] }) => void
type PauseCallback<Result> = (e: { result: Result[]; errors: any[] }) => void
type ContinueCallback<Result> = (e: { result: Result[]; errors: any[] }) => void

type EventsCallbacks<Result> = {
  success?: SuccessCallback<Result>
  complete?: CompleteCallback<Result>
  failed?: FailedCallback<Result>
  pause?: PauseCallback<Result>
  continue?: ContinueCallback<Result>
}

/** 并发事件 */
export type ConcurrenceEvent = keyof EventsCallbacks<any>

interface ConcurrenceConfig<T, R> {
  /** 并发模式, continue:并发任务中有部分失败继续执行剩余任务, end:并发任务中有1个失败立马结束所有并发, 默认end  */
  mode?: 'continue' | 'end'
  /** 最大并发数量, 最小且默认为1 */
  max?: number
  /** 一个队列, 它的每一项会被传入action中执行组成并发操作 */
  queue: T[]
  /** 队列中每一项执行的异步方法 */
  action: (item: T) => Promise<R>
}

/** 并发控制器 */
export class ConcurrenceController<Item = any, Result = any> {
  /** 并发模式 */
  private mode: 'continue' | 'end' = 'end'

  /** 最大并发数量 */
  private max = 1

  /** 并发池, 异步action执行时进入, 执行完毕或者错误时退出 */
  private pool = new Set<Promise<Result>>()

  /** 所有队列 */
  private queue: Item[] = []

  /** 失败项 */
  private failedItems: Item[] = []

  /** 错误 */
  private errors: any[] = []

  /** 状态 */
  protected status: ConcurrenceStatus = 'ready'

  /** 事件回调 */
  private eventsCallbacks: EventsCallbacks<Result> = {}

  /** 结果 */
  protected result: Result[] = []

  /** 并发操作 */
  private action!: (item: Item) => Promise<Result>

  constructor(conf: ConcurrenceConfig<Item, Result>) {
    const { mode, max, queue, action } = conf

    if (mode) {
      this.mode = mode
    }
    if (max) {
      if (max < 1 || !Number.isInteger(max)) {
        throw new Error('max参数应该是一个正整数')
      }
      this.max = max
    }
    this.queue = [...queue]
    this.action = action
  }

  private ready() {
    this.status = 'ready'
  }

  /**
   * 是否完成, 并发池为空且队列为空或者状态已经为失败视为完成
   */
  private get finished() {
    const { queue, pool, status } = this
    return !pool.size && (!queue.length || status === 'failed')
  }

  /** 是否可新增 */
  private get addable() {
    const { status, queue } = this
    return queue.length && status !== 'paused' && status !== 'failed'
  }

  private processingError(err: any, item: Item) {
    const { errors, eventsCallbacks, mode, result, failedItems, pool } = this
    errors.push(err)
    failedItems.push(item)
    if (mode === 'end') {
      // 先标记失败
      this.status = 'failed'

      // 并发池中还有任务则返回
      if (pool.size) return

      eventsCallbacks.failed?.({
        errors,
        result
      })
      eventsCallbacks.complete?.({
        errors,
        result
      })

      return
    }
    if (mode === 'continue') {
      this.add()
      return
    }
  }

  /** 完成此次并发 */
  private finish() {
    const { errors, result, eventsCallbacks } = this
    if (errors.length) {
      this.status = 'failed'
      eventsCallbacks.failed?.({
        result,
        errors
      })
    } else {
      this.status = 'success'
      eventsCallbacks.success?.({
        result
      })
    }

    eventsCallbacks.complete?.({
      result,
      errors
    })
  }

  /** 将操作加入并发池 */
  private add() {
    const { queue, action, pool, result, finished, addable } = this

    // 操作都完成则退出
    if (finished) {
      return this.finish()
    }

    if (!addable) return

    const item = queue.shift()!
    const p = action!(item)

    pool.add(p)

    p.then(ret => {
      pool.delete(p)
      result.push(ret)
      this.add()
    }).catch(err => {
      pool.delete(p)
      this.processingError(err, item)
    })
  }

  /**
   * 监听并发成功事件
   * @param event 成功事件
   * @param successCallback 成功后的回调
   */
  on(event: 'success', successCallback: SuccessCallback<Result>): void
  /**
   * 监听并发失败事件
   * @param event 失败事件
   * @param failedCallback 失败后的回调
   */
  on(event: 'failed', failedCallback: FailedCallback<Result>): void
  /**
   * 监听并发完成事件, 完成事件无论失败还是成功都会触发
   * @param event 完成事件
   * @param completeCallback 完成后的回调
   */
  on(event: 'complete', completeCallback: CompleteCallback<Result>): void
  /**
   * 监听并发暂停事件
   * @param event 暂停事件
   * @param pauseCallback 暂停后的回调
   */
  on(event: 'pause', pauseCallback: PauseCallback<Result>): void
  /**
   * 监听并发继续事件
   * @param event 继续事件
   * @param continueCallback 继续后的回调
   */
  on(event: 'continue', continueCallback: ContinueCallback<Result>): void
  on(event: ConcurrenceEvent, callback: (...args: any[]) => void): void {
    this.eventsCallbacks[event] = callback
  }

  /** 开始并发 */
  start() {
    if (this.status !== 'ready') {
      return console.warn(
        `执行ConcurrenceController.start失败, 因为当前并发状态为${this.status}, 只有ready状态才能执行该方法`
      )
    }
    this.status = 'running'
    const { max, queue } = this
    let i = -1
    const len = Math.min(queue.length, max)

    if (len) {
      while (++i < len) this.add()
    } else {
      this.finish()
    }
  }

  /** 暂停该并发中的任务 */
  pause() {
    this.status = 'paused'
    const { eventsCallbacks, errors, result } = this
    eventsCallbacks.pause?.({
      errors,
      result
    })
  }

  /** 继续一个被暂停的并发 */
  continue() {
    // 设置ready状态以便于可以继续执行剩下的任务
    this.ready()
    const { eventsCallbacks, errors, result } = this
    eventsCallbacks.continue?.({
      errors,
      result
    })
    this.start()
  }

  /** 重新尝试失败的任务 */
  retry() {
    if (!this.failedItems.length) {
      return console.log(
        `无法执行ConcurrenceController.retry方法, 因为没有失败的任务`
      )
    }

    // 剩余队列加上失败项
    this.queue = [...this.failedItems, ...this.queue]
    this.errors = []
    this.failedItems = []

    this.ready()
    this.start()
  }
}

/**
 * 安全运行
 * @param task 待执行的任务
 */
export function safeRun<T>(task: () => T): T | undefined
/**
 * 安全运行并提供默认返回值
 * @param task 待执行的任务
 * @param dft 指定的默认值
 */
export function safeRun<T>(task: () => T, dft: T): T
export function safeRun<T>(task: () => T, dft?: T): T | undefined {
  try {
    return task()
  } catch {
    return dft
  }
}
