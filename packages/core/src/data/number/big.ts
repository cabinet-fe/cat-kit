/** 允许的输入值类型 */
export type BigInput = Big | string | number | bigint

/**
 * 舍入模式
 * - 0: 向零截断；
 * - 1: 四舍五入（5 进）；
 * - 2: 银行家舍入；
 * - 3: 远离零。
 */
export type RoundingMode = 0 | 1 | 2 | 3

/** 默认配置 */

/** 默认小数位数 */
const DEFAULT_DP = 20
/** 默认舍入模式 */
const DEFAULT_RM: RoundingMode = 1
/** 默认科学计数法负指数阈值 */
const DEFAULT_NE = -7
/** 默认科学计数法正指数阈值 */
const DEFAULT_PE = 21

/** 限制常量 */
const MAX_DP = 1e6
const MAX_POWER = 1e6

/** 错误信息 */
const NAME = '[big.js] '
const INVALID = `${NAME}Invalid `
const INVALID_DP = `${INVALID}decimal places`
const INVALID_RM = `${INVALID}rounding mode`
const DIV_BY_ZERO = `${NAME}Division by zero`

/** 数值合法性校验 */
const NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i

/** Node.js inspect 符号 */
const NODE_INSPECT_SYMBOL = Symbol.for('nodejs.util.inspect.custom')

interface ParsedBig {
  s: -1 | 1
  e: number
  c: number[]
}

/**
 * 解析输入值并转为符号、指数、系数三元结构。
 */
function parseValue(value: string): ParsedBig {
  if (!NUMERIC.test(value)) {
    throw new Error(`${INVALID}number`)
  }

  let raw = value
  const sign: -1 | 1 = raw.charAt(0) === '-' ? ((raw = raw.slice(1)), -1) : 1

  let pointIndex = raw.indexOf('.')
  if (pointIndex > -1) {
    raw = raw.replace('.', '')
  }

  const exponentIndex = raw.search(/e/i)
  let exponent: number
  if (exponentIndex > 0) {
    exponent = pointIndex < 0 ? exponentIndex : pointIndex
    exponent += Number(raw.slice(exponentIndex + 1))
    raw = raw.substring(0, exponentIndex)
  } else {
    exponent = pointIndex < 0 ? raw.length : pointIndex
  }

  const rawLength = raw.length
  let leadingZeroCount = 0
  while (leadingZeroCount < rawLength && raw.charAt(leadingZeroCount) === '0') {
    leadingZeroCount += 1
  }

  if (leadingZeroCount === rawLength) {
    return { s: sign, e: 0, c: [0] }
  }

  let trailingIndex = rawLength
  while (trailingIndex > 0 && raw.charAt(trailingIndex - 1) === '0') {
    trailingIndex -= 1
  }

  const c: number[] = []
  for (let index = leadingZeroCount; index < trailingIndex; index += 1) {
    c.push(Number(raw.charAt(index)))
  }

  return { s: sign, e: exponent - leadingZeroCount - 1, c }
}

/**
 * 将内部表示转为字符串（普通格式或科学计数法）。
 */
function stringifyValue(x: Big, useExponential: boolean, includeNegativeZero: boolean): string {
  const exponent = x.e
  let digits = x.c.join('')
  const length = digits.length

  if (useExponential) {
    digits = `${digits.charAt(0)}${length > 1 ? `.${digits.slice(1)}` : ''}${exponent < 0 ? 'e' : 'e+'}${exponent}`
  } else if (exponent < 0) {
    for (let i = exponent; i < -1; i += 1) {
      digits = `0${digits}`
    }
    digits = `0.${digits}`
  } else if (exponent > 0) {
    const split = exponent + 1
    if (split > length) {
      digits = `${digits}${'0'.repeat(split - length)}`
    } else if (split < length) {
      digits = `${digits.slice(0, split)}.${digits.slice(split)}`
    }
  } else if (length > 1) {
    digits = `${digits.charAt(0)}.${digits.slice(1)}`
  }

  if (x.s < 0 && includeNegativeZero) {
    return `-${digits}`
  }
  return digits
}

/**
 * 对 Big 进行有效数字舍入。
 */
