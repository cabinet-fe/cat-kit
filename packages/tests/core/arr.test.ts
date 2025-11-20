import { describe, it, expect } from 'vitest'
import {
  last,
  union,
  unionBy,
  eachRight,
  omitArr,
  arr
} from '@cat-kit/core/src'

describe('数组工具函数', () => {
  describe('last', () => {
    it('应该返回数组的最后一个元素', () => {
      expect(last([1, 2, 3])).toBe(3)
      expect(last(['a', 'b', 'c'])).toBe('c')
      expect(last([{ id: 1 }, { id: 2 }])).toEqual({ id: 2 })
    })

    it('应该处理空数组', () => {
      expect(last([])).toBeUndefined()
    })

    it('应该处理单元素数组', () => {
      expect(last([42])).toBe(42)
    })
  })

  describe('union', () => {
    it('应该合并数组并去重', () => {
      expect(union([1, 2], [2, 3], [3, 4])).toEqual([1, 2, 3, 4])
      expect(union(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('应该处理空数组', () => {
      expect(union([], [])).toEqual([])
      expect(union([1, 2], [])).toEqual([1, 2])
    })

    it('应该处理单个数组', () => {
      expect(union([1, 2, 2, 3])).toEqual([1, 2, 3])
    })
  })

  describe('unionBy', () => {
    it('应该按指定字段去重合并', () => {
      const arr1 = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ]
      const arr2 = [
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
      ]

      const result = unionBy('id', arr1, arr2)
      expect(result).toHaveLength(3)
      expect(result.map(item => item.id)).toEqual([1, 2, 3])
    })

    it('应该处理非对象元素', () => {
      const result = unionBy('id', [1 as any, 2 as any], [3 as any, 4 as any])
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('应该处理空数组', () => {
      expect(unionBy('id', [], [])).toEqual([])
    })
  })

  describe('eachRight', () => {
    it('应该从右到左遍历数组', () => {
      const result: number[] = []
      eachRight([1, 2, 3], val => {
        result.push(val)
      })
      expect(result).toEqual([3, 2, 1])
    })

    it('应该提供正确的索引', () => {
      const indices: number[] = []
      eachRight(['a', 'b', 'c'], (_, index) => {
        indices.push(index)
      })
      expect(indices).toEqual([2, 1, 0])
    })

    it('应该处理空数组', () => {
      const result: any[] = []
      eachRight([], val => {
        result.push(val)
      })
      expect(result).toEqual([])
    })
  })

  describe('omitArr', () => {
    it('应该丢弃单个索引的元素', () => {
      expect(omitArr([1, 2, 3, 4], 1)).toEqual([1, 3, 4])
      expect(omitArr(['a', 'b', 'c'], 0)).toEqual(['b', 'c'])
    })

    it('应该丢弃多个索引的元素', () => {
      expect(omitArr([1, 2, 3, 4], [0, 2])).toEqual([2, 4])
      expect(omitArr(['a', 'b', 'c', 'd'], [1, 3])).toEqual(['a', 'c'])
    })

    it('应该处理空索引数组', () => {
      expect(omitArr([1, 2, 3], [])).toEqual([1, 2, 3])
    })

    it('应该处理超出范围的索引', () => {
      expect(omitArr([1, 2, 3], [5, 10])).toEqual([1, 2, 3])
    })

    it('应该抛出错误当索引类型不正确', () => {
      expect(() => omitArr([1, 2, 3], 'invalid' as any)).toThrow('索引类型错误')
    })
  })

  describe('Arr类', () => {
    describe('eachRight', () => {
      it('应该从右到左遍历', () => {
        const result: number[] = []
        arr([1, 2, 3]).eachRight(val => {
          result.push(val)
        })
        expect(result).toEqual([3, 2, 1])
      })
    })

    describe('omit', () => {
      it('应该丢弃指定索引的元素', () => {
        expect(arr([1, 2, 3, 4]).omit(1)).toEqual([1, 3, 4])
        expect(arr([1, 2, 3, 4]).omit([0, 2])).toEqual([2, 4])
      })
    })

    describe('find', () => {
      it('应该根据条件查找元素', () => {
        const items = [
          { id: 1, name: 'Alice', age: 25 },
          { id: 2, name: 'Bob', age: 30 },
          { id: 3, name: 'Charlie', age: 25 }
        ]

        expect(arr(items).find({ age: 25 })).toEqual({
          id: 1,
          name: 'Alice',
          age: 25
        })
        expect(arr(items).find({ name: 'Bob' })).toEqual({
          id: 2,
          name: 'Bob',
          age: 30
        })
        expect(arr(items).find({ age: 35 })).toBeUndefined()
      })

      it('应该匹配多个条件', () => {
        const items = [
          { id: 1, name: 'Alice', age: 25, city: 'Beijing' },
          { id: 2, name: 'Bob', age: 25, city: 'Shanghai' }
        ]

        expect(arr(items).find({ age: 25, city: 'Beijing' })).toEqual(items[0])
        expect(arr(items).find({ age: 25, city: 'Guangzhou' })).toBeUndefined()
      })
    })

    describe('last', () => {
      it('应该返回最后一个元素', () => {
        expect(arr([1, 2, 3]).last).toBe(3)
        expect(arr([]).last).toBeUndefined()
      })
    })

    describe('move', () => {
      it('应该向后移动元素', () => {
        expect(arr([1, 2, 3, 4]).move(0, 2)).toEqual([2, 3, 1, 4])
        expect(arr(['a', 'b', 'c', 'd']).move(1, 3)).toEqual([
          'a',
          'c',
          'd',
          'b'
        ])
      })

      it('应该向前移动元素', () => {
        expect(arr([1, 2, 3, 4]).move(3, 1)).toEqual([1, 4, 2, 3])
        expect(arr(['a', 'b', 'c', 'd']).move(2, 0)).toEqual([
          'c',
          'a',
          'b',
          'd'
        ])
      })

      it('应该处理相同索引', () => {
        expect(arr([1, 2, 3]).move(1, 1)).toEqual([1, 2, 3])
      })
    })

    describe('groupBy', () => {
      it('应该按回调函数分组', () => {
        const items = [
          { type: 'fruit', name: 'apple' },
          { type: 'vegetable', name: 'carrot' },
          { type: 'fruit', name: 'banana' },
          { type: 'vegetable', name: 'lettuce' }
        ]

        const grouped = arr(items).groupBy(item => item.type)

        expect(grouped.fruit).toHaveLength(2)
        expect(grouped.vegetable).toHaveLength(2)
        expect(grouped.fruit!.map(item => item.name)).toEqual([
          'apple',
          'banana'
        ])
        expect(grouped.vegetable!.map(item => item.name)).toEqual([
          'carrot',
          'lettuce'
        ])
      })

      it('应该处理数字分组', () => {
        const numbers = [1, 2, 3, 4, 5, 6]
        const grouped = arr(numbers).groupBy(num =>
          num % 2 === 0 ? 'even' : 'odd'
        )

        expect(grouped.even).toEqual([2, 4, 6])
        expect(grouped.odd).toEqual([1, 3, 5])
      })

      it('应该处理空数组', () => {
        const grouped = arr([]).groupBy(() => 'key')
        expect(grouped).toEqual({})
      })
    })
  })
})
