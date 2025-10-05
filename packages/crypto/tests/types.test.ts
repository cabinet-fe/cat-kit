import { describe, it, expect } from 'vitest'
import { HashResult, CipherResult } from '../src/base/types'

describe('类型定义', () => {
  describe('HashResult', () => {
    it('应该正确创建 HashResult 实例', () => {
      const data = new Uint8Array([1, 2, 3, 4])
      const result = new HashResult(data)

      expect(result).toBeInstanceOf(HashResult)
      expect(result.data).toBe(data)
    })

    it('应该转换为十六进制', () => {
      const data = new Uint8Array([15, 255, 0, 128])
      const result = new HashResult(data)
      const hex = result.hex()

      expect(typeof hex).toBe('string')
      expect(hex).toBe('0fff0080')
    })

    it('应该转换为 Base64', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
      const result = new HashResult(data)
      const base64 = result.base64()

      expect(typeof base64).toBe('string')
      expect(base64.length).toBeGreaterThan(0)
    })

    it('应该返回原始字节', () => {
      const data = new Uint8Array([1, 2, 3])
      const result = new HashResult(data)
      const bytes = result.bytes()

      expect(bytes).toBe(data)
      expect(bytes).toEqual(new Uint8Array([1, 2, 3]))
    })

    it('应该处理空数据', () => {
      const data = new Uint8Array([])
      const result = new HashResult(data)

      expect(result.hex()).toBe('')
      expect(result.bytes()).toEqual(new Uint8Array([]))
    })
  })

  describe('CipherResult', () => {
    it('应该正确创建 CipherResult 实例', () => {
      const data = new Uint8Array([1, 2, 3, 4])
      const result = new CipherResult(data)

      expect(result).toBeInstanceOf(CipherResult)
      expect(result.data).toBe(data)
    })

    it('应该转换为十六进制', () => {
      const data = new Uint8Array([255, 128, 64, 32])
      const result = new CipherResult(data)
      const hex = result.toHex()

      expect(typeof hex).toBe('string')
      expect(hex).toBe('ff804020')
    })

    it('应该转换为 Base64', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111])
      const result = new CipherResult(data)
      const base64 = result.toBase64()

      expect(typeof base64).toBe('string')
      expect(base64.length).toBeGreaterThan(0)
    })

    it('应该返回原始字节', () => {
      const data = new Uint8Array([10, 20, 30])
      const result = new CipherResult(data)
      const bytes = result.toBytes()

      expect(bytes).toBe(data)
      expect(bytes).toEqual(new Uint8Array([10, 20, 30]))
    })

    it('应该处理空数据', () => {
      const data = new Uint8Array([])
      const result = new CipherResult(data)

      expect(result.toHex()).toBe('')
      expect(result.toBytes()).toEqual(new Uint8Array([]))
    })
  })
})
