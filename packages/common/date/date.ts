import { isDate } from "../data/data-type"

type DateKey = 'timestamp' | 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

type PrivateDateKey = `_${DateKey}`

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

  private static matchers: Record<string, (date: Date, len: number) => string> = {
    yyyy: (date: Date) => date.getFullYear() + '',
    'M+': (date: Date, len: number) => {
      let month = `${date.getMonth() + 1}`
      return len === 1 ? month : `0${month}`.slice(-2)
    },
    'd+': (date: Date, len: number) => {
      let day = date.getDate() + ''
      return len === 1 ? day : `0${day}`.slice(-2)
    },
    'h+': (date: Date, len: number) => {
      let hour = date.getHours()
      let strHour = (hour > 12 ? hour - 12 : hour) + ''
      return len === 1 ? strHour : `0${strHour}`.slice(-2)
    },
    'H+': (date: Date, len: number) => {
      let Hour = `${date.getHours()}`
      return len === 1 ? Hour : `0${Hour}`.slice(-2)
    },
    'm+': (date: Date, len: number) => {
      let mih = `${date.getMinutes()}`
      return len === 1 ? mih : `0${mih}`.slice(-2)
    },
    's+': (date: Date, len: number) => {
      let sec = `${date.getSeconds()}`
      return len === 1 ? sec : `0${sec}`.slice(-2)
    }
  }

  /**
   * 返回私有属性
   * @param key 私有属性
   * @param value 默认值
   * @returns
   */
  private _get(key: PrivateDateKey, value: number) {
    let v = this[key]
    if (v) return v
    this[key] = value
    return value
  }

  private _timestamp?: number

  /** 时间戳 */
  get timestamp() {
    return this._get('_timestamp', this.date.getTime())
  }

  private _year?: number
  /** 年 */
  get year() {
    return this._get('_year', this.date.getFullYear())
  }

  private _month?: number
  /** 月 */
  get month() {
    return this._get('_month', this.date.getMonth() + 1)
  }

  private _day?: number
  /** 日 */
  get day() {
    return this._get('_day', this.date.getDate())
  }

  private _hour?: number
  /** 时 */
  get hour() {
    return this._get('_hour', this.date.getHours())
  }

  private _minute?: number
  /** 分 */
  get minute() {
    return this._get('_minute', this.date.getMinutes())
  }

  private _second?: number
  /** 秒 */
  get second() {
    return this._get('_second', this.date.getSeconds())
  }

  static setMatcher(reg: string, matcher: (date: Date, len: number) => string) {
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
  format(formatter = 'yyyy-MM-dd') {
    Object.keys(Dater.matchers).forEach(reg => {
      formatter = formatter.replace(new RegExp(`(${reg})`), str => {
        return Dater.matchers[reg](this.date, str.length)
      })
    })
    return formatter
  }

  /**
   * 计算相对此刻的日期
   * @param timeStep 计算的日期, 负数表示之前的日期, 正数表示之后的日期
   * @param type 时间步长类别, 默认以天为单位
   */
  calc(timeStep: number, type?: 'days' | 'weeks' | 'months' | 'years') {
    const { date } = this
    if (type === 'days') {
      return new Dater(this.timestamp + timeStep * 86400000)
    } else if (type === 'weeks') {
      return new Dater(this.timestamp + timeStep * 604800000)
    } else if (type === 'months') {
      date.setMonth(timeStep + date.getMonth())
      return new Dater(date.getTime())
    } else {
      date.setFullYear(timeStep + date.getFullYear())
      return new Dater(date.getTime())
    }
  }

  /**
   * 比较日期获取日期差
   */
  compare(date: string | Date | number | Dater) {
    return Math.ceil(Math.abs(this.timestamp - new Dater(date).timestamp) / 86400000)
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
  getMatchers: () => Record<string, (date: Date, len: number) => string>
  /**
   * 设置匹配器，你可以新增或者覆盖原本的配器
   * @param reg 匹配器名称
   * @param matcher 匹配器
   */
  setMatcher: (reg: string, matcher: (date: Date, len: number) => string) => void
}

export const date = <DateFactory>function (date) {
  return new Dater(date ?? new Date())
}

date.use = Dater.use

date.getMatchers = Dater.getMatchers

date.setMatcher = Dater.setMatcher

export type { Dater }