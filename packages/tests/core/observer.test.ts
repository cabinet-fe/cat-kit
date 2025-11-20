import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Observable } from '@cat-kit/core/src'

interface TestState {
  count: number
  name: string
  flag: boolean
}

describe('Observable', () => {
  let observable: Observable<TestState, keyof TestState>
  let initialState: TestState

  beforeEach(() => {
    initialState = { count: 0, name: 'test', flag: false }
    observable = new Observable(initialState)
  })

  afterEach(() => {
    observable.destroyAll()
  })

  describe('基础功能', () => {
    it('应该创建可观察对象', () => {
      expect(observable).toBeDefined()
      expect(observable.getState()).toEqual(initialState)
    })

    it('应该允许修改状态', () => {
      observable.state.count = 5
      expect(observable.state.count).toBe(5)
    })

    it('应该通过 setState 批量更新状态', () => {
      observable.setState({ count: 10, name: 'updated' })
      expect(observable.state.count).toBe(10)
      expect(observable.state.name).toBe('updated')
    })
  })

  describe('观察功能', () => {
    it('应该观察单个属性变化', async () => {
      const callback = vi.fn()

      observable.observe(['count'], callback)
      observable.state.count = 5

      // 等待微任务执行
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(callback).toHaveBeenCalledWith([5])
    })

    it('应该观察多个属性变化', async () => {
      const callback = vi.fn()

      observable.observe(['count', 'name'], callback)
      observable.state.count = 10
      observable.state.name = 'changed'

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('应该支持 immediate 选项', () => {
      const callback = vi.fn()

      observable.observe(['count'], callback, { immediate: true })

      expect(callback).toHaveBeenCalledWith([0])
    })

    it('应该支持同步执行', () => {
      const callback = vi.fn()

      observable.observe(['count'], callback, { sync: true })
      observable.state.count = 15

      // 同步执行，不需要等待
      expect(callback).toHaveBeenCalledWith([15])
    })

    it('应该支持只执行一次', async () => {
      const callback = vi.fn()

      observable.observe(['count'], callback, { once: true })

      observable.state.count = 1
      observable.state.count = 2
      observable.state.count = 3

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith([1])
    })

    it('应该在值相同时不触发回调', async () => {
      const callback = vi.fn()

      observable.observe(['count'], callback)

      observable.state.count = 5
      observable.state.count = 5 // 相同值

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('取消观察', () => {
    it('应该能取消观察', async () => {
      const callback = vi.fn()

      const unobserve = observable.observe(['count'], callback)

      observable.state.count = 1
      unobserve()
      observable.state.count = 2

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith([1])
    })

    it('应该能取消特定属性的观察', async () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      observable.observe(['count'], callback1)
      observable.observe(['name'], callback2)

      observable.unobserve(['count'])

      observable.state.count = 5
      observable.state.name = 'changed'

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledWith(['changed'])
    })

    it('应该能销毁所有观察', async () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      observable.observe(['count'], callback1)
      observable.observe(['name'], callback2)

      observable.destroyAll()

      observable.state.count = 5
      observable.state.name = 'changed'

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })
  })

  describe('手动触发', () => {
    it('应该能手动触发属性变化', async () => {
      const callback = vi.fn()

      observable.observe(['count'], callback)
      observable.trigger('count')

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(callback).toHaveBeenCalledWith([0])
    })

    it('应该能同步执行多个属性变化', async () => {
      const callback = vi.fn()

      observable.observe(['count'], callback, { sync: true })

      observable.state.count = 5
      observable.state.count = 10

      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenNthCalledWith(1, [5])
      expect(callback).toHaveBeenNthCalledWith(2, [10])
    })
  })

  describe('错误处理', () => {
    it('应该处理回调中的错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const errorCallback = vi.fn(() => {
        throw new Error('Test error')
      })
      const normalCallback = vi.fn()

      observable.observe(['count'], errorCallback)
      observable.observe(['count'], normalCallback)

      observable.state.count = 5

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(consoleSpy).toHaveBeenCalled()
      expect(normalCallback).toHaveBeenCalledWith([5])

      consoleSpy.mockRestore()
    })
  })

  describe('类型安全', () => {
    it('应该提供正确的类型推断', () => {
      observable.observe(
        ['count', 'name'],
        values => {
          // TypeScript 应该能推断出 values 的类型
          expect(typeof values[0]).toBe('number')
          expect(typeof values[1]).toBe('string')
        },
        { immediate: true }
      )
    })

    it('应该限制只能观察存在的属性', () => {
      // 这个测试主要是为了确保 TypeScript 类型检查正常工作
      observable.observe(['count'], vi.fn())
      observable.observe(['name'], vi.fn())
      observable.observe(['flag'], vi.fn())

      // 以下代码在 TypeScript 中应该报错（但在运行时测试中不会报错）
      // observable.observe(['nonExistentProp'], vi.fn())
    })
  })
})