function roundValue(
  x: Big,
  sd: number,
  rm: RoundingMode = (x.constructor as typeof Big).RM,
  more = false
): Big {
  const coefficient = x.c

  if (rm !== 0 && rm !== 1 && rm !== 2 && rm !== 3) {
    throw new Error(INVALID_RM)
  }

  if (sd < 1) {
    const first = coefficient[0] ?? 0
    const second = coefficient[1]

    const shouldRoundUp =
      (rm === 3 && (more || first !== 0)) ||
      (sd === 0 &&
        ((rm === 1 && first >= 5) ||
          (rm === 2 && (first > 5 || (first === 5 && (more || second !== undefined))))))

    coefficient.length = 1

    if (shouldRoundUp) {
      x.e = x.e - sd + 1
      coefficient[0] = 1
    } else {
      coefficient[0] = 0
      x.e = 0
    }

    return x
  }

  if (sd >= coefficient.length) {
    return x
  }

  const nextDigit = coefficient[sd] ?? 0
  const hasMoreDigits = coefficient[sd + 1] !== undefined
  const lastRetained = coefficient[sd - 1] ?? 0

  const shouldRoundUp =
    (rm === 1 && nextDigit >= 5) ||
    (rm === 2 &&
      (nextDigit > 5 ||
        (nextDigit === 5 && (more || hasMoreDigits || (lastRetained & 1) === 1)))) ||
    (rm === 3 && (more || (coefficient[0] ?? 0) !== 0))

  coefficient.length = sd

  if (shouldRoundUp) {
    let carryIndex = sd - 1
    while (carryIndex >= 0) {
      const value = (coefficient[carryIndex] ?? 0) + 1
      if (value <= 9) {
        coefficient[carryIndex] = value
        break
      }

      coefficient[carryIndex] = 0
      carryIndex -= 1

      if (carryIndex < 0) {
        x.e += 1
        coefficient.unshift(1)
        break
      }
    }
  }

  while (coefficient.length > 1 && coefficient[coefficient.length - 1] === 0) {
    coefficient.pop()
  }

  return x
}

/**
 * 高精度十进制对象。
 */
export class Big {
  /** 除法与开方的小数位数 */
  static DP = DEFAULT_DP

  /** 默认舍入模式 */
  static RM: RoundingMode = DEFAULT_RM

  /** 科学计数法负指数阈值 */
  static NE = DEFAULT_NE

  /** 科学计数法正指数阈值 */
  static PE = DEFAULT_PE

  /** 舍入模式常量 */
  static readonly roundDown = 0
  static readonly roundHalfUp = 1
  static readonly roundHalfEven = 2
  static readonly roundUp = 3

  /** 符号：1 或 -1 */
  s!: -1 | 1

  /** 十进制指数 */
  e!: number

  /** 系数数组（每位一个 0~9） */
  c!: number[]

  constructor(value: BigInput) {
    if (value instanceof Big) {
      this.s = value.s
      this.e = value.e
      this.c = value.c.slice()
      return
    }

    let raw = value as string | number | bigint | undefined

    if (typeof raw !== 'string') {
      const isNegativeZero = typeof raw === 'number' && raw === 0 && 1 / raw < 0
      raw = isNegativeZero ? '-0' : String(raw)
    }

    const parsed = parseValue(raw)
    this.s = parsed.s
    this.e = parsed.e
    this.c = parsed.c
  }

  /** 返回绝对值 */
  abs(): Big {
    const result = new (this.constructor as typeof Big)(this)
    result.s = 1
    return result
  }

  /** 比较大小：1(大于)、0(等于)、-1(小于) */
  cmp(value: BigInput): -1 | 0 | 1 {
    const x = this
    const y = new (x.constructor as typeof Big)(value)

    const xc = x.c
    const yc = y.c

    let xSign = x.s
    const ySign = y.s

    if (!xc[0] || !yc[0]) {
      if (!xc[0]) {
        return (!yc[0] ? 0 : -ySign) as -1 | 0 | 1
      }
      return xSign
    }

    if (xSign !== ySign) {
      return xSign
    }

    const isNegative = xSign < 0
    const xExponent = x.e
    const yExponent = y.e

    if (xExponent !== yExponent) {
      return (xExponent > yExponent !== isNegative ? 1 : -1) as -1 | 1
    }

    const minLength = Math.min(xc.length, yc.length)
    for (let i = 0; i < minLength; i += 1) {
      const xDigit = xc[i] ?? 0
      const yDigit = yc[i] ?? 0
      if (xDigit !== yDigit) {
        return (xDigit > yDigit !== isNegative ? 1 : -1) as -1 | 1
      }
    }

    if (xc.length === yc.length) {
      return 0
    }
    return (xc.length > yc.length !== isNegative ? 1 : -1) as -1 | 1
  }

