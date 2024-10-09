import { isDate } from '../data/data-type'

type DateCompareReducer<R> = (year: number, month: number, day: number) => R

class Dater {
  constructor(date: number | string | Date | Dater) {
    if (date instanceof Dater) {
      this.date = date.date
    } else if (isDate(date)) {
      this.date = date
    } else {
      this.date = new Date(date)
    }
  }

  private date!: Date

  /** 原始日期对象 */
  get raw() {
    return this.date
  }

  private static matchers: Record<
    string,
    (date: Dater, len: number) => string
  > = {
    yyyy: date => `${date.year}`,
    YYYY: date => `${date.year}`,
    'M+': (date, len: number) => {
      let month = date.month + ''
      return len === 1 ? month : `0${month}`.slice(-2)
    },
    'd+': (date, len: number) => {
      let day = date.day + ''
      return len === 1 ? day : `0${day}`.slice(-2)
    },
    'D+': (date, len: number) => {
      let day = date.day + ''
      return len === 1 ? day : `0${day}`.slice(-2)
    },
    'h+': (date, len: number) => {
      let hour = date.hour
      let strHour = (hour > 12 ? hour - 12 : hour) + ''
      return len === 1 ? strHour : `0${strHour}`.slice(-2)
    },
    'H+': (date, len: number) => {
      let Hour = `${date.hour}`
      return len === 1 ? Hour : `0${Hour}`.slice(-2)
    },
    'm+': (date, len: number) => {
      let mih = `${date.minute}`
      return len === 1 ? mih : `0${mih}`.slice(-2)
    },
    's+': (date, len: number) => {
      let sec = `${date.second}`
      return len === 1 ? sec : `0${sec}`.slice(-2)
    }
  }

  /** 时间戳 */
  get timestamp() {
    return this.date.getTime()
  }

  setTime(timestamp: number) {
    this.date.setTime(timestamp)
    return this
  }

  /** 年 */
  get year() {
    return this.date.getFullYear()
  }

  /**
   * 设置年份
   * @param year 年份
   * @returns
   */
  setYear(year: number) {
    this.date.setFullYear(year)
    return this
  }

  /** 月 */
  get month() {
    return this.date.getMonth() + 1
  }

  /**
   * 设置月份
   * @param month 月份，从1开始
   * @returns
   */
  setMonth(month: number) {
    this.date.setMonth(month - 1)
    return this
  }

  /** 周 */
  get weekDay() {
    return this.date.getDay()
  }

  /** 日 */
  get day() {
    return this.date.getDate()
  }

  /**
   * 设置日
   * @param day 日, 如果为0则表示上个月的最后一天
   * @returns
   */
  setDay(day: number) {
    this.date.setDate(day)
    return this
  }

