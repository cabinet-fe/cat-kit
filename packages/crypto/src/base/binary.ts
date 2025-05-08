/**
 * 二进制操作工具
 * 提供二进制数据处理的基础功能
 */
import { str2u8a, hex2u8a, u8a2hex, u8a2base64 } from '@cat-kit/core'

/**
 * 二进制数据输出格式
 */
export type BinaryOutputFormat = 'hex' | 'base64' | 'buffer'

/**
 * 二进制数据输入类型
 */
export type BinaryInput = string | Uint8Array | ArrayBuffer

/**
 * 将输入数据转换为Uint8Array
 * @param data 输入数据
 * @returns Uint8Array格式的数据
 */
export function toBinaryData(data: BinaryInput): Uint8Array {
  if (typeof data === 'string') {
    // 检查是否为十六进制字符串
    if (/^[0-9a-fA-F]+$/.test(data)) {
      return hex2u8a(data)
    }
    // 否则当作普通字符串处理
    return str2u8a(data)
  } else if (data instanceof ArrayBuffer) {
    return new Uint8Array(data)
  } else if (data instanceof Uint8Array) {
    return data
  }
  throw new Error('不支持的二进制数据类型')
}

/**
 * 将Uint8Array转换为指定格式的输出
 * @param data Uint8Array数据
 * @param format 输出格式
 * @returns 转换后的数据
 */
export function fromBinaryData(
  data: Uint8Array,
  format: BinaryOutputFormat = 'buffer'
): string | Uint8Array {
  switch (format) {
    case 'hex':
      return u8a2hex(data)
    case 'base64':
      return u8a2base64(data)
    case 'buffer':
    default:
      return data
  }
}

/**
 * 连接多个二进制数据
 * @param arrays 要连接的二进制数据数组
 * @returns 连接后的Uint8Array
 */
export function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  // 计算总长度
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0)

  // 创建新数组
  const result = new Uint8Array(totalLength)

  // 复制数据
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }

  return result
}

/**
 * 将Uint8Array分割成指定大小的块
 * @param data 要分割的数据
 * @param blockSize 块大小
 * @returns 分割后的块数组
 */
export function splitIntoBlocks(
  data: Uint8Array,
  blockSize: number
): Uint8Array[] {
  const blocks: Uint8Array[] = []

  for (let i = 0; i < data.length; i += blockSize) {
    blocks.push(data.slice(i, i + blockSize))
  }

  return blocks
}

/**
 * PKCS#7填充
 * @param data 要填充的数据
 * @param blockSize 块大小
 * @returns 填充后的数据
 */
export function pkcs7Pad(data: Uint8Array, blockSize: number): Uint8Array {
  const padLength = blockSize - (data.length % blockSize)
  const paddedData = new Uint8Array(data.length + padLength)
  paddedData.set(data)

  // 填充padLength
  for (let i = data.length; i < paddedData.length; i++) {
    paddedData[i] = padLength
  }

  return paddedData
}

/**
 * 移除PKCS#7填充
 * @param data 带填充的数据
 * @returns 移除填充后的数据
 */
export function pkcs7Unpad(data: Uint8Array): Uint8Array {
  if (data.length === 0) {
    return data
  }

  const padLength = data[data.length - 1]!
  if (padLength === 0 || padLength > data.length) {
    throw new Error('无效的PKCS#7填充')
  }

  // 验证填充
  for (let i = data.length - padLength; i < data.length; i++) {
    if (data[i] !== padLength) {
      throw new Error('无效的PKCS#7填充')
    }
  }

  return data.slice(0, data.length - padLength)
}
