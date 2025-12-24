export interface ParallelOptions {
  /**
   * 并发上限
   *
   * - 不传：默认等于 tasks.length（尽可能并发）
   * - 必须为正整数
   */
  concurrency?: number
}

/**
 * 并发执行任务，并保持返回结果与任务顺序一致。
 *
 * 注意：该函数为异步函数，返回 Promise。
 *
 * @param tasks - 任务数组（每个任务可返回值或 Promise）
 * @param options - 并发控制
 * @returns 按任务顺序排列的结果数组
 */
export async function parallel<T>(
  tasks: ReadonlyArray<() => T | Promise<T>>,
  options?: ParallelOptions
): Promise<T[]> {
  if (tasks.length === 0) return []

  const concurrency = options?.concurrency ?? tasks.length
  if (!Number.isInteger(concurrency) || concurrency <= 0) {
    throw new Error('parallel: options.concurrency 必须为正整数')
  }

  const results = new Array<T>(tasks.length)
  let nextIndex = 0
  let finished = 0
  let rejected = false

  return await new Promise<T[]>((resolve, reject) => {
    const run = () => {
      if (rejected) return
      if (finished === tasks.length) {
        resolve(results)
        return
      }

      while (nextIndex < tasks.length && !rejected) {
        // 控制并发：当前启动的任务数 = nextIndex - finished
        if (nextIndex - finished >= concurrency) return

        const current = nextIndex
        nextIndex++

        Promise.resolve()
          .then(() => tasks[current]?.())
          .then(value => {
            results[current] = value as T
            finished++
            run()
          })
          .catch(err => {
            rejected = true
            reject(err)
          })
      }
    }

    run()
  })
}
