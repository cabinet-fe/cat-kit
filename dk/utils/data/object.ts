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