  /** 除法 */
  div(value: BigInput): Big {
    const x = this
    const BigCtor = x.constructor as typeof Big
    const a = x.c
    const y = new BigCtor(value)
    const b = y.c

    let sign: -1 | 1 = x.s === y.s ? 1 : -1
    const dp = BigCtor.DP

    if (!Number.isInteger(dp) || dp < 0 || dp > MAX_DP) {
      throw new Error(INVALID_DP)
    }

    if (!b[0]) {
      throw new Error(DIV_BY_ZERO)
    }

    if (!a[0]) {
      y.s = sign
      y.c = [(y.e = 0)]
      return y
    }

    const bz = b.slice()
    let bl = b.length
    let ai = bl
    const al = a.length
    let r = a.slice(0, bl)
    let rl = r.length
    const q = y
    const qc: number[] = (q.c = [])
    let qi = 0
    let p = dp + (q.e = x.e - y.e) + 1

    q.s = sign
    let k = p < 0 ? 0 : p

    bz.unshift(0)

    while (rl++ < bl) {
      r.push(0)
    }

    do {
      let n = 0
      let cmp = 0
      let ri = 0
      let bt = b

      for (; n < 10; n += 1) {
        if (bl !== (rl = r.length)) {
          cmp = bl > rl ? 1 : -1
        } else {
          cmp = 0
          ri = -1
          while (++ri < bl) {
            if ((b[ri] ?? 0) !== (r[ri] ?? 0)) {
              cmp = (b[ri] ?? 0) > (r[ri] ?? 0) ? 1 : -1
              break
            }
          }
        }

        if (cmp < 0) {
          bt = rl === bl ? b : bz
          while (rl) {
            rl -= 1
            if ((r[rl] ?? 0) < (bt[rl] ?? 0)) {
              ri = rl
              while (ri > 0 && !(r[ri - 1] ?? 0)) {
                r[ri - 1] = 9
                ri -= 1
              }
              const borrowIndex = ri > 0 ? ri - 1 : 0
              r[borrowIndex] = (r[borrowIndex] ?? 0) - 1
              r[rl] = (r[rl] ?? 0) + 10
            }
            r[rl] = (r[rl] ?? 0) - (bt[rl] ?? 0)
          }

          while (!r[0]) {
            r.shift()
          }
        } else {
          break
        }
      }

      qc[qi] = cmp ? n : n + 1
      qi += 1

      if (r[0] && cmp) {
        r[rl] = a[ai] ?? 0
      } else {
        r = [a[ai] as number]
      }
    } while ((ai++ < al || r[0] !== undefined) && k--)

    if (!qc[0] && qi !== 1) {
      qc.shift()
      q.e -= 1
      p -= 1
    }

    if (qi > p) {
      roundValue(q, p, BigCtor.RM, r[0] !== undefined)
    }

    return q
  }

  /** 等于 */
  eq(value: BigInput): boolean {
    return this.cmp(value) === 0
  }

  /** 大于 */
  gt(value: BigInput): boolean {
    return this.cmp(value) > 0
  }

  /** 大于等于 */
  gte(value: BigInput): boolean {
    return this.cmp(value) >= 0
  }

  /** 小于 */
  lt(value: BigInput): boolean {
    return this.cmp(value) < 0
  }

  /** 小于等于 */
  lte(value: BigInput): boolean {
    return this.cmp(value) <= 0
  }

