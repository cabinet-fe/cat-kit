import { CronExpression } from './cron'

export type TaskFunction = () => void | Promise<void>

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

export interface TaskInfo {
  id: string
  type: TaskType
  nextRun?: Date
  running: boolean
}

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

  cancel(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task) return false

    if (task.timer) {
      clearTimeout(task.timer)
    }

    this.tasks.delete(id)
    return true
  }

  start(): void {
    if (this.running) return
    this.running = true

    for (const task of this.tasks.values()) {
      this.planTask(task)
    }
  }

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

