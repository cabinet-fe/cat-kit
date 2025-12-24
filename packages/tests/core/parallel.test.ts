import { describe, it, expect } from 'vitest'
import { parallel } from '@cat-kit/core/src'

describe('并行处理函数', () => {
  describe('parallel', () => {
    it('应该执行所有任务并返回结果', async () => {
      const tasks = [() => 1, () => 2, () => 3]

      const results = await parallel(tasks)
      expect(results).toEqual([1, 2, 3])
    })

    it('应该处理空数组', async () => {
      const results = await parallel([])
      expect(results).toEqual([])
    })

    it('应该处理不同返回类型', async () => {
      const tasks = [
        () => 'string',
        () => 123,
        () => ({ key: 'value' }),
        () => [1, 2, 3]
      ]

      const results = await parallel(tasks)
      expect(results).toEqual(['string', 123, { key: 'value' }, [1, 2, 3]])
    })

    it('应该按顺序返回结果（与任务顺序一致）', async () => {
      const tasks = [
        async () => {
          await new Promise(r => setTimeout(r, 30))
          return 'a'
        },
        async () => {
          await new Promise(r => setTimeout(r, 10))
          return 'b'
        },
        async () => {
          await new Promise(r => setTimeout(r, 20))
          return 'c'
        }
      ]

      const results = await parallel(tasks)
      expect(results).toEqual(['a', 'b', 'c'])
    })

    it('应该遵守并发上限', async () => {
      let active = 0
      let maxActive = 0

      const tasks = Array.from({ length: 10 }, (_, i) => async () => {
        active++
        maxActive = Math.max(maxActive, active)
        await new Promise(r => setTimeout(r, 20))
        active--
        return i
      })

      const results = await parallel(tasks, { concurrency: 3 })
      expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(maxActive).toBeLessThanOrEqual(3)
    })

    it('当任务抛错时应该 reject', async () => {
      const tasks = [
        async () => 1,
        async () => {
          throw new Error('boom')
        },
        async () => 3
      ]

      await expect(parallel(tasks)).rejects.toThrow('boom')
    })
  })
})
