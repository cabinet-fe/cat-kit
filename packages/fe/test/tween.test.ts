import { Tween, tweenEasings, type TweenScheduler } from '@cat-kit/fe/src'

function createScheduler(): {
  scheduler: TweenScheduler
  step: (delta: number) => void
} {
  let now = 0
  let handle = 0
  let frame: FrameRequestCallback | null = null

  return {
    scheduler: {
      now: () => now,
      requestFrame: (callback) => {
        frame = callback
        handle += 1
        return handle
      },
      cancelFrame: () => {
        frame = null
      }
    },
    step: (delta) => {
      now += delta
      const current = frame
      frame = null
      current?.(now)
    }
  }
}

describe('Tween', () => {
  it('应该按时间推进数值并在结束时完成', () => {
    const { scheduler, step } = createScheduler()
    const values: number[] = []

    const tween = new Tween({
      from: 0,
      to: 100,
      duration: 100,
      scheduler,
      onUpdate: ({ value }) => values.push(Math.round(value))
    })

    tween.play()
    step(50)
    step(50)

    expect(values).toEqual([50, 100])
    expect(tween.getValue()).toBe(100)
    expect(tween.getState()).toBe('finished')
  })

  it('pause 与 resume 应该保留当前进度', () => {
    const { scheduler, step } = createScheduler()
    const tween = new Tween({
      from: 0,
      to: 10,
      duration: 100,
      scheduler
    })

    tween.play()
    step(40)
    tween.pause()

    const pausedValue = tween.getValue()
    step(40)
    expect(tween.getValue()).toBe(pausedValue)

    tween.resume()
    step(30)
    step(30)

    expect(tween.getValue()).toBe(10)
    expect(tween.getState()).toBe('finished')
  })

  it('应该支持 seek、reset 与 cancel', () => {
    const { scheduler } = createScheduler()
    const states: string[] = []

    const tween = new Tween({
      from: 10,
      to: 30,
      scheduler,
      onCancel: ({ state }) => states.push(state)
    })

    tween.seek(0.25)
    expect(tween.getValue()).toBe(15)

    tween.cancel()
    expect(states).toEqual(['cancelled'])

    tween.reset()
    expect(tween.getValue()).toBe(10)
    expect(tween.getState()).toBe('idle')
  })

  it('应该支持 easing 函数', () => {
    const { scheduler, step } = createScheduler()
    let lastValue = 0

    const tween = new Tween({
      from: 0,
      to: 1,
      duration: 100,
      easing: tweenEasings.easeInQuad,
      scheduler,
      onUpdate: ({ value }) => {
        lastValue = value
      }
    })

    tween.play()
    step(50)

    expect(lastValue).toBe(0.25)
  })
})
