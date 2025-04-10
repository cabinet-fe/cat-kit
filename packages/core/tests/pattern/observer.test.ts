import { describe, expect, test, mock, spyOn } from 'bun:test'
import { Observable } from '../../src/pattern/observer'

describe('观察者模式测试', () => {
  describe('Observable', () => {
    test('应该能创建一个可观察对象', () => {
      const initialState = { count: 0, name: 'test' }
      const observable = new Observable(initialState)

      expect(observable.state).toEqual(initialState)
      // 确保state是响应式的，不是简单的引用
      expect(observable.state).not.toBe(initialState)
    })

    test('observe方法应该在属性变化时触发回调', () => {
      const initialState = { count: 0, name: 'test' }
      const observable = new Observable(initialState)
      const callback = mock(() => {})

      observable.observe(['count'], callback)

      // 修改被观察的属性
      observable.state.count = 1

      // 由于Observable可能使用了微任务来异步更新，我们需要等待一下
      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(callback).toHaveBeenCalledTimes(1)
          expect(callback).toHaveBeenCalledWith({ count: 1 })
          resolve()
        }, 10)
      })
    })

    test('immediate选项应该立即触发回调', () => {
      const initialState = { count: 0, name: 'test' }
      const observable = new Observable(initialState)
      const callback = mock(() => {})

      observable.observe(['count'], callback, { immediate: true })

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith({ count: 0 })
    })

    test('once选项应该只触发一次回调', () => {
      const initialState = { count: 0, name: 'test' }
      const observable = new Observable(initialState)
      const callback = mock(() => {})

      observable.observe(['count'], callback, { once: true })

      // 修改两次属性
      observable.state.count = 1

      return new Promise<void>(resolve => {
        setTimeout(() => {
          observable.state.count = 2

          setTimeout(() => {
            expect(callback).toHaveBeenCalledTimes(1)
            resolve()
          }, 10)
        }, 10)
      })
    })

    test('unobserve方法应该移除观察者', () => {
      const initialState = { count: 0, name: 'test' }
      const observable = new Observable(initialState)
      const callback = mock(() => {})

      observable.observe(['count'], callback)

      // 修改属性并等待回调被调用
      observable.state.count = 1

      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(callback).toHaveBeenCalledTimes(1)

          // 移除观察者
          observable.unobserve(['count'])

          // 再次修改属性
          observable.state.count = 2

          setTimeout(() => {
            // 回调不应该再次被调用
            expect(callback).toHaveBeenCalledTimes(1)
            resolve()
          }, 10)
        }, 10)
      })
    })

    test('destroyAll方法应该移除所有观察者', () => {
      const initialState = { count: 0, name: 'test' }
      const observable = new Observable(initialState)
      const callback1 = mock(() => {})
      const callback2 = mock(() => {})

      observable.observe(['count'], callback1)
      observable.observe(['name'], callback2)

      // 销毁所有观察者
      observable.destroyAll()

      // 修改属性
      observable.state.count = 1
      observable.state.name = 'updated'

      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(callback1).toHaveBeenCalledTimes(0)
          expect(callback2).toHaveBeenCalledTimes(0)
          resolve()
        }, 10)
      })
    })
  })
})
