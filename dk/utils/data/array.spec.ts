import { last, union, unionBy } from './array'

describe('数组测试', () => {
  const arr = [1, 2, 3]

  it('获取数组的最后一个元素', () => {
    expect(last(arr)).toBe(3)
  })

  it('union', () => {
    expect(union([1, 2], [2, 3], [3, 4])).toEqual([1, 2, 3, 4])
  })

  it('unionBy', () => {
    expect(
      unionBy(
        'name',
        [
          { name: '张三', score: 78 },
          { name: '李四', score: 65 }
        ],
        [
          { name: '王五', score: 82 },
          { name: '李四', score: 65 }
        ]
      )
    ).toEqual([
      { name: '张三', score: 78 },
      { name: '李四', score: 65 },
      { name: '王五', score: 82 }
    ])
  })
})
