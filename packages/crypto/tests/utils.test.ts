import { describe, it, expect } from 'vitest'
import {
  toUint8Array,
  isSecureContext,
  isCryptoAvailable
} from '../src/base/utils'

describe('工具函数', () => {
  describe('toUint8Array', () => {
    it('应该转换字符串为 Uint8Array', () => {
      const result = toUint8Array('hello')
      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBeGreaterThan(0)
    })

    it('应该处理 Uint8Array 输入', () => {
      const input = new Uint8Array([1, 2, 3])
      const result = toUint8Array(input)
      expect(result).toBe(input)
    })

    it('应该处理 ArrayBuffer 输入', () => {
      const buffer = new Uint8Array([1, 2, 3]).buffer
      const result = toUint8Array(buffer)
      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBe(3)
    })

    it('应该处理空字符串', () => {
      const result = toUint8Array('')
      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBe(0)
    })

    it('应该处理中文字符', () => {
      const result = toUint8Array('你好')
      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBeGreaterThan(2) // UTF-8 编码会大于 2 字节
    })
  })

  describe('环境检测', () => {
    it('isSecureContext 应该返回布尔值', () => {
      const result = isSecureContext()
      expect(typeof result).toBe('boolean')
    })

    it('isCryptoAvailable 应该返回布尔值', () => {
      const result = isCryptoAvailable()
      expect(typeof result).toBe('boolean')
    })
  })
})
