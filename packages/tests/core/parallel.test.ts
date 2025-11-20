import { describe, it, expect } from 'vitest'
import { parallel } from '@cat-kit/core/src'

describe('并行处理函数', () => {
  describe('parallel', () => {
    it('应该执行所有任务并返回结果', () => {
      const tasks = [
        () => 1,
        () => 2,
        () => 3
      ]

      const results = parallel(tasks)
      expect(results).toEqual([1, 2, 3])
    })

    it('应该处理空数组', () => {
      const results = parallel([])
      expect(results).toEqual([])
    })

    it('应该处理不同返回类型', () => {
      const tasks = [
        () => 'string',
        () => 123,
        () => ({ key: 'value' }),
        () => [1, 2, 3]
      ]

      const results = parallel(tasks)
      expect(results).toEqual(['string', 123, { key: 'value' }, [1, 2, 3]])
    })

    it('应该按顺序返回结果', () => {
      const results: number[] = []
      const tasks = [
        () => { results.push(1); return 'a' },
        () => { results.push(2); return 'b' },
        () => { results.push(3); return 'c' }
      ]

      parallel(tasks)
      expect(results).toEqual([1, 2, 3])
    })
  })
})

