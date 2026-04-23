/**
 * 表达式计算引擎
 * 支持四则运算与括号，使用双栈法解决浮点精度问题
 */

import { Decimal } from './decimal'

/** 词法单元类型 */
type TokenType = 'NUMBER' | 'OP' | 'LPAREN' | 'RPAREN'

/** 词法单元 */
type Token = { type: TokenType; value: string }

/**
 * 从字符串中读取一个数字（支持小数、科学计数法）
 */
function readNumber(source: string, start: number, prefix = ''): { value: string; next: number } {
  let num = prefix
  let i = start
  let dotCount = (num.match(/\./g) || []).length

  while (i < source.length) {
    const c = source[i]!
    if (/[0-9]/.test(c)) {
      num += c
      i++
      continue
    }
    if (c === '.') {
      dotCount++
      if (dotCount > 1) throw new Error(`Invalid number format: ${num + c}`)
      num += c
      i++
      continue
    }
    if ((c === 'e' || c === 'E') && i + 1 < source.length && /[0-9+-]/.test(source[i + 1]!)) {
      num += c
      i++
      if (source[i] === '+' || source[i] === '-') {
        num += source[i]!
        i++
      }
      continue
    }
    break
  }

  return { value: num, next: i }
}

/**
 * 将表达式字符串转换为词法单元数组
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

    const prev = tokens[tokens.length - 1]
    const isUnary = !prev || prev.type === 'OP' || prev.type === 'LPAREN'

    if ((char === '+' || char === '-') && isUnary) {
      const nextChar = expr[i + 1]
      if (nextChar === '(') {
        tokens.push({ type: 'NUMBER', value: '0' })
        tokens.push({ type: 'OP', value: char! })
        i++
        continue
      }
      if (nextChar && /[0-9.]/.test(nextChar)) {
        const { value, next } = readNumber(expr, i + 1, char!)
        tokens.push({ type: 'NUMBER', value })
        i = next
        continue
      }
    }

    if (/[0-9.]/.test(char!)) {
      const { value, next } = readNumber(expr, i)
      tokens.push({ type: 'NUMBER', value })
      i = next
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
const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 }

/**
 * 使用双栈法解析并计算词法单元数组
 */
function parse(tokens: Token[]): number {
  const values: (number | string)[] = []
  const ops: string[] = []

  function applyOp() {
    const op = ops.pop()
    if (!op) {
      throw new Error('Invalid expression: missing operator')
    }
    const b = values.pop()
    const a = values.pop()

    if (a == null || b == null) {
      throw new Error('Invalid expression: insufficient operands')
    }

    let res = 0
    switch (op) {
      case '+':
        res = plus(a, b)
        break
      case '-':
        res = minus(a, b)
        break
      case '*':
        res = mul(a, b)
        break
      case '/':
        res = div(a, b)
        break
    }
    values.push(res)
  }

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      values.push(token.value)
    } else if (token.type === 'LPAREN') {
      ops.push(token.value)
    } else if (token.type === 'RPAREN') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        applyOp()
      }
      if (!ops.length) {
        throw new Error('Invalid expression: mismatched parentheses')
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
    if (ops[ops.length - 1] === '(') {
      throw new Error('Invalid expression: mismatched parentheses')
    }
    applyOp()
  }

  if (values.length !== 1) {
    throw new Error('Invalid expression: residual values')
  }

  const final = values[0]!
  return typeof final === 'number' ? final : new Decimal(final).toNumber()
}

// --- 对外暴露的计算函数（使用 Decimal 保证精度） ---

function plus(a: number | string, b: number | string): number {
  return new Decimal(a).add(new Decimal(b)).toNumber()
}

function minus(a: number | string, b: number | string): number {
  return new Decimal(a).sub(new Decimal(b)).toNumber()
}

function mul(a: number | string, b: number | string): number {
  return new Decimal(a).mul(new Decimal(b)).toNumber()
}

function div(a: number | string, b: number | string): number {
  const d2 = new Decimal(b)
  if (d2.n === 0n) {
    return Number(a) * (1 / Number(b))
  }
  return new Decimal(a).div(d2).toNumber()
}

/**
 * 计算表达式
 * @param expr 表达式字符串, 如 '1 + 3 * (4 / 2)'
 * @throws {Error} 如果表达式为空或格式非法
 */
export function calc(expr: string): number {
  const trimmed = expr.trim()
  if (!trimmed) {
    throw new Error('Empty expression')
  }
  const tokens = tokenize(trimmed)
  return parse(tokens)
}

/**
 * 依次相加 (解决浮点数精度问题)
 * @param numbers 数字列表，支持 number 或 string（string 可避免大数精度丢失）
 * @returns 相加结果
 * @example plus(0.1, 0.2) // 0.3
 */
export function plusMany(...numbers: (number | string)[]): number {
  if (numbers.length === 0) return 0
  const first = numbers[0]
  if (first === undefined) return 0
  let result = new Decimal(first)
  for (let i = 1; i < numbers.length; i++) {
    const v = numbers[i]
    if (v === undefined) continue
    result = result.add(new Decimal(v))
  }
  return result.toNumber()
}

/**
 * 依次相减 (解决浮点数精度问题)
 * @param numbers 数字列表，支持 number 或 string
 * @returns 相减结果
 * @example minus(1.0, 0.9) // 0.1
 */
export function minusMany(...numbers: (number | string)[]): number {
  if (numbers.length === 0) return 0
  const first = numbers[0]
  if (first === undefined) return 0
  let result = new Decimal(first)
  for (let i = 1; i < numbers.length; i++) {
    const v = numbers[i]
    if (v === undefined) continue
    result = result.sub(new Decimal(v))
  }
  return result.toNumber()
}

/**
 * 两数相乘 (解决浮点数精度问题)
 * @param a 数字1
 * @param b 数字2
 * @returns 相乘结果
 * @example multiply(19.9, 100) // 1990
 */
export function multiply(a: number | string, b: number | string): number {
  return new Decimal(a).mul(new Decimal(b)).toNumber()
}

/**
 * 两数相除 (解决浮点数精度问题)
 * @param a 被除数
 * @param b 除数
 * @returns 相除结果
 * @example divide(0.3, 0.1) // 3
 */
export function divide(a: number | string, b: number | string): number {
  if (typeof b === 'number' && b === 0) {
    return Number(a) * (1 / b)
  }
  const d2 = new Decimal(b)
  if (d2.n === 0n) {
    return Number(a) * (1 / Number(b))
  }
  return new Decimal(a).div(d2).toNumber()
}
