import { describe, it, expect } from 'vitest'
import { nanoid, random, customAlphabet } from '../src/key-gen'

describe('key-gen 生成器模块', () => {
  describe('random', () => {
    it('应该生成指定字节数的随机数据', () => {
      const bytes = random(32)
      expect(bytes).toBeInstanceOf(Uint8Array)
      expect(bytes.length).toBe(32)
    })

    it('应该生成不同的随机值', () => {
      const bytes1 = random(16)
      const bytes2 = random(16)
      expect(bytes1).not.toEqual(bytes2)
    })

    it('应该处理边界情况', () => {
      const bytes0 = random(0)
      expect(bytes0.length).toBe(0)

      const bytes1 = random(1)
      expect(bytes1.length).toBe(1)

      const bytes1024 = random(1024)
      expect(bytes1024.length).toBe(1024)
    })
  })

  describe('nanoid', () => {
    it('应该生成默认长度的 ID (21)', () => {
      const id = nanoid()
      expect(typeof id).toBe('string')
      expect(id.length).toBe(21)
    })

    it('应该生成指定长度的 ID', () => {
      const id10 = nanoid(10)
      expect(id10.length).toBe(10)

      const id16 = nanoid(16)
      expect(id16.length).toBe(16)

      const id32 = nanoid(32)
      expect(id32.length).toBe(32)
    })

    it('应该只包含 URL 安全字符', () => {
      const id = nanoid(100)
      const urlSafeRegex = /^[A-Za-z0-9_-]+$/
      expect(urlSafeRegex.test(id)).toBe(true)
    })

    it('应该生成唯一的 ID', () => {
      const ids = new Set()
      for (let i = 0; i < 1000; i++) {
        ids.add(nanoid())
      }
      // 1000 个 ID 应该都是唯一的
      expect(ids.size).toBe(1000)
    })

    it('应该处理边界情况', () => {
      const id1 = nanoid(1)
      expect(id1.length).toBe(1)

      const id0 = nanoid(0)
      expect(id0.length).toBe(0)
    })
  })

  describe('customAlphabet', () => {
    it('应该使用自定义字符集生成 ID', () => {
      const generate = customAlphabet('0123456789', 10)
      const id = generate()

      expect(id.length).toBe(10)
      expect(/^[0-9]+$/.test(id)).toBe(true)
    })

    it('应该支持自定义长度参数', () => {
      const generate = customAlphabet('ABCDEF', 8)
      const id1 = generate()
      const id2 = generate(12)

      expect(id1.length).toBe(8)
      expect(id2.length).toBe(12)
    })

    it('应该只使用指定的字符集', () => {
      const alphabet = '0123456789ABCDEF'
      const generate = customAlphabet(alphabet, 20)
      const id = generate()

      for (const char of id) {
        expect(alphabet.includes(char)).toBe(true)
      }
    })

    it('应该处理单字符字母表', () => {
      const generate = customAlphabet('A', 10)
      const id = generate()
      expect(id).toBe('AAAAAAAAAA')
    })

    it('应该生成唯一的 ID', () => {
      const generate = customAlphabet('0123456789abcdef', 16)
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(generate())
      }
      expect(ids.size).toBeGreaterThan(95) // 允许极小概率的碰撞
    })
  })
})
