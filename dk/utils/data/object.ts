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
 * 对象映射
 * @param obj 目标对象
 * @param mapper 映射函数
 * @returns
 */
export function objMap<O, K extends keyof O, R>(obj: O, mapper: (val: O[K], key: K) => R) {
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
      let v = targets[i][key]
      if (v !== undefined && v !== null) {
        source[key] = v
        break
      }
    }
  }
  return source
}

/**
 * 对象循环
 * @param obj 目标对象
 * @param fn 循环中调用的函数
 * @returns
 */
export function objEach<O, K extends keyof O>(obj: O, fn: (val: O[K], key: K) => void) {
  Object.keys(obj).forEach(key => {
    fn(obj[key as K], key as K)
  })
}

class Obj<O extends Record<string, any>, K extends keyof O> {
  constructor(private _source: O) {}

  /**
   * 获取某些属性的值
   * @param pickKeys 选择的对象的键的数组
   * @returns
   */
  pick(pickKeys: K[]): Pick<O, K> {
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
  omit(omitKeys: K[]): Omit<O, K> {
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
