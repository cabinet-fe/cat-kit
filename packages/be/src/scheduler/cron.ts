/**
 * Cron 字段配置
 */
export interface CronFieldConfig {
  /** 最小值 */
  min: number
  /** 最大值 */
  max: number
}

const FIELD_CONFIGS: CronFieldConfig[] = [
  { min: 0, max: 59 }, // minute
  { min: 0, max: 23 }, // hour
  { min: 1, max: 31 }, // day of month
  { min: 1, max: 12 }, // month
  { min: 0, max: 6 } // day of week
]

const MAX_ITERATIONS = 100000

function parsePart(value: string, { min, max }: CronFieldConfig): number[] {
  if (value === '*' || value === '?') {
    return Array.from({ length: max - min + 1 }, (_, i) => i + min)
  }

  return value.split(',').flatMap(part => parseSegment(part, min, max))
}

function parseSegment(segment: string, min: number, max: number): number[] {
  const [rangePart, stepPart] = segment.split('/')
  const step = stepPart ? parseInt(stepPart, 10) : 1

  if (Number.isNaN(step) || step <= 0) {
    throw new Error(`Invalid cron step "${segment}"`)
  }

  if (rangePart.includes('-')) {
    const [startStr, endStr] = rangePart.split('-')
    const start = parseInt(startStr, 10)
    const end = parseInt(endStr, 10)

    if (Number.isNaN(start) || Number.isNaN(end)) {
      throw new Error(`Invalid cron range "${segment}"`)
    }

    if (start > end) {
      throw new Error(`Cron range start greater than end "${segment}"`)
    }

    return buildRange(start, end, min, max, step)
  }

  if (rangePart === '*') {
    return buildRange(min, max, min, max, step)
  }

  const value = parseInt(rangePart, 10)
  if (Number.isNaN(value)) {
    throw new Error(`Invalid cron value "${segment}"`)
  }

  return buildRange(value, value, min, max, step)
}

function buildRange(
  start: number,
  end: number,
  min: number,
  max: number,
  step: number
): number[] {
  if (start < min || end > max) {
    throw new Error(`Cron value out of range: ${start}-${end}`)
  }

  const values: number[] = []
  for (let value = start; value <= end; value += step) {
    values.push(value)
  }

  return values
}

/**
 * Cron 表达式解析器
 *
 * 支持标准的 5 位 Cron 表达式格式：`分钟 小时 日 月 星期`
 *
 * @example
 * ```typescript
 * const cron = new CronExpression('0 2 * * *') // 每天凌晨 2 点
 * const next = cron.getNextDate() // 获取下次执行时间
 *
 * // 支持范围、步长和列表
 * const cron2 = new CronExpression('0 9-17 * * 1-5') // 工作日上午 9 点到下午 5 点
 * const cron3 = new CronExpression('*\/5 * * * *') // 每 5 分钟
 * ```
 */
export class CronExpression {
  private readonly minutes: Set<number>

  private readonly hours: Set<number>

  private readonly days: Set<number>

  private readonly months: Set<number>

  private readonly weekdays: Set<number>

  /**
   * 创建 Cron 表达式实例
   *
   * @param expression - 5 位 Cron 表达式字符串
   * @throws {Error} 当表达式格式不正确时抛出错误
   */
  constructor(expression: string) {
    const parts = expression.trim().split(/\s+/)
    if (parts.length !== 5) {
      throw new Error('Cron expression must have 5 parts')
    }

    this.minutes = new Set(parsePart(parts[0]!, FIELD_CONFIGS[0]!))
    this.hours = new Set(parsePart(parts[1]!, FIELD_CONFIGS[1]!))
    this.days = new Set(parsePart(parts[2]!, FIELD_CONFIGS[2]!))
    this.months = new Set(parsePart(parts[3]!, FIELD_CONFIGS[3]!))
    this.weekdays = new Set(parsePart(parts[4]!, FIELD_CONFIGS[4]!))
  }

  /**
   * 获取下一次执行时间
   *
   * @param from - 起始时间，默认使用当前时间
   * @returns 下一次执行时间，如果无法找到则返回 `null`
   */
  getNextDate(from = new Date()): Date | null {
    const next = new Date(from.getTime())
    next.setSeconds(0, 0)
    next.setMinutes(next.getMinutes() + 1)

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const minute = next.getMinutes()
      const hour = next.getHours()
      const day = next.getDate()
      const month = next.getMonth() + 1
      const weekday = next.getDay()

      if (
        this.minutes.has(minute) &&
        this.hours.has(hour) &&
        this.days.has(day) &&
        this.months.has(month) &&
        this.weekdays.has(weekday)
      ) {
        return new Date(next)
      }

      next.setMinutes(next.getMinutes() + 1)
    }

    return null
  }
}

/**
 * 解析 Cron 表达式
 *
 * 便捷函数，等同于 `new CronExpression(expression)`。
 *
 * @param expression - 5 位 Cron 表达式字符串
 * @returns CronExpression 实例
 * @throws {Error} 当表达式格式不正确时抛出错误
 */
export function parseCron(expression: string): CronExpression {
  return new CronExpression(expression)
}
