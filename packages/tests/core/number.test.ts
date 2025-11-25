import { describe, it, expect } from 'vitest'
import { n, $n } from '@cat-kit/core/src'

describe('数字工具函数', () => {
  describe('Num类 - n()', () => {
    describe('currency', () => {
      it('应该将数字格式化为人民币', () => {
        expect(n(1234567.89).currency('CNY', 2)).toBe('1,234,567.89')
        expect(n(1234567.8).currency('CNY', 2)).toBe('1,234,567.80')
        expect(n(1234567).currency('CNY', 2)).toBe('1,234,567.00')
      })

      it('应该处理负数', () => {
        expect(n(-1234567.89).currency('CNY', 2)).toBe('-1,234,567.89')
        expect(n(-100).currency('CNY', 2)).toBe('-100.00')
      })

      it('应该处理不同的精度', () => {
        expect(n(123.456789).currency('CNY', 0)).toBe('123') // 四舍五入
        expect(n(123.456789).currency('CNY', 2)).toBe('123.46')
        expect(n(123.456789).currency('CNY', 4)).toBe('123.4568')
      })

      it('应该支持配置对象', () => {
        expect(n(123.456).currency('CNY', { precision: 2 })).toBe('123.46')
        expect(
          n(123.456).currency('CNY', { minPrecision: 2, maxPrecision: 4 })
        ).toBe('123.456')
      })

      it('应该将数字转换为中文大写', () => {
        expect(n(0).currency('CNY_HAN')).toBe('零元整')
        expect(n(123.45).currency('CNY_HAN')).toBe('壹佰贰拾叁元肆角伍分')
        expect(n(1234).currency('CNY_HAN')).toContain('壹仟贰佰叁拾肆元')
        expect(n(10000).currency('CNY_HAN')).toContain('壹万元')
      })

      it('应该处理大数字的中文大写', () => {
        expect(n(123456789).currency('CNY_HAN')).toContain(
          '壹亿贰仟叁佰肆拾伍万陆仟柒佰捌拾玖元'
        )
        expect(n(1000000).currency('CNY_HAN')).toContain('壹佰万元')
      })

      it('应该处理负数的中文大写', () => {
        expect(n(-123.45).currency('CNY_HAN')).toBe('负壹佰贰拾叁元肆角伍分')
      })

      it('应该处理小数的中文大写', () => {
        expect(n(0.12).currency('CNY_HAN')).toContain('壹角贰分')
        expect(n(0.123).currency('CNY_HAN')).toContain('壹角贰分叁毫')
        expect(n(0.1234).currency('CNY_HAN')).toContain('壹角贰分叁毫肆厘')
      })
    })

    describe('fixed', () => {
      it('应该固定小数位数', () => {
        expect(n(123.456).fixed(2)).toBe('123.46')
        expect(n(123.4).fixed(2)).toBe('123.40')
        expect(n(123).fixed(2)).toBe('123.00')
      })

      it('应该支持四舍五入', () => {
        expect(n(123.445).fixed(2)).toBe('123.45')
        expect(n(123.455).fixed(2)).toBe('123.46')
      })

      it('应该支持最小最大精度', () => {
        expect(n(123.456).fixed({ minPrecision: 2, maxPrecision: 4 })).toBe(
          '123.456'
        )
        expect(n(123.4).fixed({ minPrecision: 2 })).toBe('123.40')
        expect(n(123.45678).fixed({ maxPrecision: 3 })).toBe('123.457')
      })

      it('应该处理整数', () => {
        expect(n(123).fixed(0)).toBe('123')
        expect(n(123.5).fixed(0)).toBe('124')
      })
    })

    describe('each', () => {
      it('应该遍历数字', () => {
        const result: number[] = []
        n(5).each(i => result.push(i))
        expect(result).toEqual([1, 2, 3, 4, 5])
      })

      it('应该处理0和负数', () => {
        const result: number[] = []
        n(0).each(i => result.push(i))
        expect(result).toEqual([])

        n(-3).each(i => result.push(i))
        expect(result).toEqual([])
      })

      it('应该返回自身以支持链式调用', () => {
        const result: number[] = []
        const num = n(3)
        const returned = num.each(i => result.push(i))
        expect(returned).toBe(num)
      })
    })

    describe('range', () => {
      it('应该限制数字在指定范围内', () => {
        expect(n(5).range(0, 10)).toBe(5)
        expect(n(15).range(0, 10)).toBe(10)
        expect(n(-5).range(0, 10)).toBe(0)
      })

      it('应该处理反向的最小最大值', () => {
        expect(n(5).range(10, 0)).toBe(5)
        expect(n(15).range(10, 0)).toBe(10)
        expect(n(-5).range(10, 0)).toBe(0)
      })

      it('应该处理边界值', () => {
        expect(n(0).range(0, 10)).toBe(0)
        expect(n(10).range(0, 10)).toBe(10)
      })
    })

    describe('max', () => {
      it('应该限制最大值', () => {
        expect(n(5).max(10)).toBe(5)
        expect(n(15).max(10)).toBe(10)
        expect(n(10).max(10)).toBe(10)
      })

      it('应该处理负数', () => {
        expect(n(-5).max(-10)).toBe(-10) // max限制最大值，-5 < -10，所以返回-10
        expect(n(-15).max(-10)).toBe(-15)
      })
    })

    describe('min', () => {
      it('应该限制最小值', () => {
        expect(n(5).min(0)).toBe(5)
        expect(n(-5).min(0)).toBe(0)
        expect(n(0).min(0)).toBe(0)
      })

      it('应该处理负数', () => {
        expect(n(-5).min(-10)).toBe(-5)
        expect(n(-15).min(-10)).toBe(-10)
      })
    })
  })

  describe('$n工具函数', () => {
    describe('formatter', () => {
      it('应该创建数字格式化器', () => {
        const formatter = $n.formatter({ style: 'decimal', precision: 2 })
        expect(formatter.format(1234.5)).toBe('1,234.50')
      })

      it('应该支持货币格式', () => {
        const formatter = $n.formatter({
          style: 'currency',
          currency: 'CNY',
          precision: 2
        })
        expect(formatter.format(1234.5)).toBe('¥1,234.50')
      })

      it('应该支持百分比格式', () => {
        const formatter = $n.formatter({ style: 'percent', precision: 2 })
        expect(formatter.format(0.1234)).toBe('12.34%')
      })

      it('应该支持科学计数法', () => {
        const formatter = $n.formatter({ notation: 'scientific', precision: 2 })
        expect(formatter.format(1234567)).toBe('1.23E6')
      })
    })

    describe('plus', () => {
      it('应该正确相加多个数字', () => {
        expect($n.plus(0.1, 0.2)).toBe(0.3)
        expect($n.plus(1, 2, 3, 4, 5)).toBe(15)
      })

      it('应该处理小数精度问题', () => {
        expect($n.plus(0.1, 0.2)).toBe(0.3)
        expect($n.plus(0.07, 0.01)).toBe(0.08)
      })

      it('应该处理负数', () => {
        expect($n.plus(-1, -2, -3)).toBe(-6)
        expect($n.plus(1, -2, 3)).toBe(2)
      })
    })

    describe('minus', () => {
      it('应该正确相减多个数字', () => {
        expect($n.minus(10, 5)).toBe(5)
        expect($n.minus(10, 2, 3)).toBe(5)
      })

      it('应该处理小数精度问题', () => {
        expect($n.minus(0.3, 0.2)).toBe(0.1)
        expect($n.minus(1.5, 1.2)).toBe(0.3)
      })

      it('应该处理负数', () => {
        expect($n.minus(-10, -5)).toBe(-5)
        expect($n.minus(10, -5)).toBe(15)
      })
    })

    describe('mul', () => {
      it('应该正确相乘两个数字', () => {
        expect($n.mul(2, 3)).toBe(6)
        expect($n.mul(10, 0.5)).toBe(5)
      })

      it('应该处理小数精度问题', () => {
        expect($n.mul(0.1, 0.2)).toBe(0.02)
        expect($n.mul(0.07, 100)).toBe(7)
      })

      it('应该处理负数', () => {
        expect($n.mul(-2, 3)).toBe(-6)
        expect($n.mul(-2, -3)).toBe(6)
      })
    })

    describe('div', () => {
      it('应该正确相除两个数字', () => {
        expect($n.div(6, 2)).toBe(3)
        expect($n.div(10, 4)).toBe(2.5)
      })

      it('应该处理小数精度问题', () => {
        expect($n.div(0.3, 0.1)).toBe(3)
        expect($n.div(0.9, 3)).toBe(0.3)
      })

      it('应该处理负数', () => {
        expect($n.div(-6, 2)).toBe(-3)
        expect($n.div(-6, -2)).toBe(3)
      })
    })

    describe('sum', () => {
      it('应该正确求和', () => {
        expect($n.sum(1, 2, 3, 4, 5)).toBe(15)
        expect($n.sum(0.1, 0.2, 0.3)).toBe(0.6)
      })

      it('应该和plus相同', () => {
        const numbers = [1, 2, 3, 4, 5]
        expect($n.sum(...numbers)).toBe($n.plus(...numbers))
      })
    })

    describe('calc', () => {
      it('应该支持基本算术运算', () => {
        expect($n.calc('1 + 1')).toBe(2)
        expect($n.calc('10 - 2')).toBe(8)
        expect($n.calc('3 * 4')).toBe(12)
        expect($n.calc('10 / 2')).toBe(5)
      })

      it('应该支持运算符优先级', () => {
        expect($n.calc('1 + 2 * 3')).toBe(7)
        expect($n.calc('10 / 2 * 5')).toBe(25) // 从左到右
        expect($n.calc('2 * 3 + 4 * 5')).toBe(26)
      })

      it('应该支持括号', () => {
        expect($n.calc('(1 + 2) * 3')).toBe(9)
        expect($n.calc('1 + 3 * (4 / 2)')).toBe(7)
        expect($n.calc('((1 + 2) * (3 + 4)) / 7')).toBe(3)
      })

      it('应该处理小数精度', () => {
        expect($n.calc('0.1 + 0.2')).toBe(0.3)
        expect($n.calc('1.0 - 0.9')).toBe(0.1)
        expect($n.calc('19.9 * 100')).toBe(1990)
        expect($n.calc('0.3 / 0.1')).toBe(3)
      })

      it('应该处理科学计数法', () => {
        expect($n.calc('1e-7 + 2e-7')).toBe(3e-7)
        expect($n.calc('1.2e3 + 3.4e2')).toBe(1540)
      })

      it('应该忽略空格', () => {
        expect($n.calc(' 1 +   2 ')).toBe(3)
      })
    })
  })
})
