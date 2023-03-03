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
 * @param max 最大并发数
 * @returns
 */
// export function concurrent<T, R>(
//   list: T[],
//   action: (item: T) => Promise<R>,
//   max: number
// ) {
//   return new Promise((rs, rj) => {
//     const s = new Set<Promise<R>>()

//     /** 指针 */
//     let point = 0

//     /** 添加任务 */
//     const addAction = (_item?: T) => {
//       // 超出最大并发数量或数组被执行完毕 且 没有传入项退出
//       if ((s.size >= max || point > list.length - 1) && !_item) return

//       let item: T
//       if (_item) {
//         item = _item
//       } else {
//         item = list[point]!
//         point++
//       }

//       const promise = action(item)

//       s.add(promise)

//       promise.then(() => {
//         s.delete(promise)
//         addAction()
//       }).catch(() => {
//         // 重新尝试
//         s.delete(promise)
//         addAction(item)
//       })
//     }

//     let i = -1
//     const len = Math.max(list.length, max)
//     while (--i < len) {
//       addAction()
//     }
//   })
// }
