import { getDataType, isEmpty } from './type'

class CatObject<O extends Record<string, any>, K extends keyof O = keyof O> {
  readonly raw: O

  constructor(object: O) {
    this.raw = object
  }

  /**
   * 获取对象的所有键
   * @returns 对象的键组成的元组类型
   */
  keys(): string[] {
    return Object.keys(this.raw)
  }

  /**
   * 遍历对象
   * @param callback 回调，第一个参数是对象key，第二个参数是key对应的value
   * @returns 当前对象
   */
  each(callback: (key: string, value: any) => void): CatObject<O, K> {
    const { raw } = this
    for (const key in raw) {
      callback(key, raw[key])
    }
    return this
  }

  /**
   * 挑选对象的key，生成新的对象
   * @param keys 需要挑选的key
   * @returns 新的对象
   */
  pick<KK extends K>(keys: KK[]): Pick<O, KK> {
    const { raw } = this
    const result = {} as Pick<O, KK>
    keys.forEach(key => {
      result[key] = raw[key]
    })
    return result
  }

  /**
   * 忽略对象的key，生成新的对象
   * @param keys 需要忽略的key
   * @returns 新的对象
   */
  omit<KK extends K>(keys: KK[]): Omit<O, KK> {
    const { raw } = this
    const result = { ...raw }
    keys.forEach(key => delete result[key])
    return result
  }

  /**
   * 从其他对象中继承属性，只继承当前对象中存在的属性
   * @param source 继承的目标
   * @returns 当前对象
   */
  extend(source: Record<string, any>[] | Record<string, any>): O {
    const { raw } = this
    const rawKeys = Object.keys(raw)

    if (Array.isArray(source)) {
      source.forEach(s => this.extend(s))
      return raw
    }

    rawKeys.forEach(key => {
      if (!(key in source)) return
      const sourceVal = source[key]

      if (isEmpty(sourceVal)) return

      const rawVal = raw[key]
      if (isEmpty(rawVal)) {
        raw[key as K] = sourceVal
        return
      }
      const rawValType = typeof rawVal
      const sourceValType = typeof sourceVal
      if (rawValType !== sourceValType) return console.warn(`${key}类型不一致`)
      raw[key as K] = sourceVal
    })

    return this.raw
  }

  /**
   * 从其他对象中深度继承属性，只继承当前对象中存在的属性
   * @param source 继承的目标
   * @returns 当前对象
   */
  deepExtend(source: Record<string, any>[] | Record<string, any>): O {
    const { raw } = this
    if (Array.isArray(source)) {
      source.forEach(s => this.deepExtend(s))
      return raw
    }

    const rawKeys = Object.keys(raw)

    rawKeys.forEach(key => {
      if (!(key in source)) return

      const sourceVal = source[key]

      if (isEmpty(sourceVal)) return

      const originalVal = raw[key]

      // 如果是空，则直接赋值
      if (isEmpty(originalVal)) {
        raw[key as K] = sourceVal
        return
      }

      const originalValType = getDataType(originalVal)
      const sourceValType = getDataType(sourceVal)

      if (originalValType !== sourceValType)
        return console.warn(`${key}类型不一致`)

      if (originalValType === 'object' && sourceValType === 'object') {
        this.deepExtend(sourceVal)
        return
      }

      raw[key as K] = sourceVal
    })

    return raw
  }

  /**
   * 结构化拷贝
   * @description 注意，如果对象中存在函数，则函数不会被拷贝
   * @returns 新的对象
   */
  copy(): O {
    return JSON.parse(JSON.stringify(this.raw))
  }

  private static merge(
    target: Record<string, any>,
    source: Record<string, any>
  ) {
    Object.keys(source).forEach(key => {
      const sourceVal = source[key]

      // 如果源值为空，则跳过
      if (isEmpty(sourceVal)) return

      // 如果当前对象中不存在该属性，或者当前属性为空，直接赋值
      if (!(key in target) || isEmpty(target[key])) {
        target[key] = sourceVal
        return
      }

      const targetVal = target[key]
      const targetValType = getDataType(targetVal)
      const sourceValType = getDataType(sourceVal)

      // 如果类型不一致，直接覆盖
      if (targetValType !== sourceValType) {
        target[key] = sourceVal
        return
      }

      // 如果都是对象，递归合并
      if (targetValType === 'object' && sourceValType === 'object') {
        target[key] = CatObject.merge(targetVal, sourceVal)
        return
      }

      // 其他情况直接覆盖
      target[key] = sourceVal
    })
  }

  /**
   * 将其他对象合并到当前对象
   * @param source 需要合并的对象
   * @returns 当前对象
   */
  merge(source: Record<string, any>[] | Record<string, any>): O {
    const { raw } = this

    if (Array.isArray(source)) {
      source.forEach(s => CatObject.merge(raw, s))
    } else {
      CatObject.merge(raw, source)
    }

    return this.raw
  }

  /**
   * 获取对象的值
   *
   * @param prop 需要获取的属性, 可以是链式的属性
   *
   * @returns 值
   */
  get<T extends any = any>(prop: string): T {
    let ret = this.raw

    const propPath = prop.split('.')
    const lastProp = propPath.pop()!

    propPath.some(p => {
      ret = ret[p]
      const e = isEmpty(ret)
      e && console.warn(`${prop}访问中断`)
      return e
    })

    return ret[lastProp]
  }

  /**
   * 设置对象的值
   * @param prop 需要设置的属性
   * @param value 需要设置的值
   * @returns 当前对象
   */
  set(prop: string, value: any): Record<string, any> {
    const props = prop.split('.')
    let cur = this.raw as unknown as Record<string, any>
    let len = props.length - 1
    for (let i = 0; i < len; i++) {
      let p = props[i]!

      if (!cur[p]) {
        cur[p] = {}
      }
      cur = cur[p]
    }
    cur[props[len]!] = value
    return cur
  }
}

export function o<O extends Record<string, any>>(object: O): CatObject<O> {
  return new CatObject(object)
}
