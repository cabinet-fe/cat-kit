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
): (this: any, ...args: T) => void {
  let timer: NodeJS.Timeout | number | undefined = undefined

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
  let start = 0
  let result: R
  return function (this: any, ...args: T): R {
    let current = Date.now()
    if (start === 0 || current - start >= delay) {
      start = current
      result = fn.call(this, ...args)
      cb?.(result)
    }
    return result
  }
}

/**
 * 睡眠一定时间
 * @param ms 毫秒数
 * @returns
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