  /** 时 */
  get hour(): number {
    return this.date.getHours()
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
  setHours(hours: number) {
    this.date.setHours(hours)
    return this
  }

  /** 分 */
  get minute() {
    return this.date.getMinutes()
  }

  /** 分 */
  get minutes() {
    return this.date.getMinutes()
  }

  /**
   * 设置分
   * @param minutes 分
   */
  setMinutes(minutes: number) {
    this.date.setMinutes(minutes)
  }

  /** 秒 */
  get second() {
    return this.date.getSeconds()
  }
  /** 秒 */
  get seconds() {
    return this.date.getSeconds()
  }

  /**
   * 设置秒
   * @param sec 秒
   */
  setSeconds(sec: number) {
    this.date.setSeconds(sec)
  }

  static setMatcher(
    reg: string,
    matcher: (date: Dater, len: number) => string
  ) {
    Dater.matchers[reg] = matcher
  }

  static use(plugin: (dater: typeof Dater) => void) {
    plugin(Dater)
  }

  /** 获取所有的匹配器 */
  static getMatchers() {
    return Dater.matchers
  }

  /** 格式化日期 */
  format(formatter = 'yyyy-MM-dd'): string {
    Object.keys(Dater.matchers).forEach(reg => {
      formatter = formatter.replace(new RegExp(`(${reg})`), str => {
        return Dater.matchers[reg]!(this, str.length)
      })
    })
    return formatter
  }

  /**
   * 计算相对此刻的日期
   * @param timeStep 计算的日期, 负数表示之前的日期, 正数表示之后的日期
   * @param type 时间步长类别, 默认以天为单位
   */
  calc(timeStep: number, type?: 'days' | 'weeks' | 'months' | 'years'): Dater {
    let { date } = this
    if (type === 'days') {
      return new Dater(this.timestamp + timeStep * 86400000)
    } else if (type === 'weeks') {
      return new Dater(this.timestamp + timeStep * 604800000)
    } else if (type === 'months') {
      date = new Date(date.getTime())
      date.setMonth(timeStep + date.getMonth())
      return new Dater(date)
    } else {
      date = new Date(date.getTime())
      date.setFullYear(timeStep + date.getFullYear())
      return new Dater(date)
    }
  }

  /**
   *
   * @param date 日期
   * @param reducer 处理器
   * @returns
   */
  compare(date: string | Date | number | Dater): number
  compare<R>(
    date: string | Date | number | Dater,
    reducer: DateCompareReducer<R>
  ): R
  compare(
    date: string | Date | number | Dater,
    reducer?: DateCompareReducer<any>
  ) {
    let dater = new Dater(date)

    if (!reducer) {
      return Math.ceil(Math.abs(this.timestamp - dater.timestamp) / 86400000)
    }

    const year = Math.abs(this.year - dater.year)
    const month = Math.abs(this.month - dater.month)
    const day = Math.abs(this.day - dater.day)

    return reducer(year, month, day)
  }

  /**
   * 跳转至月尾
   * @param offsetMonth 月份偏移量，默认为0，即当月
   */
  toEndOfMonth(offsetMonth = 0) {
    this.date.setMonth(this.month + offsetMonth)
    this.date.setDate(0)

    return this
  }

  /**
   * 获取这个月的天数
   */
  getDays() {
    const { timestamp } = this
    const days = this.toEndOfMonth().day
    this.setTime(timestamp)
    return days
  }
}

interface DateFactory {
  (date?: number | string | Date): Dater
  /**
   * 虽然可以直接操作Dater的api，但可以使用插件机制来更好的组织你的代码
   * @param plugin 插件
   */
  use: (plugin: (dater: typeof Dater) => void) => void
  /** 获取所有的匹配器 */
  getMatchers: () => Record<string, (date: Dater, len: number) => string>
  /**
   * 设置匹配器，你可以新增或者覆盖原本的配器
   * @param reg 匹配器名称
   * @param matcher 匹配器
   */
  setMatcher: (
    reg: string,
    matcher: (date: Dater, len: number) => string
  ) => void

  /**
   * 根据格式化日期字符串得到日期
   * @param dateStr 格式化后的日期字符串
   * @param formatter 格式化字符串
   * @returns
   */
  from: (dateStr: string, formatter?: string) => Dater
}

export const date = <DateFactory>function (date) {
  return new Dater(date ?? new Date())
}

date.use = Dater.use

date.getMatchers = Dater.getMatchers

date.setMatcher = Dater.setMatcher

const getDateTypeStr = (str: string, formatter: string, re: RegExp): string => {
  let matched = formatter.match(re)

  if (matched) {
    return str.slice(matched.index!, matched.index! + matched[0].length)
  }
  return ''
}

date.from = function (dateStr: string, formatter = 'yyyy-MM-dd') {
  if (dateStr.length !== formatter.length) {
    console.warn('dateStr与formatter的格式不一致')
    return new Dater(dateStr)
  }

  // 年月日
  const YMD = [/(y|Y)+/, /M+/, /d+/]
    .map(re => getDateTypeStr(dateStr, formatter, re))
    .filter(item => !!item)
    .join('-')

  // 时分秒
  const HMS = [/(h|H)+/, /m+/, /s+/]
    .map(re => getDateTypeStr(dateStr, formatter, re))
    .filter(item => !!item)
    .join(':')

  dateStr = YMD + (HMS ? ` ${HMS}` : '')

  return new Dater(dateStr)
}

export type { Dater }
