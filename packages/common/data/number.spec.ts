import { n } from "./number"

describe('数字操作', () => {
  it('精度', () => {
    expect(n(1.296).fixed(2)).toBe(1.3)
  })
  it('currency("CNY")', () => {
    expect(n(1234.5678).currency('CNY', 5)).toBe('1,234.56780')
    expect(n(1234.5678).currency('CNY', {
      precision: 2
    })).toBe('1,234.57')
    expect(n(1234.5678).currency('CNY', {
      minPrecision: 2
    })).toBe('1,234.5678')
    expect(n(1234.5678).currency('CNY', {
      maxPrecision: 2
    })).toBe('1,234.57')
    expect(n(1234.5678).currency('CNY', {
      maxPrecision: 3
    })).toBe('1,234.568')
  })
  it('currency("RMB_HAN")', () => {
    expect(n(1234.5678).currency('CNY_HAN')).toBe('壹仟贰佰叁拾肆元伍角陆分柒毫捌厘')
  })
  it('each', () => {
    let arr: number[] = []
    n(10).each((v)=>{
      arr.push(v)
    })
    expect(arr).toEqual([1,2,3,4,5,6,7,8,9,10])
  })

  // test('计算表达式', () => {
  //   console.log(n.calc('10 + (5 / 2 + 3) / 4'))
  //   expect(n.calc('10 + (5 / 2 + 3) / 4')).toBe(10 + (5 / 2 + 3) / 4)
  // })
})