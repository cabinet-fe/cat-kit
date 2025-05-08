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

const Zero: AESPadding = {
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

const PKCS7: AESPadding = {
  pad(data: Uint8Array, blockSize: number): Uint8Array {
    if (data.length % blockSize === 0) {
      return data
    }

    const padLength = blockSize - (data.length % blockSize)
    const paddedData = new Uint8Array(data.length + padLength)
    paddedData.set(data)

    // 填充padLength
    for (let i = data.length; i < paddedData.length; i++) {
      paddedData[i] = padLength
    }

    return paddedData
  },

  unpad(data: Uint8Array): Uint8Array {
    if (data.length === 0) {
      return data
    }

    const padLength = data[data.length - 1]!
    return data.slice(0, data.length - padLength)
  }
}

const None: AESPadding = {
  pad(data: Uint8Array): Uint8Array {
    return data
  },

  unpad(data: Uint8Array): Uint8Array {
    return data
  }
}

export const AES_PADDING = {
  Zero,
  PKCS7,
  None
}
