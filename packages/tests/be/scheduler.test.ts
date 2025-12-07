import { CronExpression, Scheduler } from '@cat-kit/be/src'

describe('@cat-kit/be 调度器', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该解析 cron 表达式并找到下次执行时间', () => {
    const cron = new CronExpression('*/5 * * * *')
    const base = new Date('2024-01-01T00:00:00.000Z')
    const next = cron.getNextDate(base)
    expect(next).not.toBeNull()
    expect(next?.getUTCMinutes()).toBe(5)
  })

  it('应该在调度器运行时执行 cron 任务', async () => {
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

  it('应该支持一次性任务和间隔任务', async () => {
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

