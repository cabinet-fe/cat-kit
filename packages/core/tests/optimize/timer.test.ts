import { describe, expect, test, mock, spyOn } from 'bun:test'
import { debounce } from '../../src/optimize/timer'

describe('定时器工具函数测试', () => {
  describe('debounce', () => {
    test('应该在首次调用时立即执行函数（默认immediate=true）', () => {
      const mockFn = mock(() => {})
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('在延迟时间内多次调用时应该只执行一次', async () => {
      const mockFn = mock(() => {})
      const debouncedFn = debounce(mockFn, 50)

      debouncedFn() // 立即执行一次
      debouncedFn()
      debouncedFn()

      expect(mockFn).toHaveBeenCalledTimes(1) // 只执行了一次

      // 等待延迟时间过后
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockFn).toHaveBeenCalledTimes(2) // 延迟时间后又执行了一次
    })

    test('设置immediate=false时应该延迟执行函数', async () => {
      const mockFn = mock(() => {})
      const debouncedFn = debounce(mockFn, 50, false)

      debouncedFn()
      expect(mockFn).toHaveBeenCalledTimes(0) // 立即执行模式关闭，还未执行

      // 等待延迟时间过后
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockFn).toHaveBeenCalledTimes(1) // 延迟后执行
    })

    test('应该可以正确传递参数和上下文', () => {
      const obj = { value: 42 }
      const mockFn = mock(function (this: typeof obj, num: number) {
        return this.value + num
      })

      const spy = spyOn(mockFn)
      const debouncedFn = debounce(mockFn, 50)

      debouncedFn.call(obj, 8)

      expect(spy).toHaveBeenCalledWith(8)
      expect(spy.mock.calls[0].thisValue).toBe(obj)
    })
  })
})
