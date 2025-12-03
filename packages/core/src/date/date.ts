import { isDate } from '../data/type'

const DAY_IN_MS = 86400000
const WEEK_IN_MS = 604800000

type DateCompareReducer<R> = (timeDiff: number) => R

export class Dater {
  private date!: Date

  constructor(date: number | string | Date | Dater) {
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
    (date: Dater, len: number) => string
  > = {
    yyyy: (date: Dater): string => `${date.year}`,
    YYYY: (date: Dater): string => `${date.year}`,
    'M+': (date: Dater, len: number): string => {
      let month = date.month + ''
      return len === 1 ? month : `0${month}`.slice(-2)
    },
    'd+': (date: Dater, len: number): string => {
      let day = date.day + ''
      return len === 1 ? day : `0${day}`.slice(-2)
    },
    'D+': (date: Dater, len: number): string => {
      let day = date.day + ''
      return len === 1 ? day : `0${day}`.slice(-2)
    },
    'h+': (date: Dater, len: number): string => {
      let hour = date.hours
      let hour12 = hour % 12 || 12
      let strHour = `${hour12}`
      return len === 1 ? strHour : `0${strHour}`.slice(-2)
    },
    'H+': (date: Dater, len: number): string => {
      let Hour = `${date.hours}`
      return len === 1 ? Hour : `0${Hour}`.slice(-2)
    },
    'm+': (date: Dater, len: number): string => {
      let mih = `${date.minutes}`
      return len === 1 ? mih : `0${mih}`.slice(-2)
    },
    's+': (date: Dater, len: number): string => {
      let sec = `${date.seconds}`
      return len === 1 ? sec : `0${sec}`.slice(-2)
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

  /** 格式化日期 */
  format(formatter = 'yyyy-MM-dd'): string {
    Object.keys(Dater.matchers).forEach((reg: string) => {
      formatter = formatter.replace(
        new RegExp(`(${reg})`, 'g'),
        (str: string) => {
          return Dater.matchers[reg]!(this, str.length)
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

  /**
   * 比较日期, 并返回天数差
   * @param date 日期
   * @returns 天数差
   */
  compare(date: string | Date | number | Dater): number
  /**
   * 比较日期, 返回自定义结果
   * @param date 日期
   * @param reducer 处理器
   * @returns 自定义结果
   */
  compare<R>(
    date: string | Date | number | Dater,
    reducer: DateCompareReducer<R>
  ): R
  compare<R>(
    date: string | Date | number | Dater,
    reducer?: DateCompareReducer<R>
  ): number | R {
    let dater = new Dater(date)

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
}

/** 日期 */
export function date(d?: number | string | Date | Dater): Dater {
  return new Dater(d ?? new Date())
}
