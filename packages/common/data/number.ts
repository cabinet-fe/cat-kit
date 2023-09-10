type CurrencyType = 'CNY' | 'CNY_HAN'

type CurrencyConfig = {
  /** 保留小数位数 */
  precision?: number
  /** 最小小数位数 */
  minPrecision?: number
  /** 最大小数位数 */
  maxPrecision?: number
}

function int(numbers: number[]) {
  const numberStrings = numbers.map(n => String(n))
  const numStringsLen = numberStrings.map(ns => ns.split('.')[1]?.length ?? 0)

  const factor = Math.pow(10, Math.max(...numStringsLen))

  return {
    /** 整数 */
    ints: numbers.map(n => Math.round(n * factor)),
    /** 让所有数值成为整数的最小系数 */
    factor
  }
}

/**
 * 将浮点数小数部分的字符串转换为目标精度的长度并遵循四舍五入
 * @param decimalPart 浮点数的小数部分
 * @param precision 保留的小数位数
 * @param carry 进位方法
 * @returns
 */
function decimalPrecision(
  decimalPart: string,
  precision: number,
  carry: () => void
) {
  if (precision <= 0) return ''

  const decimalRet = String(
    Math.round(
      +(decimalPart.slice(0, precision) + '.' + decimalPart.slice(precision))
    )
  )

  if (decimalRet.length < precision) {
    return decimalRet.padStart(precision, '0')
  } else if (decimalRet.length > precision) {
    carry()
    return '0'.repeat(precision)
  }

  return decimalRet
}

function toFixed(
  v: number,
  precision: number | { maxPrecision?: number; minPrecision?: number }
) {
  let [int, decimal = ''] = String(v).split('.') as [string, string | undefined]

  if (typeof precision === 'number') {
    if (decimal.length < precision) {
      decimal = decimal.padEnd(precision, '0')
    } else if (decimal.length > precision) {
      decimal = decimalPrecision(decimal, precision, () => {
        int = String(+int + 1)
      })
    }

    return decimal ? int + '.' + decimal : int
  }
  const { maxPrecision, minPrecision } = precision

  // 最大精度拥有更高的优先级
  if (maxPrecision !== undefined && decimal.length > maxPrecision) {
    return decimalPrecision(decimal, maxPrecision, () => {
      int = String(+int + 1)
    })
  }
  if (minPrecision !== undefined && decimal.length < minPrecision) {
    return decimalPrecision(decimal, minPrecision, () => {
      int = String(+int + 1)
    })
  }

  return String(v)
}

const CN_UPPER_NUM = '零壹贰叁肆伍陆柒捌玖'
const CN_INT_RADICE = ['', '拾', '佰', '仟']
const CN_INT_UNITS = ['', '万', '亿', '兆']
const CN_DEC_UNITS = ['角', '分', '毫', '厘']

const CurrencyFormatters: Record<
  CurrencyType,
  (num: number, config?: CurrencyConfig) => string
> = {
  CNY(num, config) {
    const { precision, minPrecision, maxPrecision } = config || {}

    const isNegative = num < 0
    num = Math.abs(num)

    let [intPart, decimalPart = ''] = String(num).split('.') as [
      string,
      string | undefined
    ]

    if (precision !== undefined) {
      if (decimalPart.length < precision) {
        decimalPart = decimalPart.padEnd(precision, '0')
      } else if (decimalPart.length > precision) {
        decimalPart = decimalPrecision(decimalPart, precision, () => {
          intPart = String(+intPart + 1)
        })
      }
    } else {
      // 有最大精度, 优先级最高(根据使用频率)
      if (
        maxPrecision !== undefined &&
        maxPrecision > 0 &&
        decimalPart.length > maxPrecision
      ) {
        decimalPart = decimalPrecision(decimalPart, maxPrecision, () => {
          intPart = String(+intPart + 1)
        })
      }
      // 有最小精度
      else if (
        minPrecision !== undefined &&
        minPrecision > 0 &&
        decimalPart.length < minPrecision
      ) {
        decimalPart = decimalPart.padEnd(minPrecision, '0')
      }
    }

    let result = ''

    for (let i = intPart.length; i > 0; i -= 3) {
      result = ',' + intPart.slice(i - 3 < 0 ? 0 : i - 3, i) + result
    }

    result = result.slice(1)

    if (isNegative) {
      result = '-' + result
    }

    if (decimalPart) {
      result = result + '.' + decimalPart
    }

    return result
  },
  CNY_HAN(num, config) {
    if (!num) return '零元整'
    let result = ''
    if (num >= 999999999999999.9999) return result

    // 是否为负数
    const isNegative = num < 0

    let [intPart, decPart] = toFixed(
      num,
      config?.precision !== undefined
        ? config.precision > 4
          ? 4
          : config.precision
        : 4
    ).split('.') as [string, string | undefined]

    if (isNegative) {
      intPart = intPart.slice(1)
    }

    let count = 0
    const IntLen = intPart!.length
    for (let i = 0; i < IntLen; i++) {
      let n = intPart!.substring(i, i + 1)
      let p = IntLen - i - 1
      let q = p / 4
      let m = p % 4
      if (n === '0') {
        count++
      } else {
        if (count > 0) {
          result += CN_UPPER_NUM[0]
        }
        count = 0
        result += CN_UPPER_NUM[parseInt(n)]! + CN_INT_RADICE[m]
      }
      if (m === 0 && count < 4) {
        result += CN_INT_UNITS[q]
      }
    }
    result = `${result}元`
    if (isNegative) {
      result = `负${result}`
    }

    if (decPart) {
      const decLen = decPart.length
      for (let i = 0; i < decLen; i++) {
        let n = decPart.substring(i, i + 1)
        if (n !== '0') result += CN_UPPER_NUM[Number(n)]! + CN_DEC_UNITS[i]
      }
    } else {
      result = `${result}整`
    }
    return result
  }
}

