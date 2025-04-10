export class BaseAlgorithm {
  /**
   * 将输入数据分组处理
   * @param data 输入数据
   * @param blockSize 块大小
   * @param callback 处理回调
   * @returns 处理后的数据
   */
  protected processBlocks<T>(
    data: Uint8Array,
    blockSize: number,
    callback: (block: Uint8Array, index: number) => T
  ): T[] {
    const blocks: T[] = []
    const totalBlocks = Math.ceil(data.length / blockSize)

    for (let i = 0; i < totalBlocks; i++) {
      const start = i * blockSize
      const end = Math.min(start + blockSize, data.length)
      const block = data.slice(start, end)
      blocks.push(callback(block, i))
    }

    return blocks
  }

  /**
   * 将字符串或Uint8Array转换为Uint8Array
   * @param data 输入数据
   * @returns Uint8Array
   */
  protected toUint8Array(data: string | Uint8Array): Uint8Array {
    if (typeof data === 'string') {
      return new TextEncoder().encode(data)
    }
    return data
  }

  /**
   * 将Uint8Array转换为十六进制字符串
   * @param data Uint8Array数据
   * @returns 十六进制字符串
   */
  protected toHex(data: Uint8Array): string {
    return Array.from(data)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * 将十六进制字符串转换为Uint8Array
   * @param hex 十六进制字符串
   * @returns Uint8Array
   */
  protected fromHex(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    }
    return bytes
  }
}
