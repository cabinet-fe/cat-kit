/**
 * AES加密模式实现
 */
import { isInNode } from '@cat-kit/core'
import type { BlockCipherMode } from '../../block-cipher'
import type { AESPadding } from '../padding'

/**
 * AES-GCM模式实现
 */
export class GCM implements BlockCipherMode {
  readonly name = 'GCM'
  readonly requiresIV = true
  readonly requiresPadding = false

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
      throw new Error('GCM模式需要初始化向量')
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
          { name: 'AES-GCM' },
          false,
          ['encrypt']
        )

        const encryptedBuffer = await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv, tagLength: 128 },
          cryptoKey,
          data
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

        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
        const encrypted = Buffer.concat([
          cipher.update(data),
          cipher.final(),
          cipher.getAuthTag()
        ])

        return new Uint8Array(encrypted)
      } catch (error) {
        console.error('Node.js Crypto加密失败:', error)
      }
    }

    // 如果以上方法都失败，抛出错误
    throw new Error('当前环境不支持AES-GCM加密')
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
      throw new Error('GCM模式需要初始化向量')
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
          { name: 'AES-GCM' },
          false,
          ['decrypt']
        )

        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv, tagLength: 128 },
          cryptoKey,
          data
        )

        return new Uint8Array(decryptedBuffer)
      } catch (error) {
        console.error('Web Crypto API解密失败:', error)
      }
    }

    // 使用Node.js Crypto模块
    if (isInNode()) {
      try {
        // 在Node环境中动态导入crypto模块
        const crypto = await import('crypto')

        // 分离认证标签和密文
        const ciphertext = data.slice(0, -16)
        const authTag = data.slice(-16)

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
        decipher.setAuthTag(Buffer.from(authTag))

        const decrypted = Buffer.concat([
          decipher.update(ciphertext),
          decipher.final()
        ])

        return new Uint8Array(decrypted)
      } catch (error) {
        console.error('Node.js Crypto解密失败:', error)
      }
    }

    // 如果以上方法都失败，抛出错误
    throw new Error('当前环境不支持AES-GCM解密')
  }
}
