import { isDate } from '../data/type'

const SECOND_IN_MS = 1000
const MINUTE_IN_MS = 60000
const HOUR_IN_MS = 3600000
const DAY_IN_MS = 86400000
const WEEK_IN_MS = 604800000

type DateInput = number | string | Date | Dater
type DateCompareReducer<R> = (timeDiff: number) => R
type FormatOptions = { utc?: boolean }
type DiffUnit =
  | 'milliseconds'
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'years'
type DiffOptions = { absolute?: boolean; float?: boolean }
type RangeInclusive = '()' | '[]' | '[)' | '(]'
type StartEndUnit = 'day' | 'week' | 'month' | 'year'

type ParsedDateParts = Partial<{
  year: number
  month: number
  day: number
  hours: number
  minutes: number
  seconds: number
}>

type DateParts = {
  year: number
  month: number
  day: number
  hours: number
  minutes: number
  seconds: number
}

const PARSE_TOKEN_REG =
  /(yyyy|YYYY|MM|M|dd|d|DD|D|HH|H|hh|h|mm|m|ss|s)/g

const PARSE_TOKEN_MAP: Record<
  string,
  { pattern: string; apply: (parts: ParsedDateParts, value: string) => void }
> = {
  yyyy: { pattern: '\\d{4}', apply: (parts, value) => (parts.year = +value) },
  YYYY: { pattern: '\\d{4}', apply: (parts, value) => (parts.year = +value) },
  MM: { pattern: '\\d{2}', apply: (parts, value) => (parts.month = +value) },
  M: { pattern: '\\d{1,2}', apply: (parts, value) => (parts.month = +value) },
  dd: { pattern: '\\d{2}', apply: (parts, value) => (parts.day = +value) },
  d: { pattern: '\\d{1,2}', apply: (parts, value) => (parts.day = +value) },
  DD: { pattern: '\\d{2}', apply: (parts, value) => (parts.day = +value) },
  D: { pattern: '\\d{1,2}', apply: (parts, value) => (parts.day = +value) },
  HH: {
    pattern: '\\d{2}',
    apply: (parts, value) => (parts.hours = +value)
  },
  H: {
    pattern: '\\d{1,2}',
    apply: (parts, value) => (parts.hours = +value)
  },
  hh: {
    pattern: '\\d{2}',
    apply: (parts, value) => (parts.hours = +value)
  },
  h: { pattern: '\\d{1,2}', apply: (parts, value) => (parts.hours = +value) },
  mm: {
    pattern: '\\d{2}',
    apply: (parts, value) => (parts.minutes = +value)
  },
  m: {
    pattern: '\\d{1,2}',
    apply: (parts, value) => (parts.minutes = +value)
  },
  ss: {
    pattern: '\\d{2}',
    apply: (parts, value) => (parts.seconds = +value)
  },
  s: { pattern: '\\d{1,2}', apply: (parts, value) => (parts.seconds = +value) }
}

const TWO_DIGIT_PAD = (value: number): string => `0${value}`.slice(-2)

export class Dater {
  private date!: Date

  constructor(date: DateInput) {
    const rawDate =
      date instanceof Dater ? date.raw : isDate(date) ? date : new Date(date)

    this.date = new Date(rawDate)
  }

  /** 原始日期对象 */
  get raw(): Date {
    return this.date
  }

  private static matchers: Record<
    string,
    (parts: DateParts, len: number) => string
  > = {
    yyyy: (parts: DateParts): string => `${parts.year}`,
    YYYY: (parts: DateParts): string => `${parts.year}`,
    'M+': (parts: DateParts, len: number): string => {
      const month = `${parts.month}`
      return len === 1 ? month : TWO_DIGIT_PAD(parts.month)
    },
    'd+': (parts: DateParts, len: number): string => {
      const day = `${parts.day}`
      return len === 1 ? day : TWO_DIGIT_PAD(parts.day)
    },
    'D+': (parts: DateParts, len: number): string => {
      const day = `${parts.day}`
      return len === 1 ? day : TWO_DIGIT_PAD(parts.day)
    },
    'h+': (parts: DateParts, len: number): string => {
      const hour12 = parts.hours % 12 || 12
      const strHour = `${hour12}`
      return len === 1 ? strHour : TWO_DIGIT_PAD(hour12)
    },
    'H+': (parts: DateParts, len: number): string => {
      const Hour = `${parts.hours}`
      return len === 1 ? Hour : TWO_DIGIT_PAD(parts.hours)
    },
    'm+': (parts: DateParts, len: number): string => {
      const mih = `${parts.minutes}`
      return len === 1 ? mih : TWO_DIGIT_PAD(parts.minutes)
    },
    's+': (parts: DateParts, len: number): string => {
      const sec = `${parts.seconds}`
      return len === 1 ? sec : TWO_DIGIT_PAD(parts.seconds)
    }
  }

