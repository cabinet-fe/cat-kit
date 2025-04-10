import { BaseAlgorithm } from './base'

/**
 * MD5哈希算法
 */
export class MD5 extends BaseAlgorithm {
  /**
   * 常量表
   */
  static k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
    0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
    0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
    0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
    0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
    0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ]

  /**
   * 每轮循环左移的位数
   */
  static s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
    9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
    16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
    15, 21
  ]

  /**
   * 计算数据的MD5哈希值
   * @param data 输入数据，可以是字符串、Uint8Array或File对象
   * @returns MD5哈希值（十六进制字符串）
   */
  async hash(data: string | Uint8Array | File): Promise<string> {
    if (data instanceof File) {
      return await this.hashFile(data)
    } else {
      const buffer = typeof data === 'string' ? this.toUint8Array(data) : data
      return this.md5(buffer)
    }
  }

  /**
   * 处理文件数据
   * @param file 文件对象
   * @returns MD5哈希值
   */
  private async hashFile(file: File): Promise<string> {
    // 对于大文件，使用分块处理
    if (file.size > 100 * 1024 * 1024) {
      // 如果文件大于100MB
      return await this.hashLargeFile(file)
    }

    // 对于小文件，一次性读取
    const buffer = await file.arrayBuffer()
    return this.md5(new Uint8Array(buffer))
  }

  /**
   * 处理大文件数据
   * @param file 文件对象
   * @returns MD5哈希值
   */
  private async hashLargeFile(file: File): Promise<string> {
    const CHUNK_SIZE = 10 * 1024 * 1024 // 10MB块大小

    // 初始哈希值
    let h0 = 0x67452301
    let h1 = 0xefcdab89
    let h2 = 0x98badcfe
    let h3 = 0x10325476

    // 已处理的数据总长度
    let totalLength = 0

    // 分块读取文件
    for (let start = 0; start < file.size; start += CHUNK_SIZE) {
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = await file.slice(start, end).arrayBuffer()
      const chunkData = new Uint8Array(chunk)

      // 更新总长度
      totalLength += chunkData.length

      // 处理当前块，但不进行填充
      const result = this.processChunk(chunkData, h0, h1, h2, h3)
      h0 = result.h0
      h1 = result.h1
      h2 = result.h2
      h3 = result.h3
    }

    // 进行最终填充和处理
    return this.finalizeMD5(h0, h1, h2, h3, totalLength)
  }

  /**
   * 处理数据块，不进行填充
   * @param data 数据块
   * @param h0 哈希值h0
   * @param h1 哈希值h1
   * @param h2 哈希值h2
   * @param h3 哈希值h3
   * @returns 更新后的哈希值
   */
  private processChunk(
    data: Uint8Array,
    h0: number,
    h1: number,
    h2: number,
    h3: number
  ): { h0: number; h1: number; h2: number; h3: number } {
    const { k, s } = MD5

    // 处理每个512位的块
    for (let i = 0; i < data.length; i += 64) {
      // 确保有足够的数据
      if (i + 64 > data.length) break

      // 将块分解为16个32位字（小端序）
      const words = new Uint32Array(16)
      const dataView = new DataView(
        data.buffer,
        data.byteOffset + i,
        Math.min(64, data.length - i)
      )

      for (let j = 0; j < 16; j++) {
        if (j * 4 + 3 < dataView.byteLength) {
          words[j] = dataView.getUint32(j * 4, true)
        }
      }

      // 初始化哈希值
      let a = h0
      let b = h1
      let c = h2
      let d = h3

      // 主循环
      for (let j = 0; j < 64; j++) {
        let f = 0
        let g = 0

        if (j < 16) {
          f = (b & c) | (~b & d)
          g = j
        } else if (j < 32) {
          f = (d & b) | (~d & c)
          g = (5 * j + 1) % 16
        } else if (j < 48) {
          f = b ^ c ^ d
          g = (3 * j + 5) % 16
        } else {
          f = c ^ (b | ~d)
          g = (7 * j) % 16
        }

        const temp = d
        d = c
        c = b
        b = b + this.leftRotate(a + f + k[j]! + words[g]!, s[j]!)
        a = temp
      }

      // 添加这个块的哈希到结果
      h0 = (h0 + a) >>> 0
      h1 = (h1 + b) >>> 0
      h2 = (h2 + c) >>> 0
      h3 = (h3 + d) >>> 0
    }

    return { h0, h1, h2, h3 }
  }

  /**
   * 完成MD5计算
   * @param h0 哈希值h0
   * @param h1 哈希值h1
   * @param h2 哈希值h2
   * @param h3 哈希值h3
   * @param totalLength 总数据长度
   * @returns MD5哈希值
   */
  private finalizeMD5(
    h0: number,
    h1: number,
    h2: number,
    h3: number,
    totalLength: number
  ): string {
    // 创建填充数据
    const bitLength = totalLength * 8
    const paddingLength =
      totalLength % 64 < 56 ? 56 - (totalLength % 64) : 120 - (totalLength % 64)

    const paddedData = new Uint8Array(paddingLength + 8)
    paddedData[0] = 0x80 // 添加1位，后面跟0

    // 附加长度（以位为单位，小端序）
    const dataView = new DataView(paddedData.buffer)
    dataView.setUint32(paddingLength, bitLength & 0xffffffff, true)
    dataView.setUint32(
      paddingLength + 4,
      Math.floor(bitLength / 0x100000000),
      true
    )

    // 处理最后一块
    const result = this.processChunk(paddedData, h0, h1, h2, h3)
    h0 = result.h0
    h1 = result.h1
    h2 = result.h2
    h3 = result.h3

    // 将结果转换为十六进制字符串（小端序）
    return this.toHex(
      new Uint8Array([
        h0 & 0xff,
        (h0 >> 8) & 0xff,
        (h0 >> 16) & 0xff,
        (h0 >> 24) & 0xff,
        h1 & 0xff,
        (h1 >> 8) & 0xff,
        (h1 >> 16) & 0xff,
        (h1 >> 24) & 0xff,
        h2 & 0xff,
        (h2 >> 8) & 0xff,
        (h2 >> 16) & 0xff,
        (h2 >> 24) & 0xff,
        h3 & 0xff,
        (h3 >> 8) & 0xff,
        (h3 >> 16) & 0xff,
        (h3 >> 24) & 0xff
      ])
    )
  }

  /**
   * MD5哈希算法实现
   * @param data 输入数据
   * @returns MD5哈希值
   */
  private md5(data: Uint8Array): string {
    // 初始哈希值
    let h0 = 0x67452301
    let h1 = 0xefcdab89
    let h2 = 0x98badcfe
    let h3 = 0x10325476

    // 预处理：附加填充位
    const bitLength = data.length * 8
    const paddingLength =
      data.length % 64 < 56 ? 56 - (data.length % 64) : 120 - (data.length % 64)

    const paddedData = new Uint8Array(data.length + paddingLength + 8)
    paddedData.set(data)
    paddedData[data.length] = 0x80 // 添加1位，后面跟0

    // 附加长度（以位为单位，小端序）
    const dataView = new DataView(paddedData.buffer)
    dataView.setUint32(
      data.length + paddingLength,
      bitLength & 0xffffffff,
      true
    )
    dataView.setUint32(
      data.length + paddingLength + 4,
      Math.floor(bitLength / 0x100000000),
      true
    )

    // 处理数据
    const result = this.processChunk(paddedData, h0, h1, h2, h3)
    h0 = result.h0
    h1 = result.h1
    h2 = result.h2
    h3 = result.h3

    // 将结果转换为十六进制字符串（小端序）
    return this.toHex(
      new Uint8Array([
        h0 & 0xff,
        (h0 >> 8) & 0xff,
        (h0 >> 16) & 0xff,
        (h0 >> 24) & 0xff,
        h1 & 0xff,
        (h1 >> 8) & 0xff,
        (h1 >> 16) & 0xff,
        (h1 >> 24) & 0xff,
        h2 & 0xff,
        (h2 >> 8) & 0xff,
        (h2 >> 16) & 0xff,
        (h2 >> 24) & 0xff,
        h3 & 0xff,
        (h3 >> 8) & 0xff,
        (h3 >> 16) & 0xff,
        (h3 >> 24) & 0xff
      ])
    )
  }

  /**
   * 循环左移
   * @param x 要移位的数
   * @param c 移位的位数
   * @returns 移位后的结果
   */
  private leftRotate(x: number, c: number): number {
    return ((x << c) | (x >>> (32 - c))) >>> 0
  }
}
