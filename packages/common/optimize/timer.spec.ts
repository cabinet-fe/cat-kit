import { debounce, throttle } from './timer'

describe('定时器优化', () => {
  test('抖动测试', () => {
    let count = 0
    const fn = () => {
      count += 1
    }

    const debounceFn = debounce(fn, 300)
    const debounceFnWithoutImmediate = debounce(fn, 300, false)

    debounceFnWithoutImmediate()
    expect(count).toBe(0)
    debounceFn()
    expect(count).toBe(1)
    setTimeout(() => {
      expect(count).toBe(2)
    }, 300)
  })

  test('节流测试', async () => {
    const sleep = (time = 300) => {
      return new Promise<true>(resolve => {
        setTimeout(() => resolve(true), time)
      })
    }

    let count = 0
    const fn = throttle(() => {
      count += 1
    }, 300)

    fn()
    fn()
    // count: 0

    await sleep()

    fn()
    fn()
    // count: 1

    await sleep()

    fn()
    // count: 2

    expect(count).toBe(2)

    await sleep()

    fn()
    fn()
    // count: 3

    expect(count).toBe(3)
  })
})
