/**
 * 哈希算法基础类
 * 提供哈希算法的基础功能和接口
 */
import { isInBrowser, isInNode } from '@cat-kit/core'
import {
  type BinaryInput,
  type BinaryOutputFormat,
  fromBinaryData,
  toBinaryData
} from '../base/binary'

/**
 * 哈希算法基础类
 */
export abstract class Hasher {
  /**
   * 算法名称
   */
  abstract readonly name: string

  /**
   * 哈希值大小（字节）
   */
  abstract readonly digestSize: number

  /**
   * 块大小（字节）
   */
  abstract readonly blockSize: number

  /**
   * 计算哈希值
   * @param data 输入数据
   * @param options 哈希选项
   * @returns 哈希值
   */
  async hash(
    data: BinaryInput | File | Blob,
    options: {
      output?: BinaryOutputFormat
      chunkSize?: number
    } = {}
  ): Promise<string | Uint8Array> {
    const { output = 'hex', chunkSize = 1024 * 1024 } = options

    let hashValue: Uint8Array

    if (data instanceof File || data instanceof Blob) {
      // 对文件或Blob进行分块哈希计算
      hashValue = await this.hashFile(data, chunkSize)
    } else {
      // 对普通数据进行哈希计算
      const binaryData = toBinaryData(data)
      hashValue = await this.hashData(binaryData)
    }

    // 转换输出格式
    return fromBinaryData(hashValue, output)
  }

  /**
   * 对数据进行哈希计算
   * @param data 输入数据
   * @returns 哈希值
   */
  protected abstract hashData(data: Uint8Array): Promise<Uint8Array>

  /**
   * 对文件进行分块哈希计算
   * @param file 输入文件
   * @param chunkSize 块大小
   * @returns 哈希值
   */
  protected async hashFile(
    file: File | Blob,
    chunkSize: number
  ): Promise<Uint8Array> {
    // 初始化哈希上下文
    const context = await this.createHashContext()

    // 分块读取文件
    let offset = 0
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize)
      const buffer = await chunk.arrayBuffer()
      const data = new Uint8Array(buffer)

      // 更新哈希上下文
      await this.updateHashContext(context, data)

      offset += chunkSize
    }

    // 完成哈希计算
    return this.finalizeHashContext(context)
  }

  /**
   * 创建哈希上下文
   * @returns 哈希上下文
   */
  protected abstract createHashContext(): Promise<any>

  /**
   * 更新哈希上下文
   * @param context 哈希上下文
   * @param data 输入数据
   */
  protected abstract updateHashContext(
    context: any,
    data: Uint8Array
  ): Promise<void>

  /**
   * 完成哈希计算
   * @param context 哈希上下文
   * @returns 哈希值
   */
  protected abstract finalizeHashContext(context: any): Promise<Uint8Array>

  /**
   * 检查是否可以使用Web Crypto API
   * @returns 是否可以使用Web Crypto API
   */
  protected canUseWebCrypto(): boolean {
    if (isInBrowser()) {
      // 检查是否在HTTPS环境下
      const isSecureContext = window.isSecureContext
      // 检查是否支持Web Crypto API
      const hasCrypto =
        typeof window.crypto !== 'undefined' &&
        typeof window.crypto.subtle !== 'undefined'

      return isSecureContext && hasCrypto
    }

    return false
  }

  /**
   * 检查是否可以使用Node.js Crypto模块
   * @returns 是否可以使用Node.js Crypto模块
   */
  protected canUseNodeCrypto(): boolean {
    return isInNode()
  }
}
