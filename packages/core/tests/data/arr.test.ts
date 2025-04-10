import { describe, expect, test } from 'bun:test'
import { last, union, unionBy, arr } from '../../src/data/arr'

describe('数组工具函数测试', () => {
  describe('last', () => {
    test('应该返回数组的最后一个元素', () => {
      expect(last([1, 2, 3])).toBe(3)
      expect(last(['a', 'b', 'c'])).toBe('c')
      expect(last([])).toBeUndefined()
    })

    test('应该适用于只读数组', () => {
      const readonlyArray = [1, 2, 3] as const
      expect(last(readonlyArray)).toBe(3)
    })
  })

  describe('union', () => {
    test('应该合并多个数组并去重', () => {
      expect(union([1, 2], [2, 3], [3, 4])).toEqual([1, 2, 3, 4])
      expect(union(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c'])
      expect(union([], [1, 2])).toEqual([1, 2])
      expect(union([])).toEqual([])
    })
  })

  describe('unionBy', () => {
    test('应该按照指定字段合并并去重对象数组', () => {
      const arr1 = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ]
      const arr2 = [
        { id: 2, name: 'Bobby' },
        { id: 3, name: 'Charlie' }
      ]

      const result = unionBy('id', arr1, arr2)

      expect(result).toHaveLength(3)
      expect(result).toContainEqual({ id: 1, name: 'Alice' })
      expect(result).toContainEqual({ id: 2, name: 'Bob' }) // 保留第一个出现的
      expect(result).toContainEqual({ id: 3, name: 'Charlie' })
    })

    test('应该处理非对象元素', () => {
      const arr1 = [{ id: 1 }, 'not-an-object', { id: 2 }]
      const arr2 = [{ id: 2 }, { id: 3 }]

      const result = unionBy('id', arr1 as any, arr2)

      expect(result).toContain('not-an-object')
      expect(result.filter(item => typeof item === 'object')).toHaveLength(3)
    })
  })

  describe('arr', () => {
    test('应该返回一个Arr实例', () => {
      const array = [1, 2, 3]
      const arrInstance = arr(array)

      // 测试last属性
      expect(arrInstance.last).toBe(3)
    })
  })
})