  /** 减法 */
  minus(value: BigInput): Big {
    const x = this
    const BigCtor = x.constructor as typeof Big
    const y = new BigCtor(value)

    let a: number = x.s
    let b: number = y.s

    if (a !== b) {
      y.s = (b * -1) as -1 | 1
      return x.plus(y)
    }

    let xc = x.c.slice()
    const xe = x.e

    let yc = y.c.slice()
    let ye = y.e

    if (!xc[0] || !yc[0]) {
      if (yc[0]) {
        y.s = (b * -1) as -1 | 1
      } else if (xc[0]) {
        return new BigCtor(x)
      } else {
        y.s = 1
      }
      return y
    }

    let i = 0
    let j = 0
    let t: number[] | undefined
    let xLessThanY = false

    if ((a = xe - ye)) {
      if ((xLessThanY = a < 0)) {
        a = -a
        t = xc
      } else {
        ye = xe
        t = yc
      }

      t.reverse()
      for (b = a; b > 0; b -= 1) {
        t.push(0)
      }
      t.reverse()
    } else {
      xLessThanY = xc.length < yc.length
      j = (xLessThanY ? xc : yc).length

      for (a = b = 0; b < j; b += 1) {
        const xDigit = xc[b] ?? 0
        const yDigit = yc[b] ?? 0
        if (xDigit !== yDigit) {
          xLessThanY = xDigit < yDigit
          break
        }
      }
    }

    if (xLessThanY) {
      t = xc
      xc = yc
      yc = t
      y.s = (y.s * -1) as -1 | 1
    }

    if ((b = (j = yc.length) - (i = xc.length)) > 0) {
      while (b > 0) {
        xc[i] = 0
        i += 1
        b -= 1
      }
    }

    for (b = i; j > a; ) {
      j -= 1
      if ((xc[j] ?? 0) < (yc[j] ?? 0)) {
        i = j
        while (i > 0 && (xc[i - 1] ?? 0) === 0) {
          xc[i - 1] = 9
          i -= 1
        }
        const borrowIndex = i > 0 ? i - 1 : 0
        xc[borrowIndex] = (xc[borrowIndex] ?? 0) - 1
        xc[j] = (xc[j] ?? 0) + 10
      }
      xc[j] = (xc[j] ?? 0) - (yc[j] ?? 0)
    }

    while (b > 0) {
      b -= 1
      if ((xc[b] ?? 0) === 0) {
        xc.pop()
        continue
      }
      break
    }

    while (xc[0] === 0) {
      xc.shift()
      ye -= 1
    }

    if (!xc[0]) {
      y.s = 1
      xc = [0]
      ye = 0
    }

    y.c = xc
    y.e = ye
    return y
  }

  /** 减法别名 */
  sub(value: BigInput): Big {
    return this.minus(value)
  }

  /** 取模 */
  mod(value: BigInput): Big {
    const x = this
    const BigCtor = x.constructor as typeof Big
    const y = new BigCtor(value)

    if (!y.c[0]) {
      throw new Error(DIV_BY_ZERO)
    }

    if (y.abs().cmp(x.abs()) > 0) {
      return new BigCtor(x)
    }

    const previousDP = BigCtor.DP
    const previousRM = BigCtor.RM

    let quotient: Big
    try {
      BigCtor.DP = 0
      BigCtor.RM = 0
      quotient = new BigCtor(x).div(y)
    } finally {
      BigCtor.DP = previousDP
      BigCtor.RM = previousRM
    }

    return x.minus(quotient.times(y))
  }

  /** 取反 */
  neg(): Big {
    const result = new (this.constructor as typeof Big)(this)
    result.s = (result.s * -1) as -1 | 1
    return result
  }

  /** 加法 */
  plus(value: BigInput): Big {
    const x = this
    const BigCtor = x.constructor as typeof Big
    const y = new BigCtor(value)

    if (x.s !== y.s) {
      y.s = (y.s * -1) as -1 | 1
      return x.minus(y)
    }

    let xe = x.e
    let xc = x.c.slice()

    let ye = y.e
    let yc = y.c.slice()

    if (!xc[0] || !yc[0]) {
      if (!yc[0]) {
        if (xc[0]) {
          return new BigCtor(x)
        }
        y.s = x.s
      }
      return y
    }

    let exponentDiff = xe - ye
    if (exponentDiff !== 0) {
      const target = exponentDiff > 0 ? yc : xc
      if (exponentDiff < 0) {
        exponentDiff = -exponentDiff
      } else {
        ye = xe
      }

      target.reverse()
      while (exponentDiff > 0) {
        target.push(0)
        exponentDiff -= 1
      }
      target.reverse()
    }

    if (xc.length < yc.length) {
      const temp = yc
      yc = xc
      xc = temp
    }

    let carry = 0
    for (let i = yc.length - 1; i >= 0; i -= 1) {
      const sum = (xc[i] ?? 0) + (yc[i] ?? 0) + carry
      xc[i] = sum % 10
      carry = (sum / 10) | 0
    }

    if (carry) {
      xc.unshift(carry)
      ye += 1
    }

    while (xc.length > 1 && xc[xc.length - 1] === 0) {
      xc.pop()
    }

    y.c = xc
    y.e = ye

    return y
  }

