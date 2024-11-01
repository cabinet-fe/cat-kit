import { isObj } from './data-type'

/**
 * 排除一个对象的某些键和值
 * @param target 目标对象
 * @param omitKeys 排除的对象的键的数组
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  target: T,
  omitKeys: K[]
): Omit<T, K> {
  let ret = {} as T
  let s = new Set(omitKeys)
  for (const key in target) {
    if (!s.has(key as unknown as K)) {
      ret[key] = target[key]
    }
  }
  omitKeys.forEach(key => {
    delete ret[key]
  })
  return ret
}

/**
 * 从目标对象获取某些属性的值
 * @param target 目标对象
 * @param pickKeys 选择的对象的键的数组
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  target: T,
  pickKeys: K[]
): Pick<T, K> {
  let ret = {} as T

  pickKeys.forEach(key => (ret[key] = target[key]))
  return ret
}

/**
 * 将对象的key设为数组
 * @param obj 对象
 * @returns
 */
export function objKeys<T extends Record<string, any>>(obj: T) {
  let keys: Array<keyof T> = []
  for (const key in obj) {
    keys.push(key)
  }
  return keys
}

/**
 * 对象映射
 * @param obj 目标对象
 * @param mapper 映射函数
 * @returns
 */
export function objMap<O extends Record<string, any>, K extends keyof O, R>(
  obj: O,
  mapper: (val: O[K], key: K) => R
) {
  const ret: any = {}

  Object.keys(obj).forEach(key => {
    ret[key] = mapper(obj[key as K], key as K)
  })
  return ret as Record<K, R>
}

/**
 * 对象继承
 * @param source 源对象
 * @param targets 被继承的目标对象
 */
export function extend<S extends Record<string, any>>(
  source: S,
  ...targets: Record<string, any>[]
) {
  for (const key in source) {
    let i = targets.length
    while (--i >= 0) {
      let v = targets[i]![key]
      if (v !== undefined && v !== null) {
        source[key] = v
        break
      }
    }
  }
  return source
}

/**
 * 深度继承, 返回初始对象
 * @param original 初始对象
 * @param sources 继承来源
 * @returns
 */
export function deepExtend<S extends Record<string, any>>(
  original: S,
  sources: Record<string, any>[] | Record<string, any>
) {
  if (Array.isArray(sources)) {
    sources.forEach(source => {
      deepExtend(original, source)
    })
  } else {
    for (const key in original) {
      const originalVal = original[key]
      const sourceVal = sources[key]

      // 如果源对象的值为null或undefined，则直接赋值
      if (originalVal === null || originalVal === undefined) {
        original[key] = sourceVal
        continue
      }

      const originalType = typeof originalVal
      const sourceType = typeof sourceVal

      if (
        sourceVal === null ||
        sourceVal === undefined ||
        originalType !== sourceType
      ) {
        continue
      }

      if (isObj(originalVal) && isObj(sourceVal)) {
        deepExtend(originalVal, sourceVal)
      } else {
        original[key] = sourceVal
      }
    }
  }

  return original
}

/**
 * 对象循环
 * @param obj 目标对象
 * @param fn 循环中调用的函数
 * @returns
 */
export function objEach<O extends Record<string, any>, K extends keyof O>(
  obj: O,
  fn: (val: O[K], key: K) => void
) {
  Object.keys(obj).forEach(key => {
    fn(obj[key as K], key as K)
  })
}

class Obj<O extends Record<string, any>, K extends keyof O = keyof O> {
  constructor(private _source: O) {}

  /**
   * 获取对象的key
   * @returns
   */
  keys() {
    return objKeys(this._source)
  }

  /**
   * 获取某些属性的值
   * @param pickKeys 选择的对象的键的数组
   * @returns
   */
  pick<KK extends K>(pickKeys: KK[]): Pick<O, KK> {
    return pick(this._source, pickKeys)
  }

  /**
   * 循环
   * @param fn 循环中调用的函数
   * @returns
   */
  each(fn: (val: O[K], key: K) => void) {
    objEach(this._source, fn)
    return this
  }

  /**
   * 排除一个对象的某些键和值
   * @param omitKeys 排除的对象的键的数组
   * @returns
   */
  omit<KK extends K>(omitKeys: KK[]): Omit<O, KK> {
    return omit(this._source, omitKeys)
  }

  /**
   * 对象映射
   * @param mapper 映射函数
   * @returns
   */
  map<R>(mapper: (val: O[K], key: K) => R) {
    return objMap(this._source, mapper)
  }

  /**
   * 对象继承
   * @param targets 被继承的目标对象
   * @returns
   */
  extend(...targets: Record<string, any>[]) {
    extend(this._source, ...targets)
    return this
  }
}

export function obj<O extends Record<string, any>>(o: O) {
  return new Obj(o)
}
