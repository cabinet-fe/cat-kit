/**
 * 数字包装类，提供链式调用
 */

import { formatCurrency, toFixed, type CurrencyConfig } from './format'

type CurrencyType = 'CNY' | 'CNY_HAN'

export class Num {
  private v: number

  constructor(n: number) {
    this.v = n
  }

  /**
   * 数字转货币
   * @param currencyType 货币类型 CNY人民币 CNY_HAN 人民币中文大写
   * @param config 其他配置, 仅precision对CNY_HAN生效
   * @returns 格式化后的货币字符串
   * @example n(1234.56).currency('CNY') // '1,234.56'
   */
  currency(currencyType: CurrencyType, config: CurrencyConfig): string
  currency(currencyType: CurrencyType, precision?: number): string
  currency(currencyType: CurrencyType, config?: CurrencyConfig | number): string {
    if (typeof config === 'number') {
      config = { precision: config }
    }
    return formatCurrency(this.v, currencyType, config)
  }

  /**
   * 指定数字最大保留几位小数点
   * @param precision 位数
   * @returns 格式化后的字符串
   * @example n(1.2345).fixed(2) // '1.23'
   */
  fixed(
    precision:
      | number
      | {
          /** 最小精度 */
          minPrecision?: number
          /** 最大精度 */
          maxPrecision?: number
        }
  ): string {
    return toFixed(this.v, precision)
  }

  /**
   * 遍历数字 (从 1 到 v)
   * @param fn 回调函数
   * @returns Num 实例
   * @example n(3).each(i => console.log(i)) // 1, 2, 3
   */
  each(fn: (n: number) => void): Num {
    const { v } = this
    for (let i = 1; i <= v; i++) {
      fn(i)
    }
    return this
  }

  /**
   * 大小区间 (限制在 min 和 max 之间)
   * @param min 最小值
   * @param max 最大值
   * @returns 一个在指定范围内的值
   * @example n(5).range(0, 10) // 5
   * @example n(-5).range(0, 10) // 0
   */
  range(min: number, max: number): number {
    if (min > max) {
      ;[min, max] = [max, min]
    }
    if (this.v < min) return min
    if (this.v > max) return max
    return this.v
  }

  /**
   * 限制最大值 (不超过 val)
   * @param val 最大值
   * @returns 一个不超过最大值的值
   * @example n(10).max(5) // 5
   */
  max(val: number): number {
    if (this.v > val) return val
    return this.v
  }

  /**
   * 限制最小值 (不小于 val)
   * @param val 最小值
   * @returns  一个不小于最小值的值
   * @example n(1).min(5) // 5
   */
  min(val: number): number {
    if (this.v < val) return val
    return this.v
  }
}
