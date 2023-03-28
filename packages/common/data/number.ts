type FormatType = 'money' | 'cn_money'

class Num {
  private v!: number

  private static numberFmt = new Intl.NumberFormat('zh-Hans-CN', {
    maximumFractionDigits: 2
  })

  private money(money: number, decimal?: number) {
    if (!money) {
      money = 0
    }
    let [intPart, decPart = ''] = String(money).split('.')
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
    return result
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

interface NumberBlock {
  type: 'number'
  value: number
  nextOperator: string
}

interface GroupBlock {
  type: 'group'
  blocks: Block[]
}

type Block = NumberBlock | GroupBlock

/** 数学运算解释器 */
class CalcInterpreter {
  /** 匹配数字 */
  static NumRE = /[\d\.]/
  /** 匹配操作符 */
  static OprRE = /[\+\-\*\/\%]/

  numberStr = ''

  preBlock: Block | null = null
  blocks: Block[] = []

  /** 添加数字块 */
  addNumberBlock() {
    if (!this.numberStr) return
    const block = {
      type: 'number' as const,
      value: +this.numberStr,
      nextOperator: ''
    }
    this.preBlock = block
    this.blocks.push(block)
    this.numberStr = ''
  }

  constructor(expression: string) {
    this.compile(expression)
  }

  compile(expression: string) {
    let i = -1
    const len = expression.length
    while (++i < len) {
      const char = expression[i]!

      // 忽略空白
      if (char === ' ') continue

      // 数字字符开始拼接
      if (CalcInterpreter.NumRE.test(char)) {
        this.numberStr += char
        continue
      }

      this.addNumberBlock()

      // 操作符
      if (CalcInterpreter.OprRE.test(char)) {
        const { preBlock } = this
        if (!preBlock || preBlock.type !== 'number') {
          throw new Error(`表达式 ${expression} 不合法!`)
        }
        preBlock.nextOperator = char
        continue
      }

      // 分组
      if (char === '(') {
        let stack = ['(']
        let startIndex = i + 1
        while (stack.length && i < len) {
          i++
          let groupChar = expression[i]!
          if (groupChar === '(') {
            stack.push(groupChar)
          } else if (groupChar === ')') {
            stack.pop()
          }
        }

        if (stack.length) {
          throw new Error(`'${char}'不合法!`)
        }

        this.blocks.push({
          type: 'group',
          blocks: new CalcInterpreter(expression.slice(startIndex, i)).blocks
        })

        continue
      }
    }

    this.addNumberBlock()
  }
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

const operatorCalcTactics = {
  '+'(current: number, next: number) {
    return current + next
  }
}

/**
 * 精确计算
 * @param expression 计算表达式
 */
n.calc = function (expression: string) {
  const ci = new CalcInterpreter(expression)

  // Plus Minus RegExp
  const PM_RE = /[\+\-]/

  function c(blocks: Block[]) {
    let current: null | number = null

    let currentOperator = ''

    blocks.forEach((block, i) => {
      let nextBlock = blocks[i + 1]

      if (block.type === 'number') {
        if (current === null) {
          current = block.value
        }

        // + -
        if (PM_RE.test(block.nextOperator)) {
        }
      } else {
        if (current !== null) {
          current = operatorCalcTactics[currentOperator](
            current,
            c(block.blocks)
          )
        }
      }
    })

    return current
  }

  return c(ci.blocks)
}

export { n }
