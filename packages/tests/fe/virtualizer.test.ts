import { describe, it, expect } from 'vitest'
import { Virtualizer } from '@cat-kit/fe/src'

describe('Virtualizer', () => {
  it('应该根据容器尺寸与偏移计算可见项并应用缓冲', () => {
    const virtualizer = new Virtualizer({
      length: 20,
      buffer: 2,
      estimateSize: () => 10
    })

    virtualizer.update({ containerSize: 50, offsetSize: 0 })
    expect(virtualizer.getTotalSize()).toBe(200)
    expect(virtualizer.getVisibleItems().map(item => item.index)).toEqual([
      0, 1, 2, 3, 4, 5, 6
    ])

    virtualizer.update({ containerSize: 50, offsetSize: 80 })
    expect(virtualizer.getVisibleItems().map(item => item.index)).toEqual([
      6, 7, 8, 9, 10, 11, 12
    ])
  })

  it('应该在更新单项尺寸时重算总高度与起始位置缓存', () => {
    const virtualizer = new Virtualizer({
      length: 5,
      buffer: 1,
      estimateSize: i => (i + 1) * 10
    })
    virtualizer.update({ containerSize: 120, offsetSize: 0 })
    expect(virtualizer.getTotalSize()).toBe(150)

    virtualizer.updateItemSize(2, 60)
    expect(virtualizer.getTotalSize()).toBe(180)

    const third = virtualizer
      .getVisibleItems()
      .find(item => item.index === 3)!
    expect(third.start).toBe(10 + 20 + 60)
  })

  it('reset 应该清除缓存并恢复偏移', () => {
    const virtualizer = new Virtualizer({
      length: 3,
      buffer: 0,
      estimateSize: () => 20
    })

    virtualizer.update({ containerSize: 30, offsetSize: 10 })
    expect(virtualizer.getVisibleItems().map(item => item.index)).toEqual([0, 1])

    virtualizer.reset()
    const resetItems = virtualizer.getVisibleItems()
    expect(resetItems.map(item => item.index)).toEqual([0, 1])
    expect(resetItems[0]!.start).toBe(0)
    expect(virtualizer.getTotalSize()).toBe(60)

    virtualizer.update({ containerSize: 30, offsetSize: 0 })
    expect(virtualizer.getVisibleItems().map(item => item.index)).toEqual([0, 1])
  })
})
