import { Virtualizer } from '@cat-kit/fe'
import type { VirtualSnapshot, VirtualizerOptions } from '@cat-kit/fe'
import { describe, expect, it, vi } from 'vitest'

interface ScrollToArg {
  top?: number
  left?: number
  behavior?: ScrollBehavior
}

function createScrollElement() {
  const listeners = new Map<string, EventListener>()
  const rafCallbacks = new Map<number, () => void>()
  let nextRafId = 1

  const win = {
    requestAnimationFrame(cb: () => void): number {
      const id = nextRafId++
      rafCallbacks.set(id, cb)
      return id
    },
    cancelAnimationFrame(id: number) {
      rafCallbacks.delete(id)
    }
  }

  let scrollTopInternal = 0
  let scrollLeftInternal = 0

  const mock = {
    clientHeight: 120,
    clientWidth: 320,
    // scrollTop / scrollLeft 使用访问器计数赋值次数，用于断言「批量测量同帧只写一次 DOM」。
    get scrollTop() {
      return scrollTopInternal
    },
    set scrollTop(v: number) {
      scrollTopInternal = v
      mock.scrollTopWrites += 1
    },
    get scrollLeft() {
      return scrollLeftInternal
    },
    set scrollLeft(v: number) {
      scrollLeftInternal = v
      mock.scrollLeftWrites += 1
    },
    scrollTopWrites: 0,
    scrollLeftWrites: 0,
    scrollToCalls: 0,
    scrollToArgs: [] as ScrollToArg[],
    ownerDocument: { defaultView: win },
    addEventListener: (type: string, listener: EventListener) => {
      listeners.set(type, listener)
    },
    removeEventListener: (type: string) => {
      listeners.delete(type)
    },
    scrollTo: (opts: ScrollToArg) => {
      mock.scrollToCalls += 1
      mock.scrollToArgs.push({ ...opts })
      if (typeof opts.top === 'number') scrollTopInternal = opts.top
      if (typeof opts.left === 'number') scrollLeftInternal = opts.left
    },
    emitScroll: () => {
      listeners.get('scroll')?.(new Event('scroll'))
    },
    flushRaf() {
      const ids = Array.from(rafCallbacks.keys())
      for (const id of ids) {
        const cb = rafCallbacks.get(id)
        if (cb) {
          rafCallbacks.delete(id)
          cb()
        }
      }
    },
    rafCount(): number {
      return rafCallbacks.size
    }
  }

  return mock
}

const mock = createScrollElement()

