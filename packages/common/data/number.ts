type FormatType = 'money' | 'cn_money'

class Num {
  private v!: number

  private money(money: number, decimal?: number) {
    if (!money) {
      money = 0
    }
    let isNegative = money < 0
    let [intPart, decPart = ''] = String(Math.abs(money)).split('.')
    const len = intPart!.length - 1
    let arr: string[] = []
    intPart!
      .split('')
      .reverse()
      .forEach((item: string, index: number) => {
        arr.push(item)
        if (index && (index + 1) % 3 === 0 && index !== len) {
          arr.push(',')
        }
      })
    let result = arr.reverse().join('')
    if (decimal) {
      decPart = decPart?.substring(0, decimal)
      result = `${result}.${decPart.padEnd(decimal, '0')}`
    } else {
      decPart ? (result = `${result}.${decPart}`) : void 0
    }
    return isNegative ? '-' + result : result
  }

  private cn_money(money: number) {
    const CN_NUMS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    const CN_INT_RADICE = ['', '拾', '佰', '仟']
    const CN_INT_UNITS = ['', '万', '亿', '兆']
    const CN_DEC_UNITS = ['角', '分', '毫', '厘']
    let result = ''
    if (!money) return '零元整'
    if (money >= 999999999999999.9999) return ''
    const [intPart, decPart] = String(+money.toFixed(4)).split('.')
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

  constructor(n: number) {
    this.v = n
  }

  /**
   * 将数字格式化
   * @param type 格式化类型
   * @param decimal 小数位数
   */
  format(type: FormatType, decimal?: number) {
    return this[type](this.v, decimal)
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

// 3 + (2 + 5) - (3 + 5 / (2 + 3)) - 2 + 5
// 3 + 7 - (3 + 5 / 5) - 2 + 5
// 3 + 7 - (3 + 1) - 2 + 5

// 1.定义一颗抽象树, 当前表达初始等于抽象树
// 2.往树的左边插入一个字面量3
// 3.往树的操作符号插入+
// 4.看到(往树的右边插入一个空表达式, 定义当前表达式为该空表达式
// 5.往当前树的左边插入一个字面量2
// 6.往当前树的操作符插入+
// 7.往当前树的右边插入一个字面量5
// 8.看到当前树节点已满, 抽象树节点已满, 且-符号的优先级为低, 则新增一颗抽象树,
// 抽象树的左节点为此前的抽象树, 当前表达式为该抽象树. 如果遇到高优先级符号, 则
// 抽象树右节点被置换为一个表达式, 且该表达式的左节点为被置换的节点, 当前表达式为
// 该表达式



class Expression {
  operator?: '+' | '-' | '*' | '/'
  left?: NumberLiteral | Expression
  right?: NumberLiteral | Expression
  constructor(options: {
    left?: NumberLiteral | Expression
    right?: NumberLiteral | Expression
    operator?: '+' | '-' | '*' | '/'
  }) {
    this.left = options.left
    this.right = options.right
    this.operator = options.operator
  }
}

class NumberLiteral {
  value!: number
  constructor(n: number) {
    this.value = n
  }
}

const scan = (str: string) => {
  str = str.trim()

  let groupStack: string[] = []

  /** 语法树 */
  let ast: Expression = new Expression({})
  let currentExpression: Expression | null = ast
  let numberLiteral = ''

  const setExpression = (exp: Expression) => {
    if (!ast.left) {
      ast.left = exp
    } else if (!ast.right) {
      ast.right = exp
    } else {
      throw new Error('表达式错误')
    }

  }

  const setLiteral = (literal: NumberLiteral) => {
    if (!ast.left) {
      ast.left = literal
    } else if (!ast.right) {
      ast.right = literal
    } else {
      throw new Error('表达式错误')
    }
  }

  const setOperator = (operator: '+' | '-' | '*' | '/') => {
    if (!currentExpression) {
      throw new Error('表达式错误')
    }
    if (currentExpression.operator) {
      if (!currentExpression.left || !currentExpression.right) {
        throw new Error('表达式错误')
      }
      if (/[\+-]/.test(operator)) {

        ast = new Expression({
          left: ast,
          operator
        })
        currentExpression = ast
      } else if (/[\*\/]/.test(operator)) {
        currentExpression.right = new Expression({
          left: ast.right,
          operator
        })
        currentExpression = ast
      }

    } else {
      ast.operator = operator
    }
  }



  const charOperate = {
    '(': () => {
      setExpression(new Expression({}))
      groupStack.push('(')
    },
    ')': () => {
      if (groupStack[groupStack.length - 1] === '(') {
        groupStack.pop()
      } else {
        throw new Error('表达式错误')
      }
    },
    // 低优先级
    '+': () => {
      setOperator('+')
    },
    '-': () => {
      setOperator('-')
    },

    // 高优先级
    '*': () => {
      setOperator('*')
    },
    '/': () => {
      setOperator('/')
    }
  }

  let i = 0

  while (i < str.length) {
    const c = str[i]!

    // 对象字面量
    if (/\d/.test(c)) {
      numberLiteral += c
    } else {
      // 如果存在对象字面量
      if (numberLiteral) {
        setLiteral(new NumberLiteral(+numberLiteral))
        numberLiteral = ''
      }

      if (c === ' ') continue

      if (charOperate[c]) {
        charOperate[c]()
      }
    }

    i++
  }

  return ast
}

/**
 * 精确计算
 * @param expression 计算表达式
 */
n.calc = function (expression: string) {
  try {
    console.log(scan(expression))
  } catch (e) {
    console.error(e)
  }
  return 1
}

export { n }
