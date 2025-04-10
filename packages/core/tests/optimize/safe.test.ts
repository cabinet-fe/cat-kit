import { describe, expect, test } from 'bun:test'
import { safeRun } from '../../src/optimize/safe'

describe('安全运行函数测试', () => {
  describe('safeRun', () => {
    test('应该正常返回函数的返回值', () => {
      const result = safeRun(() => 'success')
      expect(result).toBe('success')
    })

    test('函数抛出异常时应返回undefined', () => {
      const result = safeRun(() => {
        throw new Error('测试错误')
      })
      expect(result).toBeUndefined()
    })

    test('函数抛出异常时应返回指定的默认值', () => {
      const defaultValue = 'default'
      const result = safeRun(() => {
        throw new Error('测试错误')
      }, defaultValue)
      expect(result).toBe(defaultValue)
    })

    test('当函数返回null时不应被捕获', () => {
      const result = safeRun(() => null, 'default')
      expect(result).toBeNull()
    })

    test('当函数返回undefined时不应使用默认值', () => {
      const result = safeRun(() => undefined, 'default')
      expect(result).toBeUndefined()
    })
  })
})