class Num {
  private v!: number

  constructor(n: number) {
    this.v = n
  }

  /**
   * 数字转货币
   * @param currencyType 货币类型 CNY人民币 CNY_HAN 人民币中文大写
   * @param config 其他配置, 仅precision对CNY_HAN生效
   * @returns
   */
  currency(currencyType: CurrencyType, config: CurrencyConfig): string
  /**
   * 数字转货币
   * @param currencyType 货币类型 CNY人民币 CNY_HAN 人民币中文大写
   * @param precision 精度, 为CNY_HAN时最大和默认只能支持到小数点后四位(厘)
   * @returns
   */
  currency(currencyType: CurrencyType, precision?: number): string
  currency(
    currencyType: CurrencyType,
    config?: CurrencyConfig | number
  ): string {
    if (typeof config === 'number') {
      config = {
        precision: config
      }
    }
    return CurrencyFormatters[currencyType](this.v, config)
  }

  /**
   * 指定数字最大保留几位小数点
   * @param precision 位数
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
  ) {
    return toFixed(this.v, precision)
  }

  /**
   * 遍历数字
   */
  each(fn: (n: number) => void) {
    const { v } = this
    for (let i = 1; i <= v; i++) {
      fn(i)
    }
  }
}

/**
 * 包裹一个数字以方便
 * @param n 数字
 */
const n = function n(n: number) {
  return new Num(n)
}

/**
 * 求和
 * @param numbers 需要求和的数字
 * @returns
 */
n.sum = function (...numbers: number[]) {
  return n.plus(...numbers)
}

interface NumberFormatterOptions {
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
n.formatter = function (options: NumberFormatterOptions) {
  const formatter = new Intl.NumberFormat('zh-CN', {
    notation: options.notation,
    style: options.style,
    maximumFractionDigits: options.maximumFractionDigits ?? options.precision,
    minimumFractionDigits: options.minimumFractionDigits ?? options.precision,
    currency:
      options.style === 'currency'
        ? options.currency ?? 'CNY'
        : options.currency
  })

  return formatter
}

/**
 * 依次相加
 * @param numbers 数字
 * @returns
 */
n.plus = function plus(...numbers: number[]) {
  let i = 0
  let result = 0
  const { ints, factor } = int(numbers)
  while (i < ints.length) {
    result += ints[i]!
    i++
  }
  return result / factor
}

/**
 * 依次相减
 * @param numbers 数字
 * @returns
 */
n.minus = function minus(...numbers: number[]) {
  let i = 0
  let { ints, factor } = int(numbers)

  let result = ints[0]!
  ints = ints.slice(1)
  while (i < ints.length) {
    result -= ints[i]!
    i++
  }
  return result / factor
}

/**
 * 两数相乘
 * @param num1 数字1
 * @param num2 数字2
 * @returns
 */
n.mul = function mul(num1: number, num2: number) {
  let {
    ints: [int1, int2],
    factor
  } = int([num1, num2])
  let result = int1! * int2!

  return result / (factor * factor)
}

/**
 * 两数相除
 * @param num1 数字1
 * @param num2 数字2
 * @returns
 */
n.div = function div(num1: number, num2: number) {
  const { ints } = int([num1, num2])
  return ints[0]! / ints[1]!
}

export { n }
