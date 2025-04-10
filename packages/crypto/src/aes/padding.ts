/**
 * AES填充接口
 */
export interface AESPadding {
  /**
   * 对数据进行填充
   * @param data 原始数据
   * @param blockSize 块大小
   * @returns 填充后的数据
   */
  pad(data: Uint8Array, blockSize: number): Uint8Array

  /**
   * 移除数据的填充
   * @param data 带填充的数据
   * @returns 移除填充后的数据
   */
  unpad(data: Uint8Array): Uint8Array
}

export type AESPaddingType = 'PKCS7' | 'ZERO' | 'NONE'

/**
 * PKCS#7填充实现
 * 填充值为填充的字节数
 */
export const PKCS7Padding: AESPadding = {
  pad(data: Uint8Array, blockSize: number): Uint8Array {
    const padLength = blockSize - (data.length % blockSize)
    const paddedData = new Uint8Array(data.length + padLength)
    paddedData.set(data)

    // 填充值为填充的字节数
    for (let i = data.length; i < paddedData.length; i++) {
      paddedData[i] = padLength
    }

    return paddedData
  },

  unpad(data: Uint8Array): Uint8Array {
    if (data.length === 0) {
      return data
    }

    // 获取填充长度（最后一个字节的值）
    const lastByte = data[data.length - 1]

    // 验证填充
    if (lastByte <= 0 || lastByte > data.length) {
      throw new Error('无效的PKCS#7填充: 填充长度无效')
    }

    // 验证所有填充字节是否一致
    for (let i = data.length - lastByte; i < data.length; i++) {
      if (data[i] !== lastByte) {
        throw new Error('无效的PKCS#7填充: 填充字节不一致')
      }
    }

    // 移除填充
    return data.slice(0, data.length - lastByte)
  }
}

/**
 * 零填充实现
 * 使用0字节进行填充
 */
export const ZeroPadding: AESPadding = {
  pad(data: Uint8Array, blockSize: number): Uint8Array {
    if (data.length % blockSize === 0) {
      return data
    }

    const padLength = blockSize - (data.length % blockSize)
    const paddedData = new Uint8Array(data.length + padLength)
    paddedData.set(data)

    // 填充0
    for (let i = data.length; i < paddedData.length; i++) {
      paddedData[i] = 0
    }

    return paddedData
  },

  unpad(data: Uint8Array): Uint8Array {
    if (data.length === 0) {
      return data
    }

    let i = data.length - 1
    while (i >= 0 && data[i] === 0) {
      i--
    }

    return data.slice(0, i + 1)
  }
}

/**
 * 不进行填充
 */
export const NoPadding: AESPadding = {
  pad(data: Uint8Array, blockSize: number): Uint8Array {
    if (data.length % blockSize !== 0) {
      throw new Error(
        `数据长度(${data.length})不是块大小(${blockSize})的整数倍`
      )
    }
    return data
  },

  unpad(data: Uint8Array): Uint8Array {
    return data
  }
}
