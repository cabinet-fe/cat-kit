import { n } from './number'

describe('数字操作', () => {
  test('精度', () => {
    expect(n(1.296).fixed(2)).toBe('1.30')
    expect(n(1.255).fixed(2)).toBe('1.26')
    expect(n(1).fixed(2)).toBe('1.00')
    expect(n(-0.0009999999999998899).fixed({ maxPrecision: 3 })).toBe('-0.001')
    expect(n(-0.0001).fixed({ maxPrecision: 3 })).toBe('-0')
    expect(n(2.999).fixed({ maxPrecision: 2 })).toBe('3')
    expect(n(2.999).fixed({ maxPrecision: 0 })).toBe('3')
  })
  test('currency("CNY")', () => {
    expect(n(1234.03123).currency('CNY', 2)).toBe('1,234.03')
    expect(n(1234.5678).currency('CNY', 5)).toBe('1,234.56780')
    expect(
      n(1.245).currency('CNY', {
        precision: 2
      })
    ).toBe('1.25')
    expect(
      n(1234.5678).currency('CNY', {
        minPrecision: 2
      })
    ).toBe('1,234.5678')
    expect(
      n(1234.5678).currency('CNY', {
        maxPrecision: 2
      })
    ).toBe('1,234.57')

    expect(
      n(1234.0000001).currency('CNY', {
        maxPrecision: 6
      })
    ).toBe('1,234')
    expect(
      n(1234.1200001).currency('CNY', {
        maxPrecision: 6
      })
    ).toBe('1,234.12')
    expect(
      n(1234.5678).currency('CNY', {
        maxPrecision: 3,
        minPrecision: 1
      })
    ).toBe('1,234.568')
    expect(
      n(1234).currency('CNY', {
        maxPrecision: 3,
        minPrecision: 1
      })
    ).toBe('1,234.0')
  })
  test('currency("RMB_HAN")', () => {
    expect(n(1234.5678).currency('CNY_HAN')).toBe(
      '壹仟贰佰叁拾肆元伍角陆分柒毫捌厘'
    )
  })
  test('each', () => {
    let arr: number[] = []
    n(10).each(v => {
      arr.push(v)
    })
    expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  test('多数相加', () => {
    expect(n.plus(0.1, 0.2, 3, 100)).toBe(103.3)
  })

  test('多数相减', () => {
    expect(n.minus(8.12, 1, 10)).toBe(-2.88)
  })

  test('两数相乘', () => {
    expect(n.mul(8.12, 100)).toBe(812)
  })

  test('两数相除', () => {
    expect(n.div(1.1, 5)).toBe(0.22)
  })

  test('组合运算', () => {
    expect(
      n.plus(0.1, n.minus(0.3, 0.1), n.mul(8.12, 100), n.div(1.1, 5))
    ).toBe(812.52)
  })

  // test('计算表达式', () => {
  //   console.log(n.calc('10 + (5 / 2 + 3) / 4'))
  //   expect(n.calc('10 + (5 / 2 + 3) / 4')).toBe(10 + (5 / 2 + 3) / 4)
  // })

  test('大小限制', () => {
    expect(n(100).range(0, 50)).toBe(50)
    expect(n(-1).range(0, 50)).toBe(0)
    expect(n(30).range(0, 50)).toBe(30)

    expect(n(50).max(10)).toBe(10)
    expect(n(5).max(10)).toBe(5)

    expect(n(50).min(10)).toBe(50)
    expect(n(5).min(10)).toBe(10)
  })
})