  /** 加法别名 */
  add(value: BigInput): Big {
    return this.plus(value)
  }

  /** 幂运算 */
  pow(n: number): Big {
    const x = this
    const BigCtor = x.constructor as typeof Big

    if (!Number.isInteger(n) || n < -MAX_POWER || n > MAX_POWER) {
      throw new Error(`${INVALID}exponent`)
    }

    const one = new BigCtor('1')
    let result = one
    let base = new BigCtor(x)
    let exponent = n

    const isNegativeExponent = exponent < 0
    if (isNegativeExponent) {
      exponent = -exponent
    }

    while (exponent > 0) {
      if (exponent & 1) {
        result = result.times(base)
      }
      exponent >>= 1
      if (exponent) {
        base = base.times(base)
      }
    }

    return isNegativeExponent ? one.div(result) : result
  }

  /** 按有效位数舍入 */
  prec(sd: number, rm?: RoundingMode): Big {
    if (!Number.isInteger(sd) || sd < 1 || sd > MAX_DP) {
      throw new Error(`${INVALID}precision`)
    }

    const target = new (this.constructor as typeof Big)(this)
    return roundValue(target, sd, rm)
  }

  /** 按小数位舍入 */
  round(dp = 0, rm?: RoundingMode): Big {
    if (!Number.isInteger(dp) || dp < -MAX_DP || dp > MAX_DP) {
      throw new Error(INVALID_DP)
    }

    const target = new (this.constructor as typeof Big)(this)
    return roundValue(target, dp + target.e + 1, rm)
  }

  /** 开平方 */
  sqrt(): Big {
    const x = this
    const BigCtor = x.constructor as typeof Big

    if (!x.c[0]) {
      return new BigCtor(x)
    }

    if (x.s < 0) {
      throw new Error(`${NAME}No square root`)
    }

    let estimate = Math.sqrt(+stringifyValue(x, true, true))

    let result: Big
    if (estimate === 0 || estimate === Infinity) {
      let coefficient = x.c.join('')
      if (!((coefficient.length + x.e) & 1)) {
        coefficient += '0'
      }
      estimate = Math.sqrt(Number(coefficient))

      const adjustedExponent = (((x.e + 1) / 2) | 0) - (x.e < 0 || x.e & 1 ? 1 : 0)
      const mantissa = estimate === Infinity ? '5e' : `${estimate.toExponential().split('e')[0]}e`
      result = new BigCtor(`${mantissa}${adjustedExponent}`)
    } else {
      result = new BigCtor(String(estimate))
    }

    const previousDP = BigCtor.DP
    BigCtor.DP = previousDP + 4

    const precision = result.e + BigCtor.DP

    try {
      const half = new BigCtor('0.5')
      let prev: Big
      do {
        prev = result
        result = half.times(prev.plus(x.div(prev)))
      } while (prev.c.slice(0, precision).join('') !== result.c.slice(0, precision).join(''))
    } finally {
      BigCtor.DP = previousDP
    }

    return roundValue(result, previousDP + result.e + 1, BigCtor.RM)
  }

