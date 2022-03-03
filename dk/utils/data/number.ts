type FormatType = 'money' | 'cn_money'

class Num {
  private v!: number

  private static numberFmt = new Intl.NumberFormat('zh-Hans-CN', {
    maximumFractionDigits: 2
  })

  private money(money: number) {
    if (!money) return '0'
    const [intPart, decPart] = String(money).split('.')
    const len = intPart.length - 1
    let arr: string[] = []
    intPart
      .split('')
      .reverse()
      .forEach((item: string, index: number) => {
        arr.push(item)
        if (index && (index + 1) % 3 === 0 && index !== len) {
          arr.push(',')
        }
      })
    let result = arr.reverse().join('')
    if (decPart) result = `${result}.${decPart}`
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
    if (parseInt(intPart, 10) > 0) {
      let count = 0
      const IntLen = intPart.length
      for (let i = 0; i < IntLen; i++) {
        let n = intPart.substring(i, i + 1)
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
          result += CN_NUMS[parseInt(n)] + CN_INT_RADICE[m]
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
        if (n !== '0') result += CN_NUMS[Number(n)] + CN_DEC_UNITS[i]
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
   */
  format(type: FormatType) {
    return this[type](this.v)
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
    for(let i = 1; i <= v; i++) {
      fn(i)
    }
  }
}

interface N {
  (n: number): Num
}

/**
 * 包裹一个数字以方便
 * @param n 数字
 */
export const n = <N>function n(n: number) {
  return new Num(n)
}
