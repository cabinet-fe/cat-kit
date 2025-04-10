import { describe, expect, test, mock } from 'bun:test'
import { parallel } from '../../src/optimize/parallel'

describe('并行执行函数测试', () => {
  describe('parallel', () => {
    test('应该并行执行多个任务并返回结果数组', () => {
      const task1 = () => 1
      const task2 = () => 2
      const task3 = () => 3

      const results = parallel([task1, task2, task3])

      expect(results).toEqual([1, 2, 3])
    })

    test('应该保持任务执行顺序与输入顺序一致', () => {
      const task1 = () => 'a'
      const task2 = () => 'b'
      const task3 = () => 'c'

      const results = parallel([task1, task2, task3])

      expect(results[0]).toBe('a')
      expect(results[1]).toBe('b')
      expect(results[2]).toBe('c')
    })

    test('应该可以处理不同类型返回值的任务', () => {
      const task1 = () => 123
      const task2 = () => 'string'
      const task3 = () => ({ key: 'value' })

      const results = parallel([task1, task2, task3])

      expect(results[0]).toBe(123)
      expect(results[1]).toBe('string')
      expect(results[2]).toEqual({ key: 'value' })
    })

    test('应该立即执行所有任务', () => {
      const mockTask1 = mock(() => 1)
      const mockTask2 = mock(() => 2)

      parallel([mockTask1, mockTask2])

      expect(mockTask1).toHaveBeenCalledTimes(1)
      expect(mockTask2).toHaveBeenCalledTimes(1)
    })
  })
})
