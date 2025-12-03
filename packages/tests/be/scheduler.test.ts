import { CronExpression, Scheduler } from '@cat-kit/be/src/scheduler'

describe('@cat-kit/be scheduler', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('parses cron expressions and finds next execution', () => {
    const cron = new CronExpression('*/5 * * * *')
    const base = new Date('2024-01-01T00:00:00.000Z')
    const next = cron.getNextDate(base)
    expect(next).not.toBeNull()
    expect(next?.getUTCMinutes()).toBe(5)
  })

  it('executes cron jobs when scheduler is running', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))

    const scheduler = new Scheduler()
    const task = vi.fn()
    scheduler.schedule('cron', '* * * * *', task)
    scheduler.start()

    vi.advanceTimersByTime(60_000)
    await Promise.resolve() // flush async task completion without draining future timers

    expect(task).toHaveBeenCalledTimes(1)
    scheduler.stop()
  })

  it('supports one-off and interval tasks', async () => {
    vi.useFakeTimers()
    const scheduler = new Scheduler()
    const once = vi.fn()
    const interval = vi.fn()

    scheduler.once('once', 100, once)
    scheduler.interval('interval', 200, interval)
    scheduler.start()

    vi.advanceTimersByTime(100)
    await vi.runOnlyPendingTimersAsync()
    expect(once).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(600)
    await vi.runOnlyPendingTimersAsync()
    expect(interval).toHaveBeenCalledTimes(3)

    scheduler.stop()
  })
})

