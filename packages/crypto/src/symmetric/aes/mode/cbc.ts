import { isInNode } from '@cat-kit/core'
import type { BlockCipherMode } from '../../block-cipher'
import type { AESPadding } from '../padding'

/**
 * AES-CBC模式实现
 */
export class CBC implements BlockCipherMode {
  readonly name = 'CBC'
  readonly requiresIV = true
  readonly requiresPadding = true

  /**
   * 加密数据
   * @param key 密钥
   * @param data 明文数据
   * @param iv 初始化向量
   * @returns 加密后的数据
   */
  async encrypt(
    key: Uint8Array,
    data: Uint8Array,
    pad: AESPadding['pad'],
    iv?: Uint8Array
  ): Promise<Uint8Array> {
    if (!iv) {
      throw new Error('CBC模式需要初始化向量')
    }

    // 填充数据
    const paddedData = pad(data, 16)

    // 使用Web Crypto API（浏览器HTTPS环境）
    if (
      typeof window !== 'undefined' &&
      window.isSecureContext &&
      window.crypto?.subtle
    ) {
      try {
        const cryptoKey = await window.crypto.subtle.importKey(
          'raw',
          key,
          { name: 'AES-CBC' },
          false,
          ['encrypt']
        )

        const encryptedBuffer = await window.crypto.subtle.encrypt(
          { name: 'AES-CBC', iv },
          cryptoKey,
          paddedData
        )

        return new Uint8Array(encryptedBuffer)
      } catch (error) {
        console.error('Web Crypto API加密失败:', error)
      }
    }

    // 使用Node.js Crypto模块
    if (isInNode()) {
      try {
        // 在Node环境中动态导入crypto模块
        const crypto = await import('crypto')

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
        const encrypted = Buffer.concat([
          cipher.update(paddedData),
          cipher.final()
        ])

        return new Uint8Array(encrypted)
      } catch (error) {
        console.error('Node.js Crypto加密失败:', error)
      }
    }

    // 如果以上方法都失败，抛出错误
    throw new Error('当前环境不支持AES-CBC加密')
  }

  /**
   * 解密数据
   * @param key 密钥
   * @param data 密文数据
   * @param iv 初始化向量
   * @returns 解密后的数据
   */
  async decrypt(
    key: Uint8Array,
    data: Uint8Array,
    unpad: AESPadding['unpad'],
    iv?: Uint8Array
  ): Promise<Uint8Array> {
    if (!iv) {
      throw new Error('CBC模式需要初始化向量')
    }

    // 使用Web Crypto API（浏览器HTTPS环境）
    if (
      typeof window !== 'undefined' &&
      window.isSecureContext &&
      window.crypto?.subtle
    ) {
      try {
        const cryptoKey = await window.crypto.subtle.importKey(
          'raw',
          key,
          { name: 'AES-CBC' },
          false,
          ['decrypt']
        )

        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: 'AES-CBC', iv },
          cryptoKey,
          data
        )

        const decryptedData = new Uint8Array(decryptedBuffer)
        return unpad(decryptedData)
      } catch (error) {
        console.error('Web Crypto API解密失败:', error)
      }
    }

    // 使用Node.js Crypto模块
    if (isInNode()) {
      try {
        // 在Node环境中动态导入crypto模块
        const crypto = await import('crypto')

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        const decrypted = Buffer.concat([
          decipher.update(data),
          decipher.final()
        ])

        return unpad(new Uint8Array(decrypted))
      } catch (error) {
        console.error('Node.js Crypto解密失败:', error)
      }
    }

    // 如果以上方法都失败，抛出错误
    throw new Error('当前环境不支持AES-CBC解密')
  }
}
