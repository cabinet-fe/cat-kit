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

export type ConcurrentOptions = {
  /** 并发模式, continue并发任务中有部分失败继续执行剩余任务, end并发任务中有1个失败立马结束所有并发, 默认end  */
  mode?: 'continue' | 'end'
  /** 最大并发数量, 默认为1 */
  max?: number
  /** 指定可重试的项 */
  retry?: (err: any) => boolean | void
}

/**
 * 并发控制
 * @param list 并发列表
 * @param action 单个并发的操作
 * @param max 最大并发数量
 */
export function concurrent<T, R>(
  list: T[],
  action: (item: T) => Promise<R>,
  max?: number
): Promise<R[]>
/**
 * 并发控制
 * @param list 并发列表
 * @param action 并发操作
 * @param options 并发选项
 */
export function concurrent<T, R>(
  list: T[],
  action: (item: T) => Promise<R>,
  options?: ConcurrentOptions
): Promise<R[]>
export function concurrent<T, R>(
  list: T[],
  action: (item: T) => Promise<R>,
  options?: number | ConcurrentOptions
) {
  return new Promise<R[]>((rs, rj) => {
    const result: R[] = []

    let max: number

    let retry: ConcurrentOptions['retry'] | undefined

    let mode: ConcurrentOptions['mode'] = 'end'

    let errors: any[] = []
    if (typeof options === 'number') {
      max = options
    } else if (options instanceof Object) {
      max = options.max ?? 1
      retry = options.retry
      if (options.mode) {
        mode = options.mode
      }
    } else if (!options) {
      max = 1
    } else {
      return rj('传入的参数错误')
    }

    // 判断最大并发数量的合法性
    if (max < 1 || !Number.isInteger(max)) {
      return rj('max参数应该是一个正整数')
    }

    // 无并发操作直接完成
    if (!list.length) {
      return rs(result)
    }

    let point = 0
    /** 并发池 */
    const pool = new Set<Promise<R>>()

    const tryFinish = () => {
      // 并发池空并且point已经走完则表示并发任务完成
      if (!pool.size && point > list.length - 1) {
        errors.length ? rj(errors) : rs(result)
      } else {
        errors.length && mode === 'end' && rj(errors)
      }
    }

    /**
     * 添加任务
     */
    const push = () => {
      if (errors.length && mode === 'end') return rj(errors)
      // list空退出
      if (point > list.length - 1) {
        return tryFinish()
      }

      let item: T = list[point]!
      point++

      const promise = action(item)

      if (promise instanceof Promise) {
        pool.add(promise)

        promise
          .then(ret => {
            result.push(ret)
            pool.delete(promise)
            push()
          })
          .catch(err => {
            pool.delete(promise)
            if (!retry) {
              return tryOnce(item)
            }
            if (retry(err) === true) {
              return tryOnce(item)
            }

            // 抛出错误
            errors.push(err)
          })
      } else {
        push()
      }
    }
    /**
     * 重试一次
     * @param item 项
     */
    const tryOnce = (item: T) => {
      const promise = action(item)
      pool.add(promise)
      promise
        .then(ret => {
          result.push(ret)
          pool.delete(promise)
          tryFinish()
        })
        .catch(err => {
          pool.delete(promise)
          errors.push(err)
        })
    }

    // 初始化
    let i = -1
    const len = Math.min(list.length, max)
    while (++i < len) {
      push()
    }
  })
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
