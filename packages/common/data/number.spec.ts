import { n } from "./number"

describe('数字操作', () => {
  it('精度', () => {
    expect(n(1.296).fixed(2)).toBe(1.3)
  })
  it('format(money)', () => {
    expect(n(1234.5678).format('money', 5)).toBe('1,234.56780')
  })
  it('format(cn-money)', () => {
    expect(n(1234.5678).format('cn_money')).toBe('壹仟贰佰叁拾肆元伍角陆分柒毫捌厘')
  })
  it('each', () => {
    let arr: number[] = []
    n(10).each((v)=>{
      arr.push(v)
    })
    expect(arr).toEqual([1,2,3,4,5,6,7,8,9,10])
  })
})