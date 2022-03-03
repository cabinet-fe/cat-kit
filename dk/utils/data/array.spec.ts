import { last } from './array'

describe('数组测试', () => {
  const arr = [1, 2, 3]

  it('获取数组的最后一个元素', () => {
    expect(last(arr)).toBe(3)
  })
})