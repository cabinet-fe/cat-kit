import {
  str2u8a,
  u8a2str,
  u8a2hex,
  hex2u8a,
  base642u8a,
  u8a2base64,
  obj2query,
  query2obj,
  transform
} from '@cat-kit/core/src'
import { describe, it, expect } from 'vitest'

describe('数据转换函数', () => {
  describe('str2u8a 和 u8a2str', () => {
    it('应该正确转换 ASCII 字符串', () => {
      const str = 'Hello, World!'
      const u8a = str2u8a(str)

      expect(u8a).toBeInstanceOf(Uint8Array)
      expect(u8a2str(u8a)).toBe(str)
    })

    it('应该正确转换 UTF-8 字符串', () => {
      const str = '你好，世界！'
      const u8a = str2u8a(str)

      expect(u8a2str(u8a)).toBe(str)
    })

    it('应该处理空字符串', () => {
      const str = ''
      const u8a = str2u8a(str)

      expect(u8a.length).toBe(0)
      expect(u8a2str(u8a)).toBe(str)
    })

    it('应该正确转换表情符号', () => {
      const str = '🎉🎊😀'
      const u8a = str2u8a(str)

      expect(u8a2str(u8a)).toBe(str)
    })
  })

  describe('u8a2hex 和 hex2u8a', () => {
    it('应该正确转换简单的字节数组', () => {
      const u8a = new Uint8Array([0, 1, 255, 128])
      const hex = u8a2hex(u8a)

      expect(hex).toBe('0001ff80')

      const converted = hex2u8a(hex)
      expect(Array.from(converted)).toEqual(Array.from(u8a))
    })

    it('应该处理空数组与空十六进制串', () => {
      const u8a = new Uint8Array([])
      const hex = u8a2hex(u8a)

      expect(hex).toBe('')
      expect(Array.from(hex2u8a(''))).toEqual([])
    })

    it('hex2u8a 应拒绝奇数长度', () => {
      expect(() => hex2u8a('abc')).toThrow(/偶数/)
    })

    it('hex2u8a 应拒绝非法字符', () => {
      expect(() => hex2u8a('ag')).toThrow(/非十六进制/)
    })

    it('hex2u8a 应接受 0x 前缀与首尾空白', () => {
      expect(Array.from(hex2u8a(' 0x00ff '))).toEqual([0, 255])
    })

    it('应该正确填充零', () => {
      const u8a = new Uint8Array([0, 15, 255])
      const hex = u8a2hex(u8a)

      expect(hex).toBe('000fff')
    })
  })

  describe('base642u8a 和 u8a2base64', () => {
    it('应该正确转换简单数据', () => {
      const u8a = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
      const base64 = u8a2base64(u8a)

      expect(base64).toBe('SGVsbG8=')

      const converted = base642u8a(base64)
      expect(Array.from(converted)).toEqual(Array.from(u8a))
    })

    it('应该处理空数组', () => {
      const u8a = new Uint8Array([])
      const base64 = u8a2base64(u8a)

      expect(base64).toBe('')
    })

    it('应该正确转换二进制数据', () => {
      const u8a = new Uint8Array([0, 1, 2, 3, 255, 254, 253])
      const base64 = u8a2base64(u8a)
      const converted = base642u8a(base64)

      expect(Array.from(converted)).toEqual(Array.from(u8a))
    })

    it('在 Node 环境下应支持大数据且不出现堆栈溢出', () => {
      const largeArray = new Uint8Array(100000)
      for (let i = 0; i < largeArray.length; i++) {
        largeArray[i] = i % 256
      }

      const base64 = u8a2base64(largeArray)
      const converted = base642u8a(base64)

      expect(converted.length).toBe(largeArray.length)
      expect(Array.from(converted.slice(0, 10))).toEqual(Array.from(largeArray.slice(0, 10)))
    })
  })

  describe('obj2query 和 query2obj', () => {
    it('应该正确转换简单对象', () => {
      const obj = { a: 'hello', b: 'world' }
      const query = obj2query(obj)

      expect(query).toContain('a=')
      expect(query).toContain('b=')
      expect(query).toContain('&')
    })

    it('应该正确转换回对象', () => {
      const query = 'name=John&age=30&city=Beijing'
      const obj = query2obj(query)

      expect(obj).toEqual({ name: 'John', age: 30, city: 'Beijing' })
    })

    it('应该处理带 ? 的查询字符串', () => {
      const query = '?name=John&age=30'
      const obj = query2obj(query)

      expect(obj).toEqual({ name: 'John', age: 30 })
    })

    it('应该处理空查询字符串', () => {
      expect(query2obj('')).toEqual({})
      expect(query2obj('?')).toEqual({})
    })

    it('应该正确编码特殊字符', () => {
      const obj = { message: 'Hello, World!', url: 'https://example.com' }
      const query = obj2query(obj)
      const converted = query2obj(query)

      // 因为会 JSON.stringify，所以值会带引号
      expect(converted.message).toContain('Hello')
    })

    it('应该处理空值', () => {
      const obj = { a: null, b: undefined, c: 'value' }
      const query = obj2query(obj)

      expect(query).toContain('a=')
      expect(query).toContain('b=')
      expect(query).toContain('c=')
    })

    it('应该忽略无效的查询参数', () => {
      const query = 'validkey=value&invalidparam&anotherkey=value2'
      const obj = query2obj(query)

      expect(obj).toEqual({ validkey: 'value', anotherkey: 'value2' })
    })

    it('应保留 value 中第一个 = 之后的内容', () => {
      const query = 'q=a=b&plain=1'
      expect(query2obj(query)).toEqual({ q: 'a=b', plain: 1 })
    })

    it('应该无损还原原始类型', () => {
      const original = { num: 1, bool: true, arr: [1, 'a'], nested: { x: 1 } }

      const query = obj2query(original)
      const parsed = query2obj(query)

      expect(parsed).toEqual(original)
    })
  })

  describe('transform', () => {
    it('应该按顺序执行转换链', () => {
      const data = 5
      const result = transform(data, [
        (x: number) => x * 2, // 10
        (x: number) => x + 3, // 13
        (x: number) => x.toString() // "13"
      ])

      expect(result).toBe('13')
    })

    it('应该处理单个转换', () => {
      const data = 'hello'
      const result = transform(data, [(x: string) => x.toUpperCase()])

      expect(result).toBe('HELLO')
    })

    it('应该处理复杂的转换链', () => {
      const data = { value: 10 }
      const result = transform(data, [
        (obj: any) => obj.value, // 10
        (x: number) => x * 2, // 20
        (x: number) => ({ result: x }), // { result: 20 }
        (obj: any) => obj.result.toString() // "20"
      ])

      expect(result).toBe('20')
    })

    it('应该处理类型转换', () => {
      const data = [1, 2, 3]
      const result = transform(data, [
        (arr: number[]) => arr.map((x) => x * 2), // [2, 4, 6]
        (arr: number[]) => arr.reduce((a, b) => a + b, 0), // 12
        (x: number) => x.toString() // "12"
      ])

      expect(result).toBe('12')
    })
  })
})
