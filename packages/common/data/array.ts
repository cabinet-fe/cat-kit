import { isObj } from './data-type'

type Last<T> = T extends [...any, infer L]
  ? L
  : T extends (infer P)[]
  ? P
  : undefined

/**
 * 获取数组最后一位
 * @param arr 数组
 */
export function last<T extends any[]>(arr: [...T]): Last<T>
export function last<T extends any[]>(arr: readonly [...T]): Last<T>
export function last<T extends any[]>(arr: T): Last<T> {
  return arr[arr.length - 1]
}

/**
 * 合并多个数组并去重
 * @param arrs 任意多个数组
 */
export function union<T>(...arrs: T[][]): T[] {
  return [...new Set([...arrs].flat(2))] as T[]
}

/**
 * 合并多个对象数组，并指定去重字段
 * @param key 按照这个字段进行去重
 * @param arrs 任意多个数组
 */
export function unionBy<T>(key: string, ...arrs: T[]): T[] {
  const obj = {} as any
  return union(arrs).filter((item: Record<string, any>) => {
    if (!isObj(item)) return item
    if (!obj[item[key]]) {
      obj[item[key]] = true
      return item
    }
  })
}
