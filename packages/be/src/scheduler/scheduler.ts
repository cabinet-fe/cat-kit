import { CronExpression } from './cron'

/**
 * 任务函数类型
 */
export type TaskFunction = () => void | Promise<void>

/**
 * 任务类型
 */
type TaskType = 'cron' | 'timeout' | 'interval'

interface SchedulerTaskBase {
  id: string
  type: TaskType
  task: TaskFunction
  timer?: ReturnType<typeof setTimeout>
  nextRun?: Date
  running: boolean
}

interface CronTask extends SchedulerTaskBase {
  type: 'cron'
  expression: CronExpression
}

interface TimeoutTask extends SchedulerTaskBase {
  type: 'timeout'
  delay: number
  executed: boolean
}

interface IntervalTask extends SchedulerTaskBase {
  type: 'interval'
  interval: number
}

type SchedulerTask = CronTask | TimeoutTask | IntervalTask

/**
 * 任务信息
 */
export interface TaskInfo {
  /** 任务 ID */
  id: string
  /** 任务类型 */
  type: TaskType
  /** 下次执行时间 */
  nextRun?: Date
  /** 是否正在运行 */
  running: boolean
}

/**
 * 任务调度器
 *
 * 支持 Cron 表达式、延迟执行和定时执行三种任务类型。
 *
 * @example
 * ```typescript
 * const scheduler = new Scheduler()
 *
 * // Cron 任务
 * scheduler.schedule('backup', '0 2 * * *', async () => {
 *   await backupDatabase()
 * })
 *
 * // 延迟执行
 * scheduler.once('cleanup', 3600000, () => {
 *   cleanupTempFiles()
 * })
 *
 * // 定时执行
 * scheduler.interval('heartbeat', 30000, () => {
 *   sendHeartbeat()
 * })
 *
 * scheduler.start()
 * ```
 */
export class Scheduler {
  private readonly tasks = new Map<string, SchedulerTask>()

  private running = false

  schedule(id: string, cron: string | CronExpression, task: TaskFunction): void {
    const expression = typeof cron === 'string' ? new CronExpression(cron) : cron
    this.addTask({
      id,
      type: 'cron',
      task,
      expression,
      running: false
    })
  }

  /**
   * 调度延迟执行任务（只执行一次）
   *
   * @param id - 任务唯一标识
   * @param delay - 延迟时间（毫秒）
   * @param task - 要执行的任务函数
   * @throws {Error} 当 delay 小于 0 时抛出错误
   */
  once(id: string, delay: number, task: TaskFunction): void {
    if (delay < 0) {
      throw new Error('Delay must be greater than or equal to 0')
    }

    this.addTask({
      id,
      type: 'timeout',
      task,
      delay,
      executed: false,
      running: false
    })
  }

  /**
   * 调度定时执行任务（重复执行）
   *
   * @param id - 任务唯一标识
   * @param interval - 执行间隔（毫秒）
   * @param task - 要执行的任务函数
   * @throws {Error} 当 interval 小于等于 0 时抛出错误
   */
  interval(id: string, interval: number, task: TaskFunction): void {
    if (interval <= 0) {
      throw new Error('Interval must be greater than 0')
    }

    this.addTask({
      id,
      type: 'interval',
      task,
      interval,
      running: false
    })
  }

  /**
   * 取消任务
   *
   * @param id - 任务 ID
   * @returns 如果任务存在并成功取消返回 `true`，否则返回 `false`
   */
  cancel(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task) return false

    if (task.timer) {
      clearTimeout(task.timer)
    }

    this.tasks.delete(id)
    return true
  }

  /**
   * 启动调度器
   *
   * 开始执行所有已添加的任务。如果调度器已经在运行，则不会重复启动。
   */
  start(): void {
    if (this.running) return
    this.running = true

    for (const task of this.tasks.values()) {
      this.planTask(task)
    }
  }

  /**
   * 停止调度器
   *
   * 停止所有任务的执行，但不会删除任务。可以再次调用 `start()` 恢复执行。
   */
  stop(): void {
    if (!this.running) return
    this.running = false

    for (const task of this.tasks.values()) {
      if (task.timer) {
        clearTimeout(task.timer)
        task.timer = undefined
      }
    }
  }

  /**
   * 获取指定任务的信息
   *
   * @param id - 任务 ID
   * @returns 任务信息，如果任务不存在返回 `undefined`
   */
  getTask(id: string): TaskInfo | undefined {
    const task = this.tasks.get(id)
    if (!task) return undefined

    return {
      id: task.id,
      type: task.type,
      nextRun: task.nextRun,
      running: task.running
    }
  }

  /**
   * 获取所有任务的信息
   *
   * @returns 所有任务的信息数组
   */
  getTasks(): TaskInfo[] {
    return Array.from(this.tasks.values()).map(task => ({
      id: task.id,
      type: task.type,
      nextRun: task.nextRun,
      running: task.running
    }))
  }

  private addTask(task: SchedulerTask): void {
    if (this.tasks.has(task.id)) {
      throw new Error(`Task "${task.id}" already exists`)
    }

    this.tasks.set(task.id, task)
    if (this.running) {
      this.planTask(task)
    }
  }

  private planTask(task: SchedulerTask): void {
    if (!this.running) return

    switch (task.type) {
      case 'cron':
        this.planCronTask(task)
        break
      case 'timeout':
        this.planTimeoutTask(task)
        break
      case 'interval':
        this.planIntervalTask(task)
        break
    }
  }

  private planCronTask(task: CronTask): void {
    const nextRun = task.expression.getNextDate(new Date())
    if (!nextRun) return

    const delay = Math.max(nextRun.getTime() - Date.now(), 0)
    task.nextRun = nextRun

    task.timer = setTimeout(async () => {
      await this.executeTask(task)
      this.planCronTask(task)
    }, delay)
    task.timer.unref?.()
  }

  private planTimeoutTask(task: TimeoutTask): void {
    if (task.executed) return

    task.nextRun = new Date(Date.now() + task.delay)
    task.timer = setTimeout(async () => {
      await this.executeTask(task)
      task.executed = true
      this.tasks.delete(task.id)
    }, task.delay)
  }

  private planIntervalTask(task: IntervalTask): void {
    const scheduleNext = (): void => {
      task.nextRun = new Date(Date.now() + task.interval)
      task.timer = setTimeout(async () => {
        await this.executeTask(task)
        if (this.running) {
          scheduleNext()
        }
      }, task.interval)
    }

    scheduleNext()
  }

  private async executeTask(task: SchedulerTaskBase): Promise<void> {
    task.running = true
    try {
      await task.task()
    } catch (error) {
      console.error(`Scheduler task "${task.id}" failed`, error)
    } finally {
      task.running = false
    }
  }
}

