/**
 * 数字处理工具库
 * 提供数字格式化、货币格式化、高精度计算等功能
 */
type CurrencyType = 'CNY' | 'CNY_HAN'

/** 货币格式化配置 */
type CurrencyConfig = {
  /** 保留小数位数 */
  precision?: number
  /** 最小小数位数 */
  minPrecision?: number
  /** 最大小数位数 */
  maxPrecision?: number
}

/**
 * 小数部分处理结果
 * [DecimalPart, RoundUp]
 * DecimalPart: 处理后的小数部分字符串
 * RoundUp: 是否需要进位
 */
type DecimalResult = [DecimalPart: string, RoundUp: boolean]

/**
 * 根据指定精度获取小数部分
 * @param raw 小数部分的原始字符串
 * @param precision 精度
 */
function getDecimalPartByPrecision(
  raw: string,
  precision: number
): DecimalResult {
  if (precision === 0) {
    return ['', Math.round(+`.${raw}`) > 0]
  }
  let roundUp = false

  if (raw.length < precision) {
    raw = raw.padEnd(precision, '0')
  } else if (raw.length > precision) {
    raw = String(
      Math.round(+(raw.slice(0, precision) + '.' + raw.slice(precision)))
    )
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
 * 根据最小/最大精度获取小数部分
 * @param raw 小数部分的原始字符串
 * @param config 精度配置
 */
function getDecimalPartByMinMaxPrecision(
  raw: string,
  config?: { minPrecision?: number; maxPrecision?: number }
): DecimalResult {
  let roundUp = false
  if (!config) return [raw, roundUp]

  const { minPrecision, maxPrecision } = config

  if (maxPrecision !== undefined && raw.length > maxPrecision) {
    ;[raw, roundUp] = getDecimalPartByPrecision(raw, maxPrecision)
    // 移除尾部多余的零
    raw = raw.replace(/0+$/, '')
  }

  if (minPrecision !== undefined && raw.length < minPrecision) {
    raw = raw.padEnd(minPrecision, '0')
  }

  return [raw, roundUp]
}

/**
 * 获取浮点数的小数部分
 * @param raw 小数部分的原始字符串
 * @param config 配置
 * @returns
 */
function getDecimalPart(raw: string, config: CurrencyConfig) {
  const { precision, minPrecision, maxPrecision } = config

  if (precision !== undefined) {
    return getDecimalPartByPrecision(raw, precision)
  }

  return getDecimalPartByMinMaxPrecision(raw, {
    maxPrecision,
    minPrecision
  })
}

// 0.35, 1 ->
/**
 * 将数字格式化为指定精度的字符串
 * @param v 数字
 * @param precision 精度配置
 */
function toFixed(
  v: number,
  precision: number | { maxPrecision?: number; minPrecision?: number }
) {
  let [int, decimal = ''] = String(v).split('.') as [string, string | undefined]

  const [decimalPart, roundUp] = getDecimalPart(
    decimal,
    typeof precision === 'number' ? { precision } : precision
  )

  if (roundUp) {
    int = String(+int + 1)
  }
  if (!decimalPart) return int

  return int + '.' + decimalPart
}

/** 中文数字大写 */
const CN_UPPER_NUM = '零壹贰叁肆伍陆柒捌玖'
/** 中文数字整数单位基数 */
const CN_INT_RADICE = ['', '拾', '佰', '仟']
/** 中文数字整数单位 */
const CN_INT_UNITS = ['', '万', '亿', '兆']
/** 中文数字小数单位 */
const CN_DEC_UNITS = ['角', '分', '毫', '厘']

const CurrencyFormatters: Record<
  CurrencyType,
  (num: number, config?: CurrencyConfig) => string
> = {
  /**
   * 人民币格式化 (例如: 1,234.56)
   * 使用千分位分隔符
   */
  CNY(num, config) {
    // 处理负数
    const isNegative = num < 0
    num = Math.abs(num)

    let [intPart, decimal = ''] = String(num).split('.') as [
      string,
      string | undefined
    ]

    const [decimalPart, roundUp] = getDecimalPart(decimal, config || {})

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
    if (num >= 999999999999999.9999) return ''
    let result = ''

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
        // 处理连续的零
        if (count > 0) {
          result += CN_UPPER_NUM[0]
        }
        count = 0
        // 数字 + 单位 (拾佰仟)
        result += CN_UPPER_NUM[parseInt(n)]! + CN_INT_RADICE[m]
      }
      // 添加大单位 (万, 亿, 兆), 每4位一组
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

/**
 * 数字包装类, 提供链式调用
 */
class Num {
  private v: number

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
  /**
   * 数字转货币
   * @param currencyType 货币类型 CNY人民币 CNY_HAN 人民币中文大写
   * @param config 其他配置, 仅precision对CNY_HAN生效
   * @returns 格式化后的货币字符串
   * @example n(1234.56).currency('CNY') // '1,234.56'
   */
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

/**
 * 创建一个 Num 实例，用于链式调用
 * @param n 数字
 */
export function n(n: number): Num {
  return new Num(n)
}

/** 数字格式化选项 */
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

/**
 * 将浮点数转换为整数, 并返回对齐后的整数和系数
 * 用于解决浮点数计算精度问题
 * 例如: [0.1, 0.02] -> ints: [10, 2], factor: 100
 */
function int(numbers: number[]) {
  const numberStrings = numbers.map(n => String(n))
  const numStringsLen = numberStrings.map(ns => {
    if (ns.includes('e') || ns.includes('E')) {
      // 处理科学计数法, 如 1e-7
      const [mantissa, exponent] = ns.split(/[eE]/)
      const mantissaDecimals = mantissa!.split('.')[1]?.length ?? 0
      const exp = parseInt(exponent!, 10)
      // 计算实际的小数位数: 尾数的小数位 - 指数 (如果指数为负, 则相当于增加了小数位)
      return Math.max(0, mantissaDecimals - exp)
    }
    return ns.split('.')[1]?.length ?? 0
  })

  const factor = Math.pow(10, Math.max(...numStringsLen))

  return {
    /** 整数 */
    ints: numbers.map(n => Math.round(n * factor)),
    /** 让所有数值成为整数的最小系数 */
    factor
  }
}

export const $n = {
  /**
   * 创建数字格式化器
   * @param options 格式化选项
   */
  formatter(options: NumberFormatterOptions): Intl.NumberFormat {
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
  },
  /**
   * 依次相加 (解决浮点数精度问题)
   * @param numbers 数字列表
   * @returns 相加结果
   * @example $n.plus(0.1, 0.2) // 0.3
   */
  plus(...numbers: number[]): number {
    let i = 0
    let result = 0
    const { ints, factor } = int(numbers)
    while (i < ints.length) {
      result += ints[i]!
      i++
    }
    return result / factor
  },
  /**
   * 依次相减 (解决浮点数精度问题)
   * @param numbers 数字列表
   * @returns 相减结果
   * @example $n.minus(1.0, 0.9) // 0.1
   */
  minus(...numbers: number[]): number {
    let i = 0
    let { ints, factor } = int(numbers)

    let result = ints[0]!
    ints = ints.slice(1)
    while (i < ints.length) {
      result -= ints[i]!
      i++
    }
    return result / factor
  },
  /**
   * 两数相乘 (解决浮点数精度问题)
   * @param num1 数字1
   * @param num2 数字2
   * @returns 相乘结果
   * @example $n.mul(19.9, 100) // 1990
   */
  mul(num1: number, num2: number): number {
    let {
      ints: [int1, int2],
      factor
    } = int([num1, num2])
    let result = int1! * int2!

    return result / (factor * factor)
  },
  /**
   * 两数相除 (解决浮点数精度问题)
   * @param num1 被除数
   * @param num2 除数
   * @returns 相除结果
   * @example $n.div(0.3, 0.1) // 3
   */
  div(num1: number, num2: number): number {
    if (num2 === 0) return num1 >= 0 ? Infinity : -Infinity
    const { ints } = int([num1, num2])
    return ints[0]! / ints[1]!
  },

  /**
   * 求和 (同 plus)
   * @param numbers 需要求和的数字
   * @returns 总和
   */
  sum(...numbers: number[]): number {
    return $n.plus(...numbers)
  },

  /**
   * 计算表达式
   * @param expr 表达式字符串, 如 '1 + 3 * (4 / 2)'
   * @throws {Error} 如果表达式为空
   */
  calc(expr: string): number {
    const trimmed = expr.trim()
    if (!trimmed) {
      throw new Error('Empty expression')
    }
    const tokens = tokenize(trimmed)
    return parse(tokens)
  }
}

// --- Calc Implementation ---

/** 词法单元类型 */
type TokenType = 'NUMBER' | 'OP' | 'LPAREN' | 'RPAREN'
/** 词法单元 */
type Token = { type: TokenType; value: string }

/**
 * 将表达式字符串转换为词法单元数组
 * @param expr 表达式字符串
 */
function tokenize(expr: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < expr.length) {
    const char = expr[i]
    if (/\s/.test(char!)) {
      i++
      continue
    }
    if (/[0-9.]/.test(char!)) {
      let num = ''
      while (i < expr.length) {
        const c = expr[i]!
        if (/[0-9.]/.test(c)) {
          num += c
          i++
        } else if (
          (c === 'e' || c === 'E') &&
          i + 1 < expr.length &&
          /[0-9+-]/.test(expr[i + 1]!)
        ) {
          num += c
          i++
          // Handle optional + or - after e
          if (expr[i] === '+' || expr[i] === '-') {
            num += expr[i]
            i++
          }
        } else {
          break
        }
      }
      tokens.push({ type: 'NUMBER', value: num })
      continue
    }
    if (['+', '-', '*', '/'].includes(char!)) {
      tokens.push({ type: 'OP', value: char! })
      i++
      continue
    }
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' })
      i++
      continue
    }
    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' })
      i++
      continue
    }
    throw new Error(`Unexpected character: ${char}`)
  }
  return tokens
}

/** 运算符优先级 */
const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2
}