  private getParts(useUTC = false): DateParts {
    const source = this.date
    if (useUTC) {
      return {
        year: source.getUTCFullYear(),
        month: source.getUTCMonth() + 1,
        day: source.getUTCDate(),
        hours: source.getUTCHours(),
        minutes: source.getUTCMinutes(),
        seconds: source.getUTCSeconds()
      }
    }

    return {
      year: this.year,
      month: this.month,
      day: this.day,
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds
    }
  }

  /** 时间戳 */
  get timestamp(): number {
    return this.date.getTime()
  }

  setTime(timestamp: number): Dater {
    this.date.setTime(timestamp)
    return this
  }

  /** 年 */
  get year(): number {
    return this.date.getFullYear()
  }

  /**
   * 设置年份
   * @param year 年份
   * @returns
   */
  setYear(year: number): Dater {
    this.date.setFullYear(year)
    return this
  }

  /** 月 */
  get month(): number {
    return this.date.getMonth() + 1
  }

  /**
   * 设置月份
   * @param month 月份，从1开始
   * @returns
   */
  setMonth(month: number): Dater {
    this.date.setMonth(month - 1)
    return this
  }

  /** 周 */
  get weekDay(): number {
    return this.date.getDay()
  }

  /** 日 */
  get day(): number {
    return this.date.getDate()
  }

  /**
   * 设置日
   * @param day 日, 如果为0则表示上个月的最后一天
   * @returns
   */
  setDay(day: number): Dater {
    this.date.setDate(day)
    return this
  }

  /** 时 */
  get hours(): number {
    return this.date.getHours()
  }

  /**
   * 设置小时
   * @param hours 时
   * @returns
   */
  setHours(hours: number): Dater {
    this.date.setHours(hours)
    return this
  }

  /** 分 */
  get minutes(): number {
    return this.date.getMinutes()
  }

  /**
   * 设置分
   * @param minutes 分
   */
  setMinutes(minutes: number): Dater {
    this.date.setMinutes(minutes)
    return this
  }

  /** 秒 */
  get seconds(): number {
    return this.date.getSeconds()
  }

  /**
   * 设置秒
   * @param sec 秒
   */
  setSeconds(sec: number): Dater {
    this.date.setSeconds(sec)
    return this
  }

  /** 克隆当前日期 */
  clone(): Dater {
    return new Dater(this.date)
  }

  /** 格式化日期 */
  format(formatter = 'yyyy-MM-dd', options?: FormatOptions): string {
    const parts = this.getParts(options?.utc)
    Object.keys(Dater.matchers).forEach((reg: string) => {
      formatter = formatter.replace(
        new RegExp(`(${reg})`, 'g'),
        (str: string) => {
          return Dater.matchers[reg]!(parts, str.length)
        }
      )
    })
    return formatter
  }

  /**
   * 计算相对此刻的日期
   * @param timeStep 计算的日期, 负数表示之前的日期, 正数表示之后的日期
   * @param type 时间步长类别, 默认以天为单位
   */
  calc(
    timeStep: number,
    type: 'days' | 'weeks' | 'months' | 'years' = 'days'
  ): Dater {
    let { date } = this

    if (type === 'days') {
      return new Dater(this.timestamp + timeStep * DAY_IN_MS)
    }
    if (type === 'weeks') {
      return new Dater(this.timestamp + timeStep * WEEK_IN_MS)
    }
    if (type === 'months') {
      date = new Date(date.getTime())
      date.setMonth(timeStep + date.getMonth())
      return new Dater(date)
    }

    date = new Date(date.getTime())
    date.setFullYear(timeStep + date.getFullYear())
    return new Dater(date)
  }

  /** 不可变加减封装 */
  addDays(days: number): Dater {
    return this.calc(days, 'days')
  }

  addWeeks(weeks: number): Dater {
    return this.calc(weeks, 'weeks')
  }

  addMonths(months: number): Dater {
    return this.calc(months, 'months')
  }

  addYears(years: number): Dater {
    return this.calc(years, 'years')
  }

  private resetTime(d: Dater): void {
    d.date.setHours(0, 0, 0, 0)
  }

