import { describe, it, expect } from 'vitest'
import { safeRun } from '@cat-kit/core/src'

describe('安全执行函数', () => {
  describe('safeRun', () => {
    it('应该正常返回函数结果', () => {
      const result = safeRun(() => 'success')
      expect(result).toBe('success')
    })

    it('应该捕获异常并返回 undefined', () => {
      const result = safeRun(() => {
        throw new Error('error')
      })
      expect(result).toBeUndefined()
    })

    it('应该使用默认值', () => {
      const result = safeRun(() => {
        throw new Error('error')
      }, 'default')
      expect(result).toBe('default')
    })

    it('应该处理复杂的返回类型', () => {
      const result = safeRun(() => ({ value: 123 }))
      expect(result).toEqual({ value: 123 })
    })

    it('应该处理不同类型的异常', () => {
      const result1 = safeRun(() => {
        throw new TypeError('type error')
      }, 'fallback')

      const result2 = safeRun(() => {
        throw 'string error'
      }, 'fallback')

      expect(result1).toBe('fallback')
      expect(result2).toBe('fallback')
    })
  })
})

