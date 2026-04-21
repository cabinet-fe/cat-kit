import { Big, createBigConstructor } from '@cat-kit/core'
import { beforeEach, describe, expect, it } from 'vitest'

const DEFAULTS = { DP: Big.DP, RM: Big.RM, NE: Big.NE, PE: Big.PE }

function resetBigDefaults() {
  Big.DP = DEFAULTS.DP
  Big.RM = DEFAULTS.RM
  Big.NE = DEFAULTS.NE
  Big.PE = DEFAULTS.PE
}

describe('Big 高精度专项测试', () => {
  beforeEach(() => {
    resetBigDefaults()
  })

  describe('构造与解析', () => {
    it('支持 string / number / bigint / Big 输入', () => {
      expect(new Big('123.45').toString()).toBe('123.45')
      expect(new Big(123.45).toString()).toBe('123.45')
      expect(new Big(123n).toString()).toBe('123')

      const source = new Big('9.99')
      const copy = new Big(source)
      expect(copy.toString()).toBe('9.99')

      source.plus('1')
      expect(copy.toString()).toBe('9.99')
    })

    it('支持科学计数法与前后导零', () => {
      expect(new Big('00123.4500').toString()).toBe('123.45')
      expect(new Big('1e+3').toString()).toBe('1000')
      expect(new Big('1.23e-2').toString()).toBe('0.0123')
    })

    it('非法输入应抛错', () => {
      expect(() => new Big('abc')).toThrow('[big.js] Invalid number')
    })

    it('正确处理负零符号输出', () => {
      const n = new Big(-0)
      expect(n.toString()).toBe('0')
      expect(n.valueOf()).toBe('-0')
      expect(new Big('-0.1').toFixed(0)).toBe('-0')
      expect(new Big('-0.01').toFixed(1)).toBe('-0.0')
    })
  })

  describe('比较与符号', () => {
    it('cmp/eq/gt/gte/lt/lte 行为正确', () => {
      const a = new Big('2')
      const b = new Big('1.999')
      const c = new Big('2.000')

      expect(a.cmp(b)).toBe(1)
      expect(a.cmp(c)).toBe(0)
      expect(b.cmp(a)).toBe(-1)

      expect(a.eq(c)).toBe(true)
      expect(a.gt(b)).toBe(true)
      expect(a.gte(c)).toBe(true)
      expect(b.lt(a)).toBe(true)
      expect(b.lte(a)).toBe(true)
    })

    it('abs/neg 正确处理符号', () => {
      expect(new Big('-12.3').abs().toString()).toBe('12.3')
      expect(new Big('12.3').neg().toString()).toBe('-12.3')
      expect(new Big('-12.3').neg().toString()).toBe('12.3')
    })
  })

  describe('四则运算与取模', () => {
    it('plus/minus/add/sub 结果正确', () => {
      expect(new Big('0.1').plus('0.2').toString()).toBe('0.3')
      expect(new Big('1').minus('0.9').toString()).toBe('0.1')
      expect(new Big('1').add('2').toString()).toBe('3')
      expect(new Big('1').sub('2').toString()).toBe('-1')
    })

    it('times/mul 结果正确', () => {
      expect(new Big('19.9').times('100').toString()).toBe('1990')
      expect(new Big('-2').mul('3').toString()).toBe('-6')
    })

    it('div 在常见小数场景稳定', () => {
      expect(new Big('1').div('8').toString()).toBe('0.125')
      expect(new Big('1').div('3').toString()).toBe('0.33333333333333333333')

      Big.DP = 2
      Big.RM = Big.roundDown
      expect(new Big('1').div('6').toString()).toBe('0.16')

      Big.RM = Big.roundHalfUp
      expect(new Big('1').div('6').toString()).toBe('0.17')
    })

    it('mod 结果与符号正确', () => {
      expect(new Big('10').mod('3').toString()).toBe('1')
      expect(new Big('-10').mod('3').toString()).toBe('-1')
      expect(new Big('10').mod('-3').toString()).toBe('1')
    })

    it('除零与模零抛错', () => {
      expect(() => new Big('1').div('0')).toThrow('[big.js] Division by zero')
      expect(() => new Big('1').mod('0')).toThrow('[big.js] Division by zero')
    })

    it('运算不应污染原对象', () => {
      const a = new Big('1.23')
      const b = new Big('4.56')

      const c = a.plus(b)
      expect(a.toString()).toBe('1.23')
      expect(b.toString()).toBe('4.56')
      expect(c.toString()).toBe('5.79')
    })
  })

  describe('幂、开方与舍入', () => {
    it('pow 支持正指数、零指数、负指数', () => {
      expect(new Big('2').pow(10).toString()).toBe('1024')
      expect(new Big('2').pow(0).toString()).toBe('1')
      expect(new Big('2').pow(-3).toString()).toBe('0.125')
    })

    it('pow 非法指数应抛错', () => {
      expect(() => new Big('2').pow(1.1)).toThrow('[big.js] Invalid exponent')
      expect(() => new Big('2').pow(1000001)).toThrow('[big.js] Invalid exponent')
    })

    it('sqrt 正常计算与异常分支', () => {
      expect(new Big('9').sqrt().toString()).toBe('3')

      Big.DP = 8
      expect(new Big('2').sqrt().toString()).toBe('1.41421356')

      expect(() => new Big('-1').sqrt()).toThrow('[big.js] No square root')
    })

    it('prec/round 支持多种舍入模式', () => {
      expect(new Big('12345.6789').prec(4).toString()).toBe('12350')
      expect(new Big('1.005').round(2, Big.roundHalfUp).toString()).toBe('1.01')
      expect(new Big('1.005').round(2, Big.roundDown).toString()).toBe('1')
      expect(new Big('2.5').round(0, Big.roundHalfEven).toString()).toBe('2')
      expect(new Big('3.5').round(0, Big.roundHalfEven).toString()).toBe('4')
    })
  })

  describe('格式化与转换', () => {
    it('toFixed/toExponential/toPrecision 行为正确', () => {
      expect(new Big('1.2').toFixed(4)).toBe('1.2000')
      expect(new Big('12345').toExponential(2)).toBe('1.23e+4')

      expect(new Big('12345').toPrecision()).toBe('12345')
      expect(new Big('12345').toPrecision(3)).toBe('1.23e+4')
      expect(new Big('0.00012345').toPrecision(2)).toBe('0.00012')
    })

    it('toString 受 NE/PE 阈值控制', () => {
      Big.NE = -3
      Big.PE = 3

      expect(new Big('0.001').toString()).toBe('1e-3')
      expect(new Big('0.0001').toString()).toBe('1e-4')
      expect(new Big('999').toString()).toBe('999')
      expect(new Big('1000').toString()).toBe('1e+3')
    })

    it('toNumber 转为原生 number', () => {
      expect(new Big('123.45').toNumber()).toBe(123.45)
      expect(new Big('0').toNumber()).toBe(0)
    })

    it('toJSON 应与 toString 一致', () => {
      const n = new Big('123.45')
      expect(n.toJSON()).toBe('123.45')
      expect(JSON.stringify({ n })).toBe('{"n":"123.45"}')
    })
  })

  describe('副作用与隔离配置', () => {
    it('mod 与 sqrt 不应泄漏 DP/RM 修改', () => {
      Big.DP = 7
      Big.RM = Big.roundUp

      new Big('10').mod('3')
      expect(Big.DP).toBe(7)
      expect(Big.RM).toBe(Big.roundUp)

      new Big('2').sqrt()
      expect(Big.DP).toBe(7)
      expect(Big.RM).toBe(Big.roundUp)
    })

    it('createBigConstructor 应创建互不影响的配置实例', () => {
      const BigA = createBigConstructor()
      const BigB = createBigConstructor()

      BigA.DP = 2
      BigB.DP = 6

      expect(new BigA('1').div('3').toString()).toBe('0.33')
      expect(new BigB('1').div('3').toString()).toBe('0.333333')

      // 全局 Big 配置不应被隔离构造器影响
      expect(Big.DP).toBe(DEFAULTS.DP)
    })
  })
})
