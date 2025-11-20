import { describe, it, expect, vi } from 'vitest'
import { debounce, throttle, sleep } from '@cat-kit/core/src'

describe('定时器工具函数', () => {
  describe('debounce', () => {
    it('应该延迟执行函数', async () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100, false)

      debounced()
      expect(fn).not.toHaveBeenCalled()

      await sleep(150)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在 immediate=true 时立即执行', async () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100, true)

      debounced()
      expect(fn).toHaveBeenCalledTimes(1)

      await sleep(150)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该传递正确的参数', async () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100, false)

      debounced('arg1', 'arg2')
      await sleep(150)

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('throttle', () => {
    it('应该在指定时间内只执行一次', async () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled()
      expect(fn).toHaveBeenCalledTimes(1)

      throttled()
      throttled()
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在延迟后可以再次执行', async () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled()
      expect(fn).toHaveBeenCalledTimes(1)

      await sleep(150)
      throttled()
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('应该调用回调函数', () => {
      const fn = vi.fn(() => 'result')
      const callback = vi.fn()
      const throttled = throttle(fn, 100, callback)

      throttled()
      expect(callback).toHaveBeenCalledWith('result')
    })

    it('应该返回函数结果', () => {
      const fn = vi.fn(() => 'result')
      const throttled = throttle(fn, 100)

      const result = throttled()
      expect(result).toBe('result')
    })
  })

  describe('sleep', () => {
    it('应该等待指定的时间', async () => {
      const start = Date.now()
      await sleep(100)
      const end = Date.now()

      expect(end - start).toBeGreaterThanOrEqual(95) // 允许一些误差
    })
  })
})
