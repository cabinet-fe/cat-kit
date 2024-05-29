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
  return !val
}

/**
 * 获取链式值
 * @param o 目标对象
 * @param prop 链式属性
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
 * 设置链式值
 * @param o 目标对象
 * @param prop 链式属性
 * @param value 值
 */
export function setChainValue(
  o: Record<string, any>,
  prop: string,
  value: any
) {
  const props = prop.split('.')
  let cur = o
  let len = props.length - 1
  for (let i = 0; i < len; i++) {
    let p = props[i]
    if (!cur[p]) {
      cur[p] = {}
    }
    cur = cur[p]
  }
  cur[props[len]] = value
  return o
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
export function deepCopy<T extends any>(this: any, target: T): any {
  if (isArray(target)) {
    return target.map(deepCopy)
  }
  if (isObj(target)) {
    return objMap(target, deepCopy)
  }
  if (isFunction(target)) {
    return new Function('return ' + (target as Function).toString()).call(this)
  }
  if (isDate(target)) {
    return new Date((target as Date).valueOf()) as any
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

  return args.reduce(
    (acc, cur) => {
      mergeTwo(acc, cur)
      return acc
    },
    {} as Record<any, any>
  )
}

/**
 * 序列化一个对象至 'key=value&key1=value1' 的形式
 * @param obj 被序列化的对象
 */
export function serialize(obj: Record<string, any>): string {
  let ret = ''
  try {
    Object.keys(obj).forEach((key: string) => {
      // 如果值为undefined或者null则在字符串中的表现形式就是空串
      if ([undefined, null].includes(obj[key])) {
        ret += `${key}=&`
        return
      }
      ret += `${key}=${encodeURIComponent(JSON.stringify(obj[key]))}&`
    })
    return ret.slice(0, -1)
  } catch {
    console.warn(
      `期望传入一个object格式数据, 此处传入了一个${getDataType(obj)}格式的数据`
    )
    return ''
  }
}

/**
 * 反序列化一个 'key=value&key1=value1' 形式的字符串
 * 需要用 decodeURIComponent 解码
 * 需要过滤所有的非正常字段
 * @param str 被序列化的对象
 */
export function deserialize<T extends Record<string, any>>(str: string): T {
  return decodeURIComponent(str)
    .split('&')
    .reduce(
      (acc, cur) => {
        let [key, val] = cur.split('=')
        if (val) {
          try {
            acc[key!] = JSON.parse(val)
          } catch {
            acc[key!] = val
          }
        } else {
          acc[key!] = val
        }
        return acc
      },
      {} as Record<string, any>
    ) as T
}
