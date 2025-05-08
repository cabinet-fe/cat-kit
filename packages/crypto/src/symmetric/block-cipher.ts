/**
 * 分组密码基础类
 * 提供分组密码算法的基础功能和接口
 */
import { isInBrowser, isInNode } from '@cat-kit/core'
import {
  type BinaryInput,
  type BinaryOutputFormat,
  fromBinaryData,
  toBinaryData
} from '../base/binary'
import type { AESPadding } from './aes'

/**
 * 分组密码模式接口
 */
export interface BlockCipherMode {
  /**
   * 模式名称
   */
  readonly name: string

  /**
   * 是否需要初始化向量
   */
  readonly requiresIV: boolean

  /**
   * 是否需要填充
   */
  readonly requiresPadding: boolean

  /**
   * 加密数据
   * @param key 密钥
   * @param data 明文数据
   * @param iv 初始化向量（如果需要）
   * @returns 加密后的数据
   */
  encrypt(
    key: Uint8Array,
    data: Uint8Array,
    pad: AESPadding['pad'],
    iv?: Uint8Array
  ): Promise<Uint8Array>

  /**
   * 解密数据
   * @param key 密钥
   * @param data 密文数据
   * @param iv 初始化向量（如果需要）
   * @returns 解密后的数据
   */
  decrypt(
    key: Uint8Array,
    data: Uint8Array,
    unpad: AESPadding['unpad'],
    iv?: Uint8Array
  ): Promise<Uint8Array>
}

/**
 * 分组密码基础类
 */
export abstract class BlockCipher {
  /**
   * 算法名称
   */
  abstract readonly name: string

  /**
   * 块大小（字节）
   */
  abstract readonly blockSize: number

  /**
   * 密钥大小（字节）
   */
  abstract readonly keySize: number

  /**
   * 加密模式
   */
  protected mode: BlockCipherMode

  /**
   * 填充模式
   */
  protected padding: AESPadding

  /**
   * 构造函数
   * @param mode 加密模式
   * @param padding 填充模式
   */
  constructor(mode: BlockCipherMode, padding: AESPadding) {
    this.mode = mode
    this.padding = padding
  }

  /**
   * 加密数据
   * @param data 明文数据
   * @param options 加密选项
   * @returns 加密后的数据
   */
  async encrypt(
    data: BinaryInput,
    options: {
      key: BinaryInput
      iv?: BinaryInput
      output?: BinaryOutputFormat
    }
  ): Promise<string | Uint8Array> {
    const { key, iv, output = 'buffer' } = options

    // 转换输入数据
    const binaryData = toBinaryData(data)
    const binaryKey = toBinaryData(key)
    const binaryIV = iv ? toBinaryData(iv) : undefined

    // 验证密钥长度
    if (binaryKey.length !== this.keySize) {
      throw new Error(`密钥长度必须为 ${this.keySize} 字节`)
    }

    // 验证IV
    if (this.mode.requiresIV && !binaryIV) {
      throw new Error(`${this.mode.name} 模式需要初始化向量 (IV)`)
    }

    if (binaryIV && binaryIV.length !== this.blockSize) {
      throw new Error(`初始化向量长度必须为 ${this.blockSize} 字节`)
    }

    // 执行加密
    const encryptedData = await this.mode.encrypt(
      binaryKey,
      binaryData,
      this.padding.pad,
      binaryIV
    )

    // 转换输出格式
    return fromBinaryData(encryptedData, output)
  }

  /**
   * 解密数据
   * @param data 密文数据
   * @param options 解密选项
   * @returns 解密后的数据
   */
  async decrypt(
    data: BinaryInput,
    options: {
      key: BinaryInput
      iv?: BinaryInput
      output?: BinaryOutputFormat
    }
  ): Promise<string | Uint8Array> {
    const { key, iv, output = 'buffer' } = options

    // 转换输入数据
    const binaryData = toBinaryData(data)
    const binaryKey = toBinaryData(key)
    const binaryIV = iv ? toBinaryData(iv) : undefined

    // 验证密钥长度
    if (binaryKey.length !== this.keySize) {
      throw new Error(`密钥长度必须为 ${this.keySize} 字节`)
    }

    // 验证IV
    if (this.mode.requiresIV && !binaryIV) {
      throw new Error(`${this.mode.name} 模式需要初始化向量 (IV)`)
    }

    if (binaryIV && binaryIV.length !== this.blockSize) {
      throw new Error(`初始化向量长度必须为 ${this.blockSize} 字节`)
    }

    // 执行解密
    const decryptedData = await this.mode.decrypt(
      binaryKey,
      binaryData,
      this.padding.unpad,
      binaryIV
    )

    // 转换输出格式
    return fromBinaryData(decryptedData, output)
  }

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
