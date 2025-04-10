/**
 * AES加密模式接口
 */
import { AESCore } from './core'
import type { AESPadding } from './padding'

export interface AESMode {
  /**
   * 加密数据
   * @param data 明文数据
   * @param key 密钥
   * @param iv 初始化向量（如果需要）
   * @returns 加密后的数据
   */
  encrypt(
    data: Uint8Array,
    key: Uint8Array,
    iv?: Uint8Array
  ): Promise<Uint8Array>

  /**
   * 解密数据
   * @param data 密文数据
   * @param key 密钥
   * @param iv 初始化向量（如果需要）
   * @returns 解密后的数据
   */
  decrypt(
    data: Uint8Array,
    key: Uint8Array,
    iv?: Uint8Array
  ): Promise<Uint8Array>
}



