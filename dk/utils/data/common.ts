import { getDataType, isArray, isDate, isFunction, isObj } from './data-type'
import { objMap } from './object'

/**
 * 返回一个值的空状态
 * @param val 任意值
 */
export function isEmpty(val: any) {
  const type = getDataType(val)

  switch (type) {
    case 'array':
      return val.length === 0
    case 'object':
      for (const _ in val) {
        return false
      }
      return true
  }
  return !!val
}

/**
 * 获取链式值
 * @param o 目标对象
 * @param prop 属性
 * @param targetProp 目标属性
 */
export function getChainValue(o: any, prop: string, targetProp?: string) {
  let ret = o
  if (targetProp) {
    ret = o[targetProp]
  }

  prop &&
    prop.split('.').some(p => {
      if (p === '$last' && Array.isArray(ret)) {
        ret = ret[ret.length - 1]
      } else {
        ret = ret[p]
      }

      if (!ret) {
        return true
      }
    })
  return ret
}

/**
 * 是否为给定值中的一种
 * @param value 一个值
 * @param values 所有可能的值
 */
export function oneOf<K extends string | number>(value: K, values: K[]) {
  return values.includes(value)
}

/**
 * 得到一个值的深拷贝版本
 * @param target 值
 */
export function deepCopy<T extends any>(this: any, target: T): T {
  if (isArray(target)) {
    return (target as any).map(deepCopy)
  }
  if (isObj(target)) {
    return objMap(target, deepCopy)
  }
  if (isFunction(target)) {
    return new Function('return ' + target.toString()).call(this)
  }
  if (isDate(target)) {
    return new Date(target.valueOf()) as any
  }
  return target
}

/**
 * 判断两个值是否结构相等
 * @param v1 值1
 * @param v2 值2
 */
export function equal(v1: any, v2: any, byKey?: number | string) {
  if (v1 === v2) return true
  if (byKey !== undefined) {
    return v1[byKey] === v2[byKey]
  }
  return JSON.stringify(v1) === JSON.stringify(v2)
}

/**
 * 合并对象并返回一个新的对象
 * @param args 参数列表
 */
export function merge(...args: Record<any, any>[]) {
  if (args.length < 1) return undefined
  if (args.length === 1) return deepCopy(args[0])

  function mergeTwo(o1: any, o2: any) {
    if (Array.isArray(o1)) {
      // 先生成o1的映射表
      return o1.concat(o2)
    }

    for (const key in o2) {
      let v1 = o1[key]
      let v2 = o2[key]
      if (!v1) {
        o1[key] = v2
      } else {
        let t1 = getDataType(v1)
        let t2 = getDataType(v2)
        if (t1 === t2) {
          // 简单类型
          if (oneOf(t1, ['string', 'number', 'null', 'boolean', 'undefined'])) {
            o1[key] = v2
          } else if (t1 === 'array' || t1 === 'object') {
            o1[key] = mergeTwo(v1, v2)
          }
        } else {
          o1[key] = v2
        }
      }
    }

    return o1
  }

  return args.reduce((acc, cur) => {
    mergeTwo(acc, cur)
    return acc
  }, {} as Record<any, any>)
}
