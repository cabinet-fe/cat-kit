import { getDataType } from '../data/data-type'

const te = new TextEncoder()
const td = new TextDecoder()

function encodeU8A(u8a: Uint8Array) {
  const s = Array.prototype.slice
    .call(u8a)
    .map(code => String.fromCharCode(code))
    .join('')
  return btoa(s)
}

function encodeString(s: string) {
  return encodeU8A(te.encode(s))
}

/**
 * base64编码
 * @param data 字符串或者数字类型数据
 */
function encode(data: string | number): string
/**
 * base64编码
 * @param data 文件类型数据
 */
function encode(data: Blob): Promise<string>
function encode(data: string | number | Blob): string | Promise<string> {
  let type = getDataType(data)

  if (type === 'string') {
    return encodeString(data as string)
  }
  if (type === 'number') {
    return encodeString(String(data))
  }
  if (data instanceof Blob) {
    return data.arrayBuffer().then(buf => {
      return encodeU8A(new Uint8Array(buf))
    })
  }
  throw new Error('data类型错误')
}

/**
 * 解码
 * @param str base64字符串
 */
function decode(str: string) {
  const u8a = new Uint8Array(
    atob(str)
      .split('')
      .map(s => s.charCodeAt(0))
  )

  return td.decode(u8a)
}

export const base64 = {
  /**
   * base64编码
   * @param data 输入数据
   */
  encode,

  /**
   * base64解码
   * @param data 待解码base64字符串
   */
  decode
}