  /**
   * 对齐到指定单位的开始
   * @param unit 单位: day/week/month/year
   */
  startOf(unit: StartEndUnit): Dater {
    const cloned = this.clone()
    switch (unit) {
      case 'day': {
        this.resetTime(cloned)
        return cloned
      }
      case 'week': {
        // 以周一为一周开始，与日历生成逻辑保持一致
        const offset = cloned.weekDay === 0 ? -6 : 1 - cloned.weekDay
        const start = cloned.addDays(offset)
        this.resetTime(start)
        return start
      }
      case 'month': {
        cloned.setDay(1)
        this.resetTime(cloned)
        return cloned
      }
      case 'year': {
        cloned.setMonth(1).setDay(1)
        this.resetTime(cloned)
        return cloned
      }
      default: {
        return cloned
      }
    }
  }

  /**
   * 对齐到指定单位的结束
   * @param unit 单位: day/week/month/year
   */
  endOf(unit: StartEndUnit): Dater {
    const start = this.startOf(unit)
    let boundary: Dater
    switch (unit) {
      case 'day':
        boundary = start.addDays(1)
        break
      case 'week':
        boundary = start.addWeeks(1)
        break
      case 'month':
        boundary = start.addMonths(1)
        break
      case 'year':
        boundary = start.addYears(1)
        break
      default:
        boundary = start.addDays(1)
    }

    return new Dater(boundary.timestamp - 1)
  }

  /**
   * 比较日期, 并返回天数差
   * @param date 日期
   * @returns 天数差
   */
  compare(date: DateInput): number
  /**
   * 比较日期, 返回自定义结果
   * @param date 日期
   * @param reducer 处理器
   * @returns 自定义结果
   */
  compare<R>(date: DateInput, reducer: DateCompareReducer<R>): R
  compare<R>(date: DateInput, reducer?: DateCompareReducer<R>): number | R {
    const dater = new Dater(date)

    // 计算时间差（毫秒）
    const timeDiff = this.timestamp - dater.timestamp

    if (!reducer) {
      const daysDiff = timeDiff / DAY_IN_MS
      const normalized = daysDiff > 0 ? Math.floor(daysDiff) : Math.ceil(daysDiff)

      return normalized === 0 ? 0 : normalized
    }

    return reducer(timeDiff)
  }

  /**
   * 计算差值
   * @param date 对比日期
   * @param unit 单位
   * @param options absolute 为 true 时返回绝对值, float 为 true 时返回小数（仅限毫秒-周）
   */
  diff(
    date: DateInput,
    unit: DiffUnit = 'milliseconds',
    options: DiffOptions = {}
  ): number {
    const target = new Dater(date)
    const timeDiff = this.timestamp - target.timestamp
    const { absolute = false, float = false } = options

    let result: number
    switch (unit) {
      case 'milliseconds':
        result = timeDiff
        break
      case 'seconds':
        result = timeDiff / SECOND_IN_MS
        break
      case 'minutes':
        result = timeDiff / MINUTE_IN_MS
        break
      case 'hours':
        result = timeDiff / HOUR_IN_MS
        break
      case 'days':
        result = timeDiff / DAY_IN_MS
        break
      case 'weeks':
        result = timeDiff / WEEK_IN_MS
        break
      case 'months':
        result = Dater.diffInCalendarMonths(this.date, target.raw)
        break
      case 'years':
        result = Dater.diffInCalendarYears(this.date, target.raw)
        break
      default:
        result = timeDiff
    }

    if (!float && unit !== 'months' && unit !== 'years') {
      result = Math.trunc(result)
    }

    return absolute ? Math.abs(result) : result
  }

  /**
   * 判断是否在区间内
   * @param start 开始日期
   * @param end 结束日期
   * @param options inclusive: '[]' 闭区间, '()' 开区间, '[)' 左闭右开, '(]' 左开右闭
   */
  isBetween(
    start: DateInput,
    end: DateInput,
    options: { inclusive?: RangeInclusive } = {}
  ): boolean {
    const startDater = new Dater(start)
    const endDater = new Dater(end)
    const inclusive = options.inclusive ?? '[]'

    const [startTime, endTime] =
      startDater.timestamp <= endDater.timestamp
        ? [startDater.timestamp, endDater.timestamp]
        : [endDater.timestamp, startDater.timestamp]

    const target = this.timestamp
    const left = inclusive[0] === '[' ? target >= startTime : target > startTime
    const right = inclusive[1] === ']' ? target <= endTime : target < endTime

    return left && right
  }

  isSameDay(date: DateInput): boolean {
    const target = new Dater(date)
    return (
      this.year === target.year &&
      this.month === target.month &&
      this.day === target.day
    )
  }

  isSameMonth(date: DateInput): boolean {
    const target = new Dater(date)
    return this.year === target.year && this.month === target.month
  }

  isSameYear(date: DateInput): boolean {
    const target = new Dater(date)
    return this.year === target.year
  }

