import { AES_PADDING } from './types'

/**
 * 添加填充
 * @param data 原始数据
 * @param blockSize 块大小（字节）
 * @param padding 填充方式
 * @returns 填充后的数据
 */
export function addPadding(
  data: Uint8Array,
  blockSize: number,
  padding: AES_PADDING
): Uint8Array {
  if (padding === AES_PADDING.None) {
    if (data.length % blockSize !== 0) {
      throw new Error('数据长度必须是块大小的倍数（使用 None 填充时）')
    }
    return data
  }

  const paddingLength = blockSize - (data.length % blockSize)
  const padded = new Uint8Array(data.length + paddingLength)
  padded.set(data)

  if (padding === AES_PADDING.PKCS7) {
    // PKCS7: 填充值等于填充长度
    for (let i = data.length; i < padded.length; i++) {
      padded[i] = paddingLength
    }
  } else if (padding === AES_PADDING.Zero) {
    // Zero: 填充 0（默认已经是 0，无需操作）
  }

  return padded
}

/**
 * 移除填充
 * @param data 填充后的数据
 * @param padding 填充方式
 * @returns 移除填充后的原始数据
 */
export function removePadding(
  data: Uint8Array,
  padding: AES_PADDING
): Uint8Array {
  if (padding === AES_PADDING.None) {
    return data
  }

  if (padding === AES_PADDING.PKCS7) {
    const paddingLength = data[data.length - 1]!

    // 验证 PKCS7 填充
    if (paddingLength < 1 || paddingLength > 16) {
      throw new Error('无效的 PKCS7 填充')
    }

    for (let i = 0; i < paddingLength; i++) {
      if (data[data.length - 1 - i] !== paddingLength) {
        throw new Error('无效的 PKCS7 填充')
      }
    }

    return data.subarray(0, data.length - paddingLength)
  }

  if (padding === AES_PADDING.Zero) {
    // 移除尾部的零
    let length = data.length
    while (length > 0 && data[length - 1] === 0) {
      length--
    }
    return data.subarray(0, length)
  }

  return data
}
