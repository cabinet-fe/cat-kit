import { BaseAlgorithm } from './base'
import { AES_CBC, AES_GCM } from './aes/modes'
import type { AESMode } from './aes/modes'
import { PKCS7Padding, ZeroPadding, NoPadding } from './aes/padding'
import type { AESPadding, AESPaddingType } from './aes/padding'

export { AES_CBC, AES_GCM, PKCS7Padding, ZeroPadding, NoPadding }

/**
 * AES加密选项
 */
export interface AESOptions {
  /**
   * 加密模式
   */
  mode: AESMode

  /**
   * 填充方式
   */
  padding?: AESPaddingType
}

/**
 * 加解密参数
 */
export interface CryptoParams {
  /**
   * 密钥
   */
  key: string | Uint8Array

  /**
   * 初始化向量
   */
  iv?: string | Uint8Array

  /**
   * 输出格式
   */
  output?: 'hex' | 'buffer'
}

/**
 * AES加密算法
 */
export class AES extends BaseAlgorithm {
  private mode: AESMode

  /**
   * 创建AES加密实例
   * @param options AES选项
   */
  constructor(options: AESOptions) {
    super()
    this.mode = options.mode
  }

  /**
   * 加密数据
   * @param data 明文数据
   * @param params 加密参数
   * @returns 加密后的数据
   */
  async encrypt(
    data: string | Uint8Array,
    params: CryptoParams
  ): Promise<string | Uint8Array> {
    // 转换输入数据
    const inputData = this.toUint8Array(data)
    const key = this.toUint8Array(params.key)
    const iv = params.iv ? this.toUint8Array(params.iv) : undefined

    // 加密数据
    const encrypted = await this.mode.encrypt(inputData, key, iv)

    // 根据输出格式返回
    return params.output === 'hex' ? this.toHex(encrypted) : encrypted
  }

  /**
   * 解密数据
   * @param data 密文数据
   * @param params 解密参数
   * @returns 解密后的数据
   */
  async decrypt(
    data: string | Uint8Array,
    params: CryptoParams
  ): Promise<Uint8Array> {
    // 转换输入数据
    const inputData = typeof data === 'string' ? this.fromHex(data) : data
    const key = this.toUint8Array(params.key)
    const iv = params.iv ? this.toUint8Array(params.iv) : undefined

    // 解密数据
    return await this.mode.decrypt(inputData, key, iv)
  }
}