  isWeekend(): boolean {
    return this.weekDay === 0 || this.weekDay === 6
  }

  isLeapYear(): boolean {
    const year = this.year
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  /**
   * 跳转至月尾
   * @param offsetMonth 月份偏移量，默认为0，即当月
   */
  toEndOfMonth(offsetMonth = 0): Dater {
    this.date.setMonth(this.month + offsetMonth)
    this.date.setDate(0)

    return this
  }

  /**
   * 获取这个月的天数
   */
  getDays(): number {
    const { timestamp } = this
    const days = this.toEndOfMonth().day
    this.setTime(timestamp)
    return days
  }

  private static diffInCalendarMonths(dateLeft: Date, dateRight: Date): number {
    const sign = Math.sign(
      dateLeft.getTime() - dateRight.getTime()
    ) as -1 | 0 | 1
    const yearsDiff = dateLeft.getFullYear() - dateRight.getFullYear()
    const monthsDiff = dateLeft.getMonth() - dateRight.getMonth()
    const result = yearsDiff * 12 + monthsDiff

    const anchor = new Date(dateRight.getTime())
    anchor.setMonth(anchor.getMonth() + result)

    if (anchor.getTime() > dateLeft.getTime() && result > 0) {
      return result - 1
    }
    if (anchor.getTime() < dateLeft.getTime() && result < 0) {
      return result + 1
    }

    if (anchor.getTime() === dateLeft.getTime()) {
      return result
    }

    // 处理跨月溢出时距离更近的情况
    const adjust = result - sign
    const adjustedAnchor = new Date(dateRight.getTime())
    adjustedAnchor.setMonth(adjustedAnchor.getMonth() + adjust)

    const anchorDiff = Math.abs(anchor.getTime() - dateLeft.getTime())
    const adjustedDiff = Math.abs(adjustedAnchor.getTime() - dateLeft.getTime())

    return adjustedDiff < anchorDiff ? adjust : result
  }

  private static diffInCalendarYears(dateLeft: Date, dateRight: Date): number {
    const months = this.diffInCalendarMonths(dateLeft, dateRight)
    return Math.trunc(months / 12)
  }

  private static escapeReg(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  private static parseByFormat(
    value: string,
    format: string,
    useUTC: boolean
  ): Date {
    PARSE_TOKEN_REG.lastIndex = 0
    let lastIndex = 0
    const tokens: string[] = []
    let pattern = ''
    let match: RegExpExecArray | null

    while ((match = PARSE_TOKEN_REG.exec(format))) {
      const token = match[0]
      const start = match.index

      if (start > lastIndex) {
        pattern += this.escapeReg(format.slice(lastIndex, start))
      }

      tokens.push(token)
      pattern += `(${PARSE_TOKEN_MAP[token]!.pattern})`
      lastIndex = start + token.length
    }

    if (lastIndex < format.length) {
      pattern += this.escapeReg(format.slice(lastIndex))
    }

    const reg = new RegExp(`^${pattern}$`)
    const execResult = reg.exec(value)
    if (!execResult) {
      return new Date(NaN)
    }

    const parsed: ParsedDateParts = {}
    tokens.forEach((token, index) => {
      PARSE_TOKEN_MAP[token]!.apply(parsed, execResult[index + 1]!)
    })

    const year = parsed.year ?? new Date().getFullYear()
    const month = (parsed.month ?? 1) - 1
    const day = parsed.day ?? 1
    const hours = parsed.hours ?? 0
    const minutes = parsed.minutes ?? 0
    const seconds = parsed.seconds ?? 0

    if (
      month < 0 ||
      month > 11 ||
      day < 1 ||
      day > 31 ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return new Date(NaN)
    }

    const result = useUTC
      ? new Date(Date.UTC(year, month, day, hours, minutes, seconds))
      : new Date(year, month, day, hours, minutes, seconds)

    if (
      useUTC
        ? result.getUTCFullYear() !== year ||
          result.getUTCMonth() !== month ||
          result.getUTCDate() !== day
        : result.getFullYear() !== year ||
          result.getMonth() !== month ||
          result.getDate() !== day
    ) {
      return new Date(NaN)
    }

    return result
  }

  /**
   * 解析日期字符串
   * @param value 输入字符串
   * @param format 可选格式化模板（使用 format 支持的占位符）
   * @param options utc: 是否按 UTC 解析
   */
  static parse(value: string, format?: string, options?: FormatOptions): Dater {
    if (!format) {
      return new Dater(value)
    }

    const date = this.parseByFormat(value, format, options?.utc ?? false)
    return new Dater(date)
  }
}

/** 日期 */
export function date(d?: DateInput): Dater {
  return new Dater(d ?? new Date())
}
