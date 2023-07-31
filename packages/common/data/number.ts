type CurrencyType = 'CNY' | 'CNY_HAN'

type CurrencyConfig = {
  /** 保留小数位数 */
  precision?: number
  /** 最小小数位数 */
  minPrecision?: number
  /** 最大小数位数 */
  maxPrecision?: number
}

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

    let decimal = decimalPart ? +('0.' + decimalPart) : 0

    if (precision !== undefined) {
      decimalPart = decimal.toFixed(precision).slice(2)
    } else {
      if (minPrecision !== undefined && minPrecision > 0) {
        let minStr = decimal.toFixed(minPrecision).slice(2)
        if (decimalPart.length < minStr.length) {
          decimalPart = minStr
        }
      }

      if (maxPrecision !== undefined && maxPrecision > 0) {
        let maxStr = decimal.toFixed(maxPrecision).slice(2)
        if (decimalPart.length > maxStr.length) {
          decimalPart = maxStr
        }
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
  CNY_HAN(num) {
    const CN_NUMS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    const CN_INT_RADICE = ['', '拾', '佰', '仟']
    const CN_INT_UNITS = ['', '万', '亿', '兆']
    const CN_DEC_UNITS = ['角', '分', '毫', '厘']
    let result = ''
    if (!num) return '零元整'
    if (num >= 999999999999999.9999) return ''
    const [intPart, decPart] = String(+num.toFixed(4)).split('.')
    if (parseInt(intPart!, 10) > 0) {
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
            result += CN_NUMS[0]
          }
          count = 0
          result += CN_NUMS[parseInt(n)]! + CN_INT_RADICE[m]
        }
        if (m === 0 && count < 4) {
          result += CN_INT_UNITS[q]
        }
      }
      result = `${result}元`
    }
    if (decPart) {
      const decLen = decPart.length
      for (let i = 0; i < decLen; i++) {
        let n = decPart.substring(i, i + 1)
        if (n !== '0') result += CN_NUMS[Number(n)]! + CN_DEC_UNITS[i]
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
   * @param config 其他配置, 对CNY_HAN无效
   * @returns
   */
  currency(currencyType: CurrencyType, config: CurrencyConfig): string
  /**
   * 数字转货币
   * @param currencyType 货币类型 CNY人民币 CNY_HAN 人民币中文大写
   * @param precision 精度, 对CNY_HAN无效
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
   * @param n 位数
   */
  fixed(n: number) {
    const { v } = this
    return +v.toFixed(n)
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
  const mul = Math.pow(
    10,
    Math.max(
      ...numbers.map((n, i) => (String(n).match(/\.(\d+)$/)?.[1] || '').length)
    )
  )
  return (
    numbers.map(n => Math.round(n * mul)).reduce((acc, cur) => acc + cur, 0) /
    mul
  )
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

export { n }