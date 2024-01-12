import { HEX_CHARS } from './constants'

/** 获取安全随机数 */
export function getSecureRandomValues(): number {
  if (typeof crypto.getRandomValues === 'function') {
    return crypto.getRandomValues(new Uint32Array(1))[0]!
  }

  // nodejs中使用
  // @ts-ignore
  if (typeof crypto.randomBytes === 'function') {
    // @ts-ignore
    return crypto.randomBytes(4).readInt32LE()
  }
  throw new Error('不支持获取安全随机数')
}

/**
 * 克隆对象（属性复制，方法继承）
 * @param obj 需要被克隆的对象
 * @returns
 */
export function clone<O extends Object>(obj: O): O {
  const clonedObj = Object.create(obj.constructor.prototype)
  return Object.assign(clonedObj, obj)
}

/**
 * 混合两个对象的属性并返回对象1
 * @param Obj1 对象1
 * @param Obj2 对象2
 */
export function mixin<
  Obj1 extends Record<string, any>,
  Obj2 extends Record<string, any>
>(obj1: Obj1, obj2: Obj2): Obj1 & Obj2 {
  return Object.assign(obj1, obj2)
}

function r_hex(n: number): string {
  let s = ''
  for (let j = 0; j < 4; j += 1) {
    s +=
      HEX_CHARS[(n >> (j * 8 + 4)) & 0x0f] + HEX_CHARS[(n >> (j * 8)) & 0x0f]!
  }
  return s
}

/**
 * 将hash值转换为16进制字符串
 * @param hash hash值
 * @returns
 */
export function hex(hash: number[]): string {
  return hash.map(n => r_hex(n)).join('')
}

const te = new TextEncoder()
export function encodeUTF8ToU8A(input: string) {
  return te.encode(input)
}
