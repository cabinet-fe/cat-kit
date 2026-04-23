/**
 * 内部高精度十进制数实现
 * 基于字符串与 BigInt，解决浮点数精度问题
 */
export class Decimal {
  /** 整数部分（已包含符号） */
  n: bigint
  /** 小数位数 */
  scale: number

  constructor(v: number | string) {
    let s = String(v).trim()
    if (s.includes('e') || s.includes('E')) {
      s = Decimal.fromScientific(s)
    }
    if (s.startsWith('.')) s = '0' + s
    if (s.startsWith('-.')) s = '-0' + s.slice(1)

    const [intPart = '0', decPart = ''] = s.split('.')
    this.scale = decPart.length
    const sign = intPart.startsWith('-') ? '-' : ''
    const absInt = intPart.replace(/^-?0+/, '') || '0'
    if (absInt.startsWith('-')) {
      // 安全处理
      this.n = BigInt(sign + absInt.slice(1) + decPart)
    } else {
      this.n = BigInt(sign + absInt + decPart)
    }
    this.simplify()
  }

  private static fromScientific(s: string): string {
    const parts = s.split(/[eE]/)
    const mantissa = parts[0]!
    const expStr = parts[1]!
    const exp = parseInt(expStr, 10)
    const isNeg = mantissa.startsWith('-')
    const absM = isNeg ? mantissa.slice(1) : mantissa
    const [intPart = '', decPart = ''] = absM.split('.')
    let digits = intPart + decPart
    let scale = decPart.length
    const newScale = scale - exp

    if (newScale <= 0) {
      digits = digits + '0'.repeat(-newScale)
      return (isNeg ? '-' : '') + digits
    }
    if (digits.length > newScale) {
      const intLen = digits.length - newScale
      return (isNeg ? '-' : '') + digits.slice(0, intLen) + '.' + digits.slice(intLen)
    }
    const zeros = '0'.repeat(newScale - digits.length)
    return (isNeg ? '-' : '') + '0.' + zeros + digits
  }

  private simplify() {
    if (this.n === 0n) {
      this.scale = 0
      return
    }
    let s = this.n.toString()
    const sign = s.startsWith('-') ? '-' : ''
    if (sign) s = s.slice(1)
    let trailing = 0
    for (let i = s.length - 1; i >= 0 && s[i] === '0' && trailing < this.scale; i--) {
      trailing++
    }
    if (trailing > 0) {
      this.n = BigInt(sign + s.slice(0, s.length - trailing))
      this.scale -= trailing
    }
  }

  toNumber(): number {
    if (this.scale === 0) return Number(this.n)
    const s = this.n.toString()
    const sign = s.startsWith('-') ? '-' : ''
    const abs = sign ? s.slice(1) : s
    if (abs.length <= this.scale) {
      const zeros = '0'.repeat(this.scale - abs.length)
      return Number(sign + '0.' + zeros + abs)
    }
    const intLen = abs.length - this.scale
    return Number(sign + abs.slice(0, intLen) + '.' + abs.slice(intLen))
  }

  add(other: Decimal): Decimal {
    const maxScale = Math.max(this.scale, other.scale)
    const a = this.n * (10n ** BigInt(maxScale - this.scale))
    const b = other.n * (10n ** BigInt(maxScale - other.scale))
    const res = Object.create(Decimal.prototype) as Decimal
    res.n = a + b
    res.scale = maxScale
    res.simplify()
    return res
  }

  sub(other: Decimal): Decimal {
    const maxScale = Math.max(this.scale, other.scale)
    const a = this.n * (10n ** BigInt(maxScale - this.scale))
    const b = other.n * (10n ** BigInt(maxScale - other.scale))
    const res = Object.create(Decimal.prototype) as Decimal
    res.n = a - b
    res.scale = maxScale
    res.simplify()
    return res
  }

  mul(other: Decimal): Decimal {
    const res = Object.create(Decimal.prototype) as Decimal
    res.n = this.n * other.n
    res.scale = this.scale + other.scale
    res.simplify()
    return res
  }

  div(other: Decimal, precision = 20): Decimal {
    const scaleUp = precision + other.scale
    const n = this.n * (10n ** BigInt(scaleUp))
    const res = Object.create(Decimal.prototype) as Decimal
    res.n = n / other.n
    res.scale = precision + this.scale
    res.simplify()
    return res
  }
}
