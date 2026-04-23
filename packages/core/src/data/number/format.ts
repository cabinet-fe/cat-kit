/**
 * 数字格式化工具
 * 提供 toFixed、货币格式化（CNY / CNY_HAN）等功能
 */

type CurrencyType = 'CNY' | 'CNY_HAN'

/** 货币格式化配置 */
export type CurrencyConfig = {
  /** 保留小数位数 */
  precision?: number
  /** 最小小数位数 */
  minPrecision?: number
  /** 最大小数位数 */
  maxPrecision?: number
}

/**
 * 小数部分处理结果
 * [decimalPart, roundUp]
 * decimalPart: 处理后的小数部分字符串
 * roundUp: 是否需要进位
 */
type DecimalResult = [decimalPart: string, roundUp: boolean]

/**
 * 按指定精度对小数部分进行四舍五入
 */
function roundDecimalPart(raw: string, precision: number): DecimalResult {
  if (precision === 0) {
    return ['', Math.round(+`.${raw}`) > 0]
  }
  let roundUp = false

  if (raw.length < precision) {
    raw = raw.padEnd(precision, '0')
  } else if (raw.length > precision) {
    raw = String(Math.round(+(raw.slice(0, precision) + '.' + raw.slice(precision))))
    if (raw.length > precision) {
      roundUp = true
      raw = raw.slice(1)
    } else if (raw.length < precision) {
      raw = raw.padStart(precision, '0')
    }
  }

  return [raw, roundUp]
}

/**
 * 按最小/最大精度裁剪小数部分
 */
function trimDecimalPart(
  raw: string,
  config?: { minPrecision?: number; maxPrecision?: number }
): DecimalResult {
  let roundUp = false
  if (!config) return [raw, roundUp]

  const { minPrecision, maxPrecision } = config

  if (maxPrecision !== undefined && raw.length > maxPrecision) {
    ;[raw, roundUp] = roundDecimalPart(raw, maxPrecision)
    // 移除尾部多余的零
    raw = raw.replace(/0+$/, '')
  }

  if (minPrecision !== undefined && raw.length < minPrecision) {
    raw = raw.padEnd(minPrecision, '0')
  }

  return [raw, roundUp]
}

/**
 * 根据配置处理小数部分
 */
function resolveDecimalPart(raw: string, config: CurrencyConfig): DecimalResult {
  const { precision, minPrecision, maxPrecision } = config

  if (precision !== undefined) {
    return roundDecimalPart(raw, precision)
  }

  return trimDecimalPart(raw, { maxPrecision, minPrecision })
}

/**
 * 将数字格式化为指定精度的字符串
 * @param v 数字
 * @param precision 精度配置
 */
export function toFixed(v: number, precision: number | { maxPrecision?: number; minPrecision?: number }) {
  const isNegative = v < 0
  let [int, decimal = ''] = String(Math.abs(v)).split('.') as [string, string | undefined]

  const [decimalPart, roundUp] = resolveDecimalPart(
    decimal,
    typeof precision === 'number' ? { precision } : precision
  )

  if (roundUp) {
    int = String(+int + 1)
  }

  const result = decimalPart ? int + '.' + decimalPart : int
  return isNegative ? '-' + result : result
}

/** 中文数字大写 */
const CN_UPPER_DIGITS = '零壹贰叁肆伍陆柒捌玖'
/** 中文数字整数单位基数 */
const CN_INT_RADICES = ['', '拾', '佰', '仟']
/** 中文数字整数单位 */
const CN_INT_UNITS = ['', '万', '亿', '兆']
/** 中文数字小数单位 */
const CN_DEC_UNITS = ['角', '分', '毫', '厘']

const currencyFormatters: Record<CurrencyType, (num: number, config?: CurrencyConfig) => string> = {
  /**
   * 人民币格式化 (例如: 1,234.56)
   * 使用千分位分隔符
   */
  CNY(num, config) {
    // 处理负数
    const isNegative = num < 0
    num = Math.abs(num)

    let [intPart, decimal = ''] = String(num).split('.') as [string, string | undefined]

    const [decimalPart, roundUp] = resolveDecimalPart(decimal, config || {})

    if (roundUp) {
      intPart = String(+intPart + 1)
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
  /**
   * 人民币中文大写格式化 (例如: 壹仟贰佰叁拾肆元伍角陆分)
   * 支持最大 999兆
   */
  CNY_HAN(num, config) {
    if (!num) return '零元整'
    // 超过最大值直接返回空字符串
    if (Math.abs(num) >= 1e15) return ''
    let result = ''

    // 是否为负数
    const isNegative = num < 0

    let [intPart, decPart] = toFixed(
      num,
      config?.precision !== undefined ? (config.precision > 4 ? 4 : config.precision) : 4
    ).split('.') as [string, string | undefined]

    if (isNegative) {
      intPart = intPart.slice(1)
    }

    let count = 0
    const intLen = intPart!.length
    for (let i = 0; i < intLen; i++) {
      let n = intPart!.substring(i, i + 1)
      let p = intLen - i - 1
      let q = p / 4
      let m = p % 4
      if (n === '0') {
        count++
      } else {
        // 处理连续的零
        if (count > 0) {
          result += CN_UPPER_DIGITS[0]
        }
        count = 0
        // 数字 + 单位 (拾佰仟)
        result += CN_UPPER_DIGITS[parseInt(n)]! + CN_INT_RADICES[m]
      }
      // 添加大单位 (万, 亿, 兆), 每4位一组
      if (m === 0 && count < 4) {
        result += CN_INT_UNITS[q]
      }
    }
    if (!result) result = CN_UPPER_DIGITS[0]!
    result = `${result}元`
    if (isNegative) {
      result = `负${result}`
    }

    if (decPart) {
      const decLen = decPart.length
      for (let i = 0; i < decLen; i++) {
        let n = decPart.substring(i, i + 1)
        if (n !== '0') result += CN_UPPER_DIGITS[Number(n)]! + CN_DEC_UNITS[i]
      }
    } else {
      result = `${result}整`
    }
    return result
  }
}

/**
 * 格式化数字为货币字符串
 * @param num 数字
 * @param currencyType 货币类型
 * @param config 配置
 */
export function formatCurrency(
  num: number,
  currencyType: CurrencyType,
  config?: CurrencyConfig
): string {
  return currencyFormatters[currencyType](num, config)
}
