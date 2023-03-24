import { isObj, isArray } from './data-type'

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
 * @param arrList 任意多个数组
 */
export function union<T>(...arrList: T[][]): T[] {
  return Array.from(new Set<T>(arrList.flat()))
}

/**
 * 合并多个对象数组，并指定去重字段
 * @param key 按照这个字段进行去重
 * @param arrList 任意多个数组
 */
export function unionBy<T extends Record<string, any>>(
  key: string,
  ...arrList: T[][]
): T[] {
  let s = new Set<T>()

  const ret = arrList.flat().filter(item => {
    if (!isObj(item)) return true

    let v = item[key]

    if (s.has(v)) {
      return false
    } else {
      s.add(v)
      return true
    }
  })

  s.clear()

  return ret
}

/**
 * 数组从右到左的回调
 * @param arr 数组
 * @param cb 回调
 */
export function eachRight<T>(
  arr: T[],
  cb: (v: T, i: number, arr: T[]) => void
) {
  let len = arr.length

  while (--len > -1) {
    cb(arr[len]!, len, arr)
  }
}

/**
 * 丢弃数组中指定的索引的元素
 * @param arr 数组
 * @param indexes 索引或者索引列表
 */
export function omitArr<T>(arr: T[], indexes: number | number[]): T[] {
  if (Array.isArray(indexes)) {
    if (indexes.length > 10) {
      const s = new Set(indexes)
      return arr.filter((_, index) => !s.has(index))
    }

    return arr.filter((_, index) => !indexes.includes(index))
  }

  if (typeof indexes === 'number') {
    return [...arr.slice(0, indexes), ...arr.slice(indexes + 1)]
  }

  throw new Error('索引类型错误')
}

class Arr<T> {
  private _source: T[]
  constructor(arr: T[]) {
    this._source = arr
  }

  eachRight(cb: (v: T, i: number, arr: T[]) => void) {
    eachRight(this._source, cb)
  }

  omit(index: number | number[]) {
    return omitArr(this._source, index)
  }
}

export function arr<T>(arr: T[]) {
  return new Arr(arr)
}