describe('Virtualizer', () => {
  it('应该根据 viewport 与 offset 计算虚拟项并应用 overscan', () => {
    const virtualizer = new Virtualizer({ count: 20, overscan: 2, estimateSize: () => 10 })

    virtualizer.setViewport(50)
    virtualizer.setOffset(80)

    expect(virtualizer.getSnapshot().totalSize).toBe(200)
    expect(virtualizer.getSnapshot().items.map((item) => item.index)).toEqual([
      6, 7, 8, 9, 10, 11, 12, 13, 14
    ])
    expect(virtualizer.getSnapshot().beforeSize).toBe(60)
  })

  it('应该在测量真实尺寸后重算位置与总尺寸', () => {
    const virtualizer = new Virtualizer({
      count: 5,
      overscan: 1,
      estimateSize: (index) => (index + 1) * 10,
      useMeasuredAverage: false
    })

    virtualizer.setViewport(120)
    expect(virtualizer.getSnapshot().totalSize).toBe(150)

    virtualizer.measure(2, 60)

    expect(virtualizer.getSnapshot().totalSize).toBe(180)
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
    const virtualizer = new Virtualizer({ count: 10, estimateSize: () => 30, overscan: 1 })

    virtualizer.mount(mock as unknown as HTMLElement)
    mock.scrollTop = 90
    mock.emitScroll()

    expect(virtualizer.getSnapshot().viewportSize).toBe(120)
    expect(virtualizer.getSnapshot().offset).toBe(90)

    virtualizer.scrollToIndex(6, { align: 'start' })
    expect(mock.scrollTop).toBe(180)
  })

  it('scrollToOffset 在目标偏移不变时不应重复触发 DOM scrollTo', () => {
    const element = createScrollElement()
    const virtualizer = new Virtualizer({ count: 10, estimateSize: () => 30, overscan: 1 })

    virtualizer.mount(element as unknown as HTMLElement)
    virtualizer.scrollToOffset(0)
    virtualizer.scrollToOffset(60)
    virtualizer.scrollToOffset(60)

    expect(element.scrollToCalls).toBe(1)
    expect(element.scrollTop).toBe(60)
  })

  it('subscribe 应该推送最新快照', () => {
    const virtualizer = new Virtualizer({
      count: 3,
      estimateSize: () => 20,
      useMeasuredAverage: false
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

  it('它应该在 gap 配置下让相邻项产生等距间隔', () => {
    const virtualizer = new Virtualizer({
      count: 5,
      estimateSize: () => 10,
      gap: 4,
      paddingStart: 6,
      paddingEnd: 3
    })

    expect(virtualizer.getItem(0).start).toBe(6)
    expect(virtualizer.getItem(1).start).toBe(20)
    expect(virtualizer.getItem(2).start).toBe(34)
    expect(virtualizer.getSnapshot().totalSize).toBe(75)
  })

  it('useMeasuredAverage 默认开启时，未测项应采用已测平均值估值以减小总尺寸偏差', () => {
    const virtualizer = new Virtualizer({ count: 5, estimateSize: () => 10 })

    expect(virtualizer.getSnapshot().totalSize).toBe(50)

    virtualizer.measure(2, 60)
    expect(virtualizer.getSnapshot().totalSize).toBe(60 * 5)

    virtualizer.measure(3, 60)
    expect(virtualizer.getSnapshot().totalSize).toBe(60 * 5)
  })

  it('measureMany 应批量应用测量并只触发一次快照推送', () => {
    const virtualizer = new Virtualizer({
      count: 3,
      estimateSize: () => 20,
      useMeasuredAverage: false
    })
    const totals: number[] = []
    const unsubscribe = virtualizer.subscribe((snapshot) => {
      totals.push(snapshot.totalSize)
    })

    totals.length = 0
    virtualizer.measureMany([
      { index: 1, size: 40 },
      { index: 2, size: 60 }
    ])

    expect(virtualizer.getSnapshot().totalSize).toBe(120)
    expect(totals).toEqual([120])
    unsubscribe()
  })

  it('纯 offset 变化时 snapshot 引用应保持稳定以避免高频滚动下的分配抖动', () => {
    const virtualizer = new Virtualizer({
      count: 100,
      estimateSize: () => 20,
      initialViewport: 200,
      overscan: 2
    })

    virtualizer.setOffset(41)
    const before = virtualizer.getSnapshot()
    const beforeStart = before.range!.startIndex
    const beforeEnd = before.range!.endIndex
    virtualizer.setOffset(42)
    const after = virtualizer.getSnapshot()

    // 结构未变：range 两端都没跨越任一项的边界
    expect(after.range!.startIndex).toBe(beforeStart)
    expect(after.range!.endIndex).toBe(beforeEnd)
    expect(after).toBe(before)
    expect(after.offset).toBe(42)
  })

  it('notify 在无变化时不应重复推送', () => {
    const virtualizer = new Virtualizer({ count: 3, estimateSize: () => 20 })

    virtualizer.setViewport(60)

    const snapshots: VirtualSnapshot[] = []
    const unsubscribe = virtualizer.subscribe((snapshot) => {
      snapshots.push(snapshot)
    })

    const initial = snapshots.length
    virtualizer.setOffset(0)
    virtualizer.setOffset(0)

    expect(snapshots.length).toBe(initial)
    unsubscribe()
  })

  it('initialOffset 超出上限时应该先 clamp 再计算可视范围', () => {
    const virtualizer = new Virtualizer({
      count: 10,
      estimateSize: () => 30,
      initialViewport: 120,
      initialOffset: 9_999,
      overscan: 0
    })

    expect(virtualizer.getSnapshot().offset).toBe(180)
    expect(virtualizer.getSnapshot().range).toEqual({ startIndex: 6, endIndex: 9 })
    expect(virtualizer.getSnapshot().items.map((item) => item.index)).toEqual([6, 7, 8, 9])
  })

  it('count 收缩后应该基于 clamp 后的 offset 重算可视范围', () => {
    const virtualizer = new Virtualizer({
      count: 10,
      estimateSize: () => 30,
      initialViewport: 120,
      overscan: 0
    })

    virtualizer.setOffset(180)
    virtualizer.setCount(5)

    expect(virtualizer.getSnapshot().offset).toBe(30)
    expect(virtualizer.getSnapshot().range).toEqual({ startIndex: 1, endIndex: 4 })
    expect(virtualizer.getSnapshot().items.map((item) => item.index)).toEqual([1, 2, 3, 4])
  })

  it('measureMany 改变中间项布局时应该刷新 snapshot 并触发订阅', () => {
    const virtualizer = new Virtualizer({
      count: 4,
      estimateSize: (index) => [10, 20, 20, 10][index]!,
      initialViewport: 100,
      overscan: 0,
      useMeasuredAverage: false
    })

    const snapshots: Array<Array<{ index: number; start: number; size: number }>> = []
    const unsubscribe = virtualizer.subscribe((snapshot) => {
      snapshots.push(
        snapshot.items.map((item) => ({ index: item.index, start: item.start, size: item.size }))
      )
    })

    snapshots.length = 0
    virtualizer.measureMany([
      { index: 1, size: 25 },
      { index: 2, size: 15 }
    ])

    expect(snapshots).toEqual([
      [
        { index: 0, start: 0, size: 10 },
        { index: 1, start: 10, size: 25 },
        { index: 2, start: 35, size: 15 },
        { index: 3, start: 50, size: 10 }
      ]
    ])
    expect(
      virtualizer
        .getSnapshot()
        .items.map((item) => ({ index: item.index, start: item.start, size: item.size }))
    ).toEqual([
      { index: 0, start: 0, size: 10 },
      { index: 1, start: 10, size: 25 },
      { index: 2, start: 35, size: 15 },
      { index: 3, start: 50, size: 10 }
    ])
    unsubscribe()
  })

  it('setOptions 更新 count 时应与 setCount 保持一致的可视结果', () => {
    const a = new Virtualizer({
      count: 10,
      estimateSize: () => 30,
      initialViewport: 120,
      overscan: 0
    })
    const b = new Virtualizer({
      count: 10,
      estimateSize: () => 30,
      initialViewport: 120,
      overscan: 0
    })

    a.setOffset(180)
    b.setOffset(180)
    a.setCount(12)
    b.setOptions({ count: 12 })

    expect(b.getSnapshot()).toEqual(a.getSnapshot())
  })

  describe('keyed items', () => {
    it('列表前插时，未变动项的真实测量值应按 key 复用', () => {
      const virtualizer = new Virtualizer({
        count: 3,
        estimateSize: () => 10,
        useMeasuredAverage: false,
        getItemKey: (i) => (['a', 'b', 'c'] as const)[i]!
      })

      virtualizer.measure(1, 40)

      virtualizer.setOptions({ getItemKey: (i) => (['x', 'a', 'b', 'c'] as const)[i]! })
      virtualizer.setCount(4)

      expect(virtualizer.getItem(2).size).toBe(40)
      expect(virtualizer.getItem(0).size).toBe(10)
    })

    it('乱序后，未变动项的真实测量值应按 key 复用', () => {
      let mapping: readonly string[] = ['a', 'b', 'c']
      const virtualizer = new Virtualizer({
        count: 3,
        estimateSize: () => 10,
        useMeasuredAverage: false,
        getItemKey: (i) => mapping[i]!
      })

      virtualizer.measure(0, 20)
      virtualizer.measure(2, 60)

      mapping = ['c', 'a', 'b']
      virtualizer.setOptions({ getItemKey: (i) => mapping[i]! })

      expect(virtualizer.getItem(0).size).toBe(60)
      expect(virtualizer.getItem(1).size).toBe(20)
    })

    it('count 收缩时应剪裁不在 [0, count) 范围内的 key', () => {
      const virtualizer = new Virtualizer({
        count: 10,
        estimateSize: () => 10,
        getItemKey: (i) => 'k' + i
      })

      virtualizer.measure(2, 50)
      virtualizer.measure(5, 80)
      virtualizer.setCount(3)

      // count 缩到 3 后，k5=80 应该被剪裁；measuredSum=50，count=1，
      // averageEstimate=50，未测项 k0/k1 使用平均值 50，k2 保留 50，
      // totalSize = 50 + 50 + 50 = 150。若未剪裁，averageEstimate=(50+80)/2=65，
      // totalSize 会变成 65+65+50 = 180，可直接区分。
      expect(virtualizer.getSnapshot().totalSize).toBe(150)
    })
  })

  describe('measureElement DOM 重排修复', () => {
    function withStubRO<T>(fn: () => T): T {
      const origRO = globalThis.ResizeObserver
      class StubRO {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      vi.stubGlobal('ResizeObserver', StubRO)
      try {
        return fn()
      } finally {
        if (origRO) {
          globalThis.ResizeObserver = origRO
        } else {
          // @ts-expect-error -- 清理测试 stub
          delete globalThis.ResizeObserver
        }
        vi.unstubAllGlobals()
      }
    }

    it('同一 element 迁移 index 时应清理旧 index 的 mounted 映射', () => {
      withStubRO(() => {
        const virtualizer = new Virtualizer({
          count: 10,
          estimateSize: () => 10,
          useMeasuredAverage: false,
          getItemKey: (i) => 'k' + i
        })
        const fakeEl = {} as Element

        virtualizer.measureElement(2, fakeEl)
        virtualizer.measureElement(5, fakeEl)

        virtualizer.measure(5, 42)

        expect(virtualizer.getItem(5).size).toBe(42)
        expect(virtualizer.getItem(2).size).toBe(10)

        virtualizer.setCount(3)
        expect(() => virtualizer.getItem(0)).not.toThrow()
      })
    })

    it('A 迁移后新元素 B 进入 A 旧 index 时，不应误 unobserve A', () => {
      // 真实触发场景：keyed 模式下同一行 DOM 节点 A 先被渲染到 index=2，
      // 随后因数据变化复用到 index=5；紧接着 index=2 来了另一节点 B。
      // 旧实现会在 measureElement(2, B) 里走 `current(=A) !== element(=B)`
      // 分支调用 tracker.unobserve(A)，把仍挂在 index=5 的 A 摘掉。
      //
      // 通过公开 API 验证：后续 measure(5, x) 与 measure(2, y) 分别走到
      // 对应的 key，说明 A 仍绑在 index=5（k5）、B 已挂在 index=2（k2）。
      withStubRO(() => {
        const virtualizer = new Virtualizer({
          count: 10,
          estimateSize: () => 10,
          useMeasuredAverage: false,
          getItemKey: (i) => 'k' + i
        })
        const A = { tag: 'A' } as unknown as Element
        const B = { tag: 'B' } as unknown as Element

        virtualizer.measureElement(2, A)
        virtualizer.measureElement(5, A)
        virtualizer.measureElement(2, B)

        virtualizer.measure(5, 42)
        virtualizer.measure(2, 99)

        expect(virtualizer.getItem(5).size).toBe(42)
        expect(virtualizer.getItem(2).size).toBe(99)

        // 清理路径也不应抛错：setCount 收缩覆盖 index=2，tracker 必须能
        // 找到 B 来 unobserve，而不是已被摘掉的 A 或 undefined。
        expect(() => virtualizer.setCount(2)).not.toThrow()
      })
    })
  })

  describe('getItemKey 切换语义', () => {
    it('keyed → non-keyed 回切应清空缓存（避免字符串 key 污染）', () => {
      const virtualizer = new Virtualizer({
        count: 3,
        estimateSize: () => 10,
        useMeasuredAverage: true,
        getItemKey: (i) => 'k' + i
      })

      virtualizer.measure(0, 200)
      virtualizer.measure(1, 300)
      // 此时 averageEstimate=(200+300)/2=250，未测 k2 估值 250，totalSize=750。
      expect(virtualizer.getSnapshot().totalSize).toBe(750)

      virtualizer.setOptions({ getItemKey: undefined })
      // 回切到 non-keyed 后，旧的 'k0'/'k1' 条目必须被清空 —— 否则它们仍会
      // 贡献 measuredSum/averageEstimate，而 keyOf(i)=i 查不到它们，所有项
      // 继续走被污染过的平均值估值；清空后全部按 estimateSize=10 计算。
      expect(virtualizer.getSnapshot().totalSize).toBe(30)
    })

    it('non-keyed → keyed 首次启用应清空缓存（index 空间切换为 key 空间）', () => {
      const virtualizer = new Virtualizer({
        count: 3,
        estimateSize: () => 10,
        useMeasuredAverage: true
      })

      virtualizer.measure(0, 200)
      virtualizer.measure(1, 300)
      expect(virtualizer.getSnapshot().totalSize).toBe(750)

      virtualizer.setOptions({ getItemKey: (i) => 'k' + i })
      expect(virtualizer.getSnapshot().totalSize).toBe(30)
    })

    it('keyed → keyed（函数身份切换）应保留旧 key 的测量值', () => {
      let mapping: readonly string[] = ['a', 'b', 'c']
      const virtualizer = new Virtualizer({
        count: 3,
        estimateSize: () => 10,
        useMeasuredAverage: false,
        getItemKey: (i) => mapping[i]!
      })
      virtualizer.measure(1, 40)

      // 切换函数引用（但 key 空间仍是字符串），'b' 的测量值应保留
      mapping = ['b', 'a', 'c']
      virtualizer.setOptions({ getItemKey: (i) => mapping[i]! })

      expect(virtualizer.getItem(0).size).toBe(40)
    })

    it('setOptions({ count, getItemKey }) 同轮更新应按新 key 空间剪裁缓存', () => {
      // plan-42 patch-2 修复目标：旧实现中 applyOptions 的 count 分支先于 getItemKey
      // 执行，pruneMeasured 会用**旧** getItemKey 构造 alive 集合，从而把新 key 空间下
      // 本应存活的测量条目误删。最小复现：k5 在新映射下仍存活于 index=2，但旧 key 空间
      // [0,3) = {k0,k1,k2} 不包含 k5，旧实现把 50 丢掉；新实现按新 getItemKey 构造
      // alive = {k0,k1,k5}，保留测量。
      const virtualizer = new Virtualizer({
        count: 10,
        estimateSize: () => 10,
        useMeasuredAverage: false,
        getItemKey: (i) => 'k' + i
      })

      virtualizer.measure(5, 50)

      virtualizer.setOptions({ count: 3, getItemKey: (i) => (['k0', 'k1', 'k5'] as const)[i]! })

      expect(virtualizer.getItem(2).size).toBe(50)
      expect(virtualizer.getItem(0).size).toBe(10)
    })
  })

  describe('smooth-scroll reconciliation', () => {
    function smoothMount(overrides: Partial<VirtualizerOptions> = {}) {
      const el = createScrollElement()
      const virtualizer = new Virtualizer({
        count: 100,
        estimateSize: () => 10,
        overscan: 0,
        useMeasuredAverage: false,
        ...overrides
      })
      virtualizer.mount(el as unknown as HTMLElement)
      return { el, virtualizer }
    }

    it('目标因测量漂移时，reconcile 应以 behavior: "auto" 跳到修正目标', () => {
      const { el, virtualizer } = smoothMount()

      virtualizer.scrollToIndex(50, { behavior: 'smooth' })
      // item 50.end = 510，viewportEnd = 120 → target = 510 - 120 = 390
      expect(el.scrollToArgs[0]).toMatchObject({ top: 390, behavior: 'smooth' })

      virtualizer.measureMany(Array.from({ length: 10 }, (_, i) => ({ index: i, size: 100 })))
      // 新 item 50.end = 10*100 + 40*10 + 10 = 1410 → target = 1410 - 120 = 1290
      el.flushRaf()

      expect(el.scrollToArgs.length).toBeGreaterThanOrEqual(2)
      expect(el.scrollToArgs[1]).toMatchObject({ top: 1290, behavior: 'auto' })
    })

    it('smooth 启动后不应预写 offset；由 scroll 事件驱动快照 offset', () => {
      const { el, virtualizer } = smoothMount()

      virtualizer.scrollToIndex(10, { behavior: 'smooth' })

      expect(virtualizer.getSnapshot().offset).toBe(0)

      el.scrollTop = 50
      el.emitScroll()

      expect(virtualizer.getSnapshot().offset).toBe(50)
    })

    it('用户反向滚动（距离 target 反向扩大）应终止 reconcile 循环', () => {
      const { el, virtualizer } = smoothMount()

      virtualizer.scrollToIndex(50, { behavior: 'smooth' })
      // target = 390
      expect(el.rafCount()).toBe(1)

      // 浏览器平滑推进：先到 200，再到 300，距离 target 单调递减
      el.scrollTop = 200
      el.emitScroll()
      el.scrollTop = 300
      el.emitScroll()
      expect(el.rafCount()).toBe(1)

      // 用户反向跳回 100：距离 target 从 90 扩大到 290 → 判定抢占
      el.scrollTop = 100
      el.emitScroll()

      expect(el.rafCount()).toBe(0)

      const callsBefore = el.scrollToCalls
      el.flushRaf()
      expect(el.scrollToCalls).toBe(callsBefore)
    })

    it('5 秒安全阀：超过阈值后 reconcile 应放弃校准', () => {
      const spy = vi.spyOn(performance, 'now')
      try {
        let fakeNow = 1000
        spy.mockImplementation(() => fakeNow)

        const { el, virtualizer } = smoothMount()
        virtualizer.scrollToIndex(50, { behavior: 'smooth' })

        expect(el.rafCount()).toBe(1)

        fakeNow = 6002
        el.flushRaf()

        expect(el.rafCount()).toBe(0)
        const callsBefore = el.scrollToCalls
        el.flushRaf()
        expect(el.scrollToCalls).toBe(callsBefore)
      } finally {
        spy.mockRestore()
      }
    })

    it('destroy 应立即取消 reconcile rAF，不再触发 scrollTo', () => {
      const { el, virtualizer } = smoothMount()
      virtualizer.scrollToIndex(50, { behavior: 'smooth' })

      expect(el.rafCount()).toBe(1)

      virtualizer.destroy()

      expect(el.rafCount()).toBe(0)
      const callsBefore = el.scrollToCalls
      el.flushRaf()
      expect(el.scrollToCalls).toBe(callsBefore)
    })
  })

  describe('批量测量 scroll adjustment', () => {
    it('同帧多条视口前方项测量应只写一次 DOM scrollTop', () => {
      const el = createScrollElement()
      const virtualizer = new Virtualizer({
        count: 100,
        estimateSize: () => 10,
        overscan: 0,
        useMeasuredAverage: false
      })
      virtualizer.mount(el as unknown as HTMLElement)

      // 滚到 offset=500，视口 [500, 620)；前方有 50 项（index 0..49）。
      el.scrollTop = 500
      el.emitScroll()

      // 基线：现在 scrollTop 已经被测试写入 1 次。清零再开始测量。
      el.scrollTopWrites = 0

      // 批量测量 10 条视口前方的项，旧值 10 → 新值 20，每条 delta=10；
      // 累积 delta=100，新 offset=600；DOM 只应被写入一次。
      virtualizer.measureMany(Array.from({ length: 10 }, (_, i) => ({ index: i, size: 20 })))

      expect(el.scrollTopWrites).toBe(1)
      expect(el.scrollTop).toBe(600)
      expect(virtualizer.getSnapshot().offset).toBe(600)
    })
  })
})
