import { u8a2str } from '@cat-kit/core'
import { CipherResult } from '../../base/types'
import { isCryptoAvailable } from '../../base/utils'
import { AES_MODE, AES_PADDING, type AESOptions } from './types'
import { webCryptoEncrypt, webCryptoDecrypt } from './web-crypto'
import { pureEncrypt, pureDecrypt } from './pure'

/**
 * AES 加密类
 * 自动根据环境选择最优实现：
 * 1. HTTPS 浏览器环境 - 使用 Web Crypto API
 * 2. HTTP 浏览器环境 - 使用纯 JavaScript 实现
 * 3. Node.js 环境 - 使用 Web Crypto API (Node.js 15+)
 */
export class AES {
  /**
   * 加密数据
   * @param data 要加密的数据（字符串或 Uint8Array）
   * @param options 加密选项
   * @returns 加密结果
   *
   * @example
   * const key = 'abcdabcdabcdabcd' // 16字节 = 128位
   * const iv = random(16)
   * const options = {
   *   key,
   *   iv,
   *   mode: AES_MODE.CBC,
   *   padding: AES_PADDING.PKCS7
   * }
   * const cipherText = AES.encrypt('hello world', options)
   * const hex = cipherText.toHex()
   */
  static async encrypt(
    data: string | Uint8Array,
    options: AESOptions
  ): Promise<CipherResult> {
    // 检查密钥长度
    const keyLength =
      typeof options.key === 'string' ? options.key.length : options.key.length
    if (![16, 24, 32].includes(keyLength)) {
      throw new Error(
        '密钥长度必须是 16、24 或 32 字节（对应 128、192、256 位）'
      )
    }

    // 检查 IV 长度
    if (options.mode === AES_MODE.CBC && options.iv.length !== 16) {
      throw new Error('CBC 模式的 IV 长度必须是 16 字节')
    }
    if (options.mode === AES_MODE.GCM && options.iv.length !== 12) {
      console.warn('GCM 模式推荐使用 12 字节的 IV')
    }

    // 根据环境选择实现
    if (isCryptoAvailable()) {
      return await webCryptoEncrypt(data, options)
    }

    // 降级到纯 JavaScript 实现（仅支持 CBC）
    if (options.mode === AES_MODE.GCM) {
      throw new Error(
        '在非 HTTPS 环境下，GCM 模式不可用，请使用 CBC 模式或在 HTTPS 环境下运行'
      )
    }

    return pureEncrypt(data, options)
  }

  /**
   * 解密数据
   * @param data 要解密的数据（Uint8Array）
   * @param options 解密选项
   * @returns 解密后的数据
   *
   * @example
   * const decrypted = AES.decrypt(cipherText, options)
   * const text = u8a2str(decrypted)
   */
  static async decrypt(
    data: Uint8Array | CipherResult,
    options: AESOptions
  ): Promise<Uint8Array> {
    const dataBytes = data instanceof CipherResult ? data.data : data

    // 根据环境选择实现
    if (isCryptoAvailable()) {
      return await webCryptoDecrypt(dataBytes, options)
    }

    // 降级到纯 JavaScript 实现（仅支持 CBC）
    if (options.mode === AES_MODE.GCM) {
      throw new Error(
        '在非 HTTPS 环境下，GCM 模式不可用，请使用 CBC 模式或在 HTTPS 环境下运行'
      )
    }

    return pureDecrypt(dataBytes, options)
  }

  /**
   * 加密并返回字符串
   * @param data 要加密的数据
   * @param options 加密选项
   * @returns 解密后的字符串
   */
  static async decryptToString(
    data: Uint8Array | CipherResult,
    options: AESOptions
  ): Promise<string> {
    const decrypted = await AES.decrypt(data, options)
    return u8a2str(decrypted)
  }
}

export { AES_MODE, AES_PADDING, type AESOptions }
