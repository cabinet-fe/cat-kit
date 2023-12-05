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