  /** 乘法 */
  times(value: BigInput): Big {
    const x = this
    const BigCtor = x.constructor as typeof Big

    const y = new BigCtor(value)
    let xc = x.c
    let yc = y.c

    let a = xc.length
    let b = yc.length

    y.s = x.s === y.s ? 1 : -1

    if (!xc[0] || !yc[0]) {
      y.e = 0
      y.c = [0]
      return y
    }

    y.e = x.e + y.e

    if (a < b) {
      const temp = xc
      xc = yc
      yc = temp

      const len = a
      a = b
      b = len
    }

    const coefficient = new Array<number>(a + b).fill(0)

    for (let i = b - 1; i >= 0; i -= 1) {
      let carry = 0
      for (let j = a + i; j > i; j -= 1) {
        const total = coefficient[j]! + (yc[i] ?? 0) * (xc[j - i - 1] ?? 0) + carry
        coefficient[j] = total % 10
        carry = (total / 10) | 0
      }
      coefficient[i] = carry
    }

    if (coefficient[0] !== 0) {
      y.e += 1
    } else {
      coefficient.shift()
    }

    while (coefficient.length > 1 && coefficient[coefficient.length - 1] === 0) {
      coefficient.pop()
    }

    y.c = coefficient
    return y
  }

  /** 乘法别名 */
  mul(value: BigInput): Big {
    return this.times(value)
  }

  /** 转科学计数法字符串 */
  toExponential(dp?: number, rm?: RoundingMode): string {
    let x = this as Big
    const first = x.c[0] ?? 0

    if (dp !== undefined) {
      if (!Number.isInteger(dp) || dp < 0 || dp > MAX_DP) {
        throw new Error(INVALID_DP)
      }

      x = roundValue(new (x.constructor as typeof Big)(x), dp + 1, rm)
      while (x.c.length < dp + 1) {
        x.c.push(0)
      }
    }

    return stringifyValue(x, true, first !== 0)
  }

  /** 转固定小数字符串 */
  toFixed(dp?: number, rm?: RoundingMode): string {
    let x = this as Big
    const first = x.c[0] ?? 0

    if (dp !== undefined) {
      if (!Number.isInteger(dp) || dp < 0 || dp > MAX_DP) {
        throw new Error(INVALID_DP)
      }

      x = roundValue(new (x.constructor as typeof Big)(x), dp + x.e + 1, rm)

      let length = dp + x.e + 1
      while (x.c.length < length) {
        x.c.push(0)
      }
    }

    return stringifyValue(x, false, first !== 0)
  }

  /** 转普通字符串（必要时自动科学计数法） */
  toString(): string {
    const BigCtor = this.constructor as typeof Big
    return stringifyValue(
      this,
      this.e <= BigCtor.NE || this.e >= BigCtor.PE,
      (this.c[0] ?? 0) !== 0
    )
  }

  /** JSON 序列化字符串 */
  toJSON(): string {
    return this.toString()
  }

  /** Node.js 自定义 inspect 输出 */
  [NODE_INSPECT_SYMBOL](): string {
    return this.toJSON()
  }

  /** 转原生 number */
  toNumber(): number {
    return Number(stringifyValue(this, true, true))
  }

  /** 按有效位输出字符串 */
  toPrecision(sd?: number, rm?: RoundingMode): string {
    let x = this as Big
    const BigCtor = x.constructor as typeof Big
    const first = x.c[0] ?? 0

    if (sd !== undefined) {
      if (!Number.isInteger(sd) || sd < 1 || sd > MAX_DP) {
        throw new Error(`${INVALID}precision`)
      }
      x = roundValue(new BigCtor(x), sd, rm)
      while (x.c.length < sd) {
        x.c.push(0)
      }
    }

    const useExponential = sd !== undefined && sd <= x.e
    return stringifyValue(x, useExponential || x.e <= BigCtor.NE || x.e >= BigCtor.PE, first !== 0)
  }

  /** valueOf */
  valueOf(): string {
    const BigCtor = this.constructor as typeof Big
    return stringifyValue(this, this.e <= BigCtor.NE || this.e >= BigCtor.PE, true)
  }
}

/**
 * 创建隔离配置的 Big 构造器，避免不同调用方共享静态配置导致相互影响。
 */
export function createBigConstructor(): typeof Big {
  class IsolatedBig extends Big {}

  IsolatedBig.DP = DEFAULT_DP
  IsolatedBig.RM = DEFAULT_RM
  IsolatedBig.NE = DEFAULT_NE
  IsolatedBig.PE = DEFAULT_PE

  return IsolatedBig
}
