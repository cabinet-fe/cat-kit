/**
 * 安全运行
 * @param fn 待执行的函数
 */
export function safeRun<T>(fn: () => T): T | undefined
/**
 * 安全运行并提供默认返回值
 * @param fn 待执行的函数
 * @param defaultVal 指定的默认值
 */
export function safeRun<T>(fn: () => T, defaultVal: T): T
export function safeRun<T>(fn: () => T, defaultVal?: T): T | undefined {
  try {
    return fn()
  } catch {
    return defaultVal
  }
}
