import { date, type Dater } from './date'

describe('日期测试', () => {
  let today = new Date()
  let y = today.getFullYear()
  let m = today.getMonth() + 1
  let d = today.getDate()

  it('以默认的匹配器进行日期格式化', () => {
    let ymd = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`
    let ymd2 = `${y}/${m < 10 ? '0' + m : m}/${d < 10 ? '0' + d : d}`

    expect(date().format()).toBe(ymd)
    expect(date().format('yyyy/MM/dd')).toBe(ymd2)
    expect(date('2020-01-01').format('yyyy/MM/dd')).toBe('2020/01/01')
    expect(date('2020-01-01').format('yyyy-M-d hh:m:ss')).toBe(
      '2020-1-1 08:0:00'
    )
  })

  it('计算相对此刻日期', () => {
    expect(date('2022-02-14').calc(10, 'days').format()).toBe('2022-02-24')
    expect(date('2022-02-14').calc(-10, 'days').format()).toBe('2022-02-04')
    expect(date('2022-02-14').calc(10, 'months').format()).toBe('2022-12-14')
    expect(date('2022-02-14').calc(10, 'weeks').format()).toBe('2022-04-25')
    expect(date('2022-02-14').calc(10, 'years').format()).toBe('2032-02-14')
  })

  it('设置匹配器', () => {
    date.setMatcher('w+', (date: Dater, len: number) => {
      if (len === 1) {
        return date.weekDay + ''
      } else {
        return '0' + date.weekDay
      }
    })
    expect(date('2022-02-14').format('w')).toBe('1')
    expect(date('2022-02-14').format('ww')).toBe('01')
  })

  it('日期差', () => {
    expect(date('2022-02-14').compare('2022-02-14 01:00:00')).toBe(1)
    expect(date('2022-02-14').compare('2022-02-15 01:00:00')).toBe(1)
    expect(date('2022-02-14').compare('2022-02-16 23:59:59')).toBe(3)

    expect(
      date('2022-02-14').compare('2021-01-13', (y, m, d) => {
        return `${y}年${m}个月${d}天`
      })
    ).toBe('1年1个月1天')
  })

  it('日期单位', () => {
    let d = date('2022-02-14 01:02:03')
    expect(d.year).toBe(2022)
    expect(d.month).toBe(2)
    expect(d.day).toBe(14)
    expect(d.hour).toBe(1)
    expect(d.minute).toBe(2)
    expect(d.second).toBe(3)
  })

  it('跳转到月末', () => {
    expect(date('2022-10-05').toEndOfMonth().day).toBe(31)
  })

  it('获取一个月的天数', () => {
    expect(date('2024-04-19').getDays()).toBe(30)
    expect(date('2024-03-01').getDays()).toBe(31)
    expect(date('2024-04-11').getDays()).toBe(30)
  })

})
