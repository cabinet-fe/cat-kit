import { arr, last, union, unionBy } from './array'

describe('数组测试', () => {
  const _arr = [1, 2, 3]

  it('获取数组的最后一个元素', () => {
    expect(last(_arr)).toBe(3)
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

  it('eachRight', () => {
    let reversed: number[] = []
    arr(_arr).eachRight(v => {
      reversed.push(v)
    })
    expect(reversed).toEqual([3, 2, 1])
  })

  it('omit', () => {
    expect(arr(_arr).omit(1)).toEqual([1, 3])
    expect(arr(_arr).omit([0, 2])).toEqual([2])
  })
})
