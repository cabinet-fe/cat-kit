/**
 * AES加密算法实现
 */
import { BlockCipher } from '../block-cipher'
import type { BinaryInput, BinaryOutputFormat } from '../../base/binary'
import { AES_PADDING, type AESPadding } from './padding'
import { AES_MODE, type AESModeType } from './mode'

/**
 * AES加密选项
 */
export interface AESOptions {
  /**
   * 加密模式
   */
  mode: AESModeType

  /**
   * 填充模式
   */
  padding?: AESPadding
}

/**
 * AES加密类
 */
export class AES extends BlockCipher {
  readonly name = 'AES'
  readonly blockSize = 16 // 128位
  readonly keySize = 32 // 256位

  /**
   * 构造函数
   * @param options AES加密选项
   */
  constructor(options: AESOptions) {
    const { mode, padding } = options

    // 创建加密模式实例
    const cipherMode = new mode()

    // 如果没有提供填充模式，根据加密模式选择默认填充
    const paddingMode =
      padding ||
      (cipherMode.requiresPadding ? AES_PADDING.PKCS7 : AES_PADDING.None)

    super(cipherMode, paddingMode)
  }

  /**
   * 静态加密方法
   * @param data 明文数据
   * @param options 加密选项
   * @returns 加密后的数据
   */
  static async encrypt(
    data: BinaryInput,
    options: {
      key: BinaryInput
      iv?: BinaryInput
      mode: AESModeType
      padding: AESPadding
      output?: BinaryOutputFormat
    }
  ): Promise<string | Uint8Array> {
    const { mode = AES_MODE.GCM, padding, ...encryptOptions } = options
    const aes = new AES({ mode, padding })
    return aes.encrypt(data, encryptOptions)
  }

  /**
   * 静态解密方法
   * @param data 密文数据
   * @param options 解密选项
   * @returns 解密后的数据
   */
  static async decrypt(
    data: BinaryInput,
    options: {
      key: BinaryInput
      iv?: BinaryInput
      mode?: AESModeType
      padding?: AESPadding
      output?: BinaryOutputFormat
    }
  ): Promise<string | Uint8Array> {
    const { mode = AES_MODE.GCM, padding, ...decryptOptions } = options
    const aes = new AES({ mode, padding })
    return aes.decrypt(data, decryptOptions)
  }
}
