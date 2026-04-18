import { Virtualizer } from '@cat-kit/fe/src'

function createScrollElement() {
  const listeners = new Map<string, EventListener>()

  return {
    clientHeight: 120,
    clientWidth: 320,
    scrollTop: 0,
    scrollLeft: 0,
    addEventListener: (type: string, listener: EventListener) => {
      listeners.set(type, listener)
    },
    removeEventListener: (type: string) => {
      listeners.delete(type)
    },
    scrollTo: ({ top, left }: { top?: number; left?: number }) => {
      if (typeof top === 'number') {
        mock.scrollTop = top
      }
      if (typeof left === 'number') {
        mock.scrollLeft = left
      }
    },
    emitScroll: () => {
      listeners.get('scroll')?.(new Event('scroll'))
    }
  }
}

const mock = createScrollElement()

describe('Virtualizer', () => {
  it('应该根据 viewport 与 offset 计算虚拟项并应用 overscan', () => {
    const virtualizer = new Virtualizer({
      count: 20,
      overscan: 2,
      estimateSize: () => 10
    })

    virtualizer.setViewport(50)
    virtualizer.setOffset(80)

    expect(virtualizer.getTotalSize()).toBe(200)
    expect(virtualizer.getItems().map((item) => item.index)).toEqual([
      6, 7, 8, 9, 10, 11, 12, 13, 14
    ])
    expect(virtualizer.getSnapshot().beforeSize).toBe(60)
  })

  it('应该在测量真实尺寸后重算位置与总尺寸', () => {
    const virtualizer = new Virtualizer({
      count: 5,
      overscan: 1,
      estimateSize: (index) => (index + 1) * 10
    })

    virtualizer.setViewport(120)
    expect(virtualizer.getTotalSize()).toBe(150)

    virtualizer.measure(2, 60)

    expect(virtualizer.getTotalSize()).toBe(180)
    expect(virtualizer.getItem(3).start).toBe(10 + 20 + 60)
  })

  it('应该支持 horizontal 模式与 scrollToIndex 对齐', () => {
    const virtualizer = new Virtualizer({
      count: 8,
      horizontal: true,
      estimateSize: () => 50,
      initialViewport: 120
    })

    virtualizer.scrollToIndex(4, { align: 'center' })

    expect(virtualizer.getSnapshot().horizontal).toBe(true)
    expect(virtualizer.getSnapshot().offset).toBe(165)
  })

  it('应该支持 mount 到容器并驱动滚动同步', () => {
    const virtualizer = new Virtualizer({
      count: 10,
      estimateSize: () => 30,
      overscan: 1
    })

    virtualizer.mount(mock as unknown as HTMLElement)
    mock.scrollTop = 90
    mock.emitScroll()

    expect(virtualizer.getSnapshot().viewportSize).toBe(120)
    expect(virtualizer.getSnapshot().offset).toBe(90)

    virtualizer.scrollToIndex(6, { align: 'start' })
    expect(mock.scrollTop).toBe(180)
  })

  it('subscribe 应该推送最新快照', () => {
    const virtualizer = new Virtualizer({
      count: 3,
      estimateSize: () => 20
    })

    const snapshots: number[] = []
    const unsubscribe = virtualizer.subscribe((snapshot) => {
      snapshots.push(snapshot.totalSize)
    })

    virtualizer.measure(1, 40)
    unsubscribe()
    virtualizer.measure(2, 60)

    expect(snapshots).toEqual([60, 80])
  })
})
