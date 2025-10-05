import { str2u8a, isInBrowser } from '@cat-kit/core'
import type { DataInput } from './types'

/**
 * 将输入数据转换为 Uint8Array
 * @param data 输入数据
 * @returns Uint8Array
 */
export function toUint8Array(data: DataInput): Uint8Array {
  if (typeof data === 'string') {
    return str2u8a(data)
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data)
  }
  if (data instanceof Uint8Array) {
    return data
  }
  throw new Error('不支持的数据类型')
}

/**
 * 检测是否在安全上下文中（HTTPS 或 localhost）
 */
export function isSecureContext(): boolean {
  if (!isInBrowser()) return false
  return window.isSecureContext
}

/**
 * 检测 Web Crypto API 是否可用
 */
export function isCryptoAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    isSecureContext()
  )
}
