/**
 * 数字处理工具库
 * 提供数字格式化、货币格式化、高精度计算等功能
 */

export type { CurrencyConfig } from './number/format'
export type { Num } from './number/num'

import { calc, divide, minusMany, multiply, plusMany } from './number/calc'
import { Num } from './number/num'

/** 数字格式化选项 */
export interface NumberFormatOptions {
  /** 数字格式的样式 decimal:十进制, currency货币, percent百分比 */
  style?: 'decimal' | 'currency' | 'percent'
  /** 货币符号, 如果style为currency则默认CNY人民币 */
  currency?: 'CNY' | 'USD' | 'JPY' | 'EUR'
  /** 小数精度(小数点位数) */
  precision?: number
  /** 最大小数位数, 默认3 */
  maximumFractionDigits?: number
  /** 最小小数位数 */
  minimumFractionDigits?: number
  /** 表现方法, standard: 标准, scientific: 科学计数法, engineering: 引擎, compact: 简洁计数   */
  notation?: Intl.NumberFormatOptions['notation']
}

/**
 * 创建一个 Num 实例，用于链式调用
 * @param n 数字
 * @example n(1234.56).currency('CNY') // '1,234.56'
 */
export function n(n: number): Num {
  return new Num(n)
}

export const $n = {
  /**
   * 创建数字格式化器
   * @param options 格式化选项
   */
  formatter(options: NumberFormatOptions): Intl.NumberFormat {
    const formatter = new Intl.NumberFormat('zh-CN', {
      notation: options.notation,
      style: options.style,
      maximumFractionDigits: options.maximumFractionDigits ?? options.precision,
      minimumFractionDigits: options.minimumFractionDigits ?? options.precision,
      currency: options.style === 'currency' ? (options.currency ?? 'CNY') : options.currency
    })

    return formatter
  },

  /**
   * 依次相加 (解决浮点数精度问题)
   * @param numbers 数字列表，支持 number 或 string（string 可避免大数精度丢失）
   * @returns 相加结果
   * @example $n.plus(0.1, 0.2) // 0.3
   * @example $n.plus('1234567890123456.1', '0.1') // 1234567890123456.2
   */
  plus(...numbers: (number | string)[]): number {
    return plusMany(...numbers)
  },

  /**
   * 依次相减 (解决浮点数精度问题)
   * @param numbers 数字列表，支持 number 或 string
   * @returns 相减结果
   * @example $n.minus(1.0, 0.9) // 0.1
   */
  minus(...numbers: (number | string)[]): number {
    return minusMany(...numbers)
  },

  /**
   * 两数相乘 (解决浮点数精度问题)
   * @param num1 数字1
   * @param num2 数字2
   * @returns 相乘结果
   * @example $n.mul(19.9, 100) // 1990
   */
  mul(num1: number | string, num2: number | string): number {
    return multiply(num1, num2)
  },

  /**
   * 两数相除 (解决浮点数精度问题)
   * @param num1 被除数
   * @param num2 除数
   * @returns 相除结果
   * @example $n.div(0.3, 0.1) // 3
   */
  div(num1: number | string, num2: number | string): number {
    return divide(num1, num2)
  },

  /**
   * 求和 (同 plus)
   * @param numbers 需要求和的数字
   * @returns 总和
   */
  sum(...numbers: (number | string)[]): number {
    return plusMany(...numbers)
  },

  /**
   * 计算表达式
   * @param expr 表达式字符串, 如 '1 + 3 * (4 / 2)'
   * @throws {Error} 如果表达式为空
   */
  calc(expr: string): number {
    return calc(expr)
  }
}
