/**
 * 防抖
 * @param fn 要调用的目标函数
 * @param delay 延迟时间
 * @param immediate 是否立即调用一次
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

/**
 * 并发控制
 * @param list 并发列表
 * @param action 并发操作
 * @param max 最大并发数量
 */
export function concurrent<T, R>(
  list: T[],
  action: (item: T) => Promise<R>,
  max: number
) {
  return new Promise((rs, rj) => {
    // 判断最大并发数量的合法性
    if (max < 1 || !Number.isInteger(max)) {
      return rj('max参数应该是一个正整数')
    }

    // 无并发操作直接完成
    if (!list.length) {
      return rs(true)
    }

    let point = 0
    /** 并发池 */
    const pool = new Set<Promise<R>>()

    const tryFinish = () => {
      // 并发池空并且point已经走完则表示并发任务完成
      if (!pool.size && point > list.length - 1) {
        rs(true)
      }
    }

    /**
     * 添加任务
     */
    const push = () => {
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
          .then(() => {
            pool.delete(promise)
            push()
          })
          .catch(() => {
            pool.delete(promise)
            tryOnce(item)
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
        .then(() => {
          pool.delete(promise)
          tryFinish()
        })
        .catch(() => {
          pool.delete(promise)
          rj('错误')
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
