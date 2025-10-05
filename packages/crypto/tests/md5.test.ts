import { describe, it, expect } from 'vitest'
import { md5 } from '../src/digest/md5'

describe('MD5 摘要模块', () => {
  describe('md5 基本功能', () => {
    it('应该正确计算字符串的 MD5 哈希', () => {
      // 使用已知的 MD5 值进行验证
      const hash1 = md5('hello world').hex()
      expect(hash1).toBe('5eb63bbbe01eeed093cb22bb8f5acdc3')

      const hash2 = md5('').hex()
      expect(hash2).toBe('d41d8cd98f00b204e9800998ecf8427e')

      const hash3 = md5('The quick brown fox jumps over the lazy dog').hex()
      expect(hash3).toBe('9e107d9d372bb6826bd81d3542a419d6')
    })

    it('应该支持 Uint8Array 输入', () => {
      const data = new Uint8Array([104, 101, 108, 108, 111]) // "hello"
      const hash = md5(data).hex()
      expect(hash).toBe('5d41402abc4b2a76b9719d911017c592')
    })

    it('应该支持 ArrayBuffer 输入', () => {
      const buffer = new Uint8Array([104, 101, 108, 108, 111]).buffer
      const hash = md5(buffer).hex()
      expect(hash).toBe('5d41402abc4b2a76b9719d911017c592')
    })

    it('应该支持中文字符', () => {
      const hash = md5('你好世界').hex()
      expect(hash).toBe('dbefd3ada018615b35588a01e216ae6e')
    })

    it('应该支持特殊字符', () => {
      const hash = md5('!@#$%^&*()_+-=[]{}|;:,.<>?').hex()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBe(32)
    })
  })

  describe('输出格式', () => {
    it('应该输出十六进制格式', () => {
      const result = md5('test')
      const hex = result.hex()
      expect(typeof hex).toBe('string')
      expect(hex.length).toBe(32)
      expect(/^[0-9a-f]{32}$/.test(hex)).toBe(true)
    })

    it('应该输出 Base64 格式', () => {
      const result = md5('test')
      const base64 = result.base64()
      expect(typeof base64).toBe('string')
      // Base64 编码的 16 字节应该是 24 个字符（包含填充）
      expect(base64.length).toBeGreaterThanOrEqual(22)
    })

    it('应该输出字节数组', () => {
      const result = md5('test')
      const bytes = result.bytes()
      expect(bytes).toBeInstanceOf(Uint8Array)
      expect(bytes.length).toBe(16)
    })
  })

  describe('增量哈希器', () => {
    it('应该支持增量更新', () => {
      const hasher = md5.hasher()
      hasher.update('hello')
      hasher.update(' ')
      hasher.update('world')
      const hash = hasher.finish().hex()

      expect(hash).toBe('5eb63bbbe01eeed093cb22bb8f5acdc3')
    })

    it('应该与一次性哈希结果相同', () => {
      const hasher = md5.hasher()
      hasher.update('The ')
      hasher.update('quick ')
      hasher.update('brown ')
      hasher.update('fox')
      const incrementalHash = hasher.finish().hex()

      const directHash = md5('The quick brown fox').hex()

      expect(incrementalHash).toBe(directHash)
    })

    it('应该处理多种数据类型', () => {
      const hasher = md5.hasher()
      hasher.update('hello')
      hasher.update(new Uint8Array([32])) // 空格
      hasher.update(new TextEncoder().encode('world'))
      const hash = hasher.finish().hex()

      expect(hash).toBe('5eb63bbbe01eeed093cb22bb8f5acdc3')
    })

    it('应该处理大量小块数据', () => {
      const hasher = md5.hasher()
      const text = 'abcdefghijklmnopqrstuvwxyz'

      // 逐字符更新
      for (const char of text) {
        hasher.update(char)
      }

      const incrementalHash = hasher.finish().hex()
      const directHash = md5(text).hex()

      expect(incrementalHash).toBe(directHash)
    })

    it('应该处理空数据', () => {
      const hasher = md5.hasher()
      hasher.update('')
      hasher.update(new Uint8Array(0))
      const hash = hasher.finish().hex()

      expect(hash).toBe('d41d8cd98f00b204e9800998ecf8427e') // 空字符串的 MD5
    })

    it('完成后应该能够再次读取结果', () => {
      const hasher = md5.hasher()
      hasher.update('test')
      const hash1 = hasher.finish().hex()
      const hash2 = hasher.finish().hex()

      expect(hash1).toBe(hash2)
    })
  })

  describe('边界情况和性能', () => {
    it('应该处理长字符串', () => {
      const longString = 'a'.repeat(10000)
      const hash = md5(longString).hex()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBe(32)
    })

    it('应该处理大的 ArrayBuffer', () => {
      const size = 100000
      const buffer = new Uint8Array(size)
      for (let i = 0; i < size; i++) {
        buffer[i] = i % 256
      }
      const hash = md5(buffer).hex()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBe(32)
    })

    it('应该处理块边界数据', () => {
      // MD5 块大小为 64 字节
      const exact64 = 'a'.repeat(64)
      const hash64 = md5(exact64).hex()
      expect(hash64.length).toBe(32)

      const exact128 = 'a'.repeat(128)
      const hash128 = md5(exact128).hex()
      expect(hash128.length).toBe(32)
    })

    it('应该确保相同输入产生相同输出', () => {
      const input = 'consistency test'
      const hash1 = md5(input).hex()
      const hash2 = md5(input).hex()
      const hash3 = md5(input).hex()

      expect(hash1).toBe(hash2)
      expect(hash2).toBe(hash3)
    })

    it('应该确保不同输入产生不同输出', () => {
      const hash1 = md5('test1').hex()
      const hash2 = md5('test2').hex()
      const hash3 = md5('test3').hex()

      expect(hash1).not.toBe(hash2)
      expect(hash2).not.toBe(hash3)
      expect(hash1).not.toBe(hash3)
    })
  })
})
