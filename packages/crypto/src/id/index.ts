/**
 * ID生成器
 */
import { isInBrowser, isInNode } from '@cat-kit/core'
import { u8a2hex } from '@cat-kit/core'

/**
 * 生成随机字节
 * @param length 字节长度
 * @returns 随机字节数组
 */
function getRandomBytes(length: number): Uint8Array {
  // 使用Web Crypto API（浏览器环境）
  if (
    isInBrowser() &&
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.getRandomValues === 'function'
  ) {
    return window.crypto.getRandomValues(new Uint8Array(length))
  }

  // 使用Node.js Crypto模块
  if (isInNode()) {
    try {
      // 在Node环境中动态导入crypto模块
      const crypto = require('crypto')
      return new Uint8Array(crypto.randomBytes(length))
    } catch (error) {
      console.error('Node.js Crypto生成随机字节失败:', error)
    }
  }

  // 如果以上方法都失败，使用Math.random（不推荐用于加密目的）
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256)
  }

  return bytes
}

/**
 * ID生成器类
 */
export class IDGenerator {
  /**
   * 生成UUID v4
   * @returns UUID字符串
   */
  static uuid(): string {
    // 生成16字节的随机数
    const bytes = getRandomBytes(16)

    // 设置版本（版本4）
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    // 设置变体（RFC4122）
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    // 转换为UUID格式
    const hex = u8a2hex(bytes)
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32)
    ].join('-')
  }

  /**
   * 生成指定长度的随机ID
   * @param length ID长度（字节）
   * @returns 十六进制字符串
   */
  static random(length: number = 16): string {
    const bytes = getRandomBytes(length)
    return u8a2hex(bytes)
  }

  /**
   * 生成时间戳ID
   * 结合时间戳和随机数，保证唯一性
   * @param randomLength 随机部分的长度（字节）
   * @returns 时间戳ID
   */
  static timeId(randomLength: number = 8): string {
    // 获取当前时间戳（毫秒）
    const timestamp = Date.now().toString(16).padStart(12, '0')

    // 生成随机部分
    const randomPart = u8a2hex(getRandomBytes(randomLength))

    return `${timestamp}-${randomPart}`
  }

  /**
   * 生成短ID
   * 适用于URL友好的短标识符
   * @param length ID长度（字符数）
   * @returns 短ID
   */
  static shortId(length: number = 10): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const bytes = getRandomBytes(length)

    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(bytes[i] % chars.length)
    }

    return result
  }
}