/**
 * 解析并计算词法单元数组
 * 使用双栈法（操作数栈和操作符栈）进行计算
 * @param tokens 词法单元数组
 */
function parse(tokens: Token[]): number {
  const values: number[] = []
  const ops: string[] = []

  /**
   * 应用栈顶运算符
   */
  function applyOp() {
    const op = ops.pop()!
    const b = values.pop()!
    const a = values.pop()!
    let res = 0
    switch (op) {
      case '+':
        res = $n.plus(a, b)
        break
      case '-':
        res = $n.minus(a, b)
        break
      case '*':
        res = $n.mul(a, b)
        break
      case '/':
        res = $n.div(a, b)
        break
    }
    values.push(res)
  }

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      values.push(parseFloat(token.value))
    } else if (token.type === 'LPAREN') {
      ops.push(token.value)
    } else if (token.type === 'RPAREN') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        applyOp()
      }
      ops.pop() // pop '('
    } else if (token.type === 'OP') {
      while (
        ops.length &&
        ops[ops.length - 1] !== '(' &&
        PRECEDENCE[ops[ops.length - 1]!]! >= PRECEDENCE[token.value]!
      ) {
        applyOp()
      }
      ops.push(token.value)
    }
  }

  while (ops.length) {
    applyOp()
  }

  return values[0]!
}
