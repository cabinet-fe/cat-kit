import { describe, it, expect, beforeEach } from 'vitest'
import { date, Dater } from '@cat-kit/core/src'

describe('Dater', () => {
  let testDate: Dater

  beforeEach(() => {
    // 使用固定日期确保测试的稳定性
    testDate = new Dater('2024-01-15 10:30:45')
  })

  describe('构造函数', () => {
    it('应该接受 Date 对象', () => {
      const d = new Date('2024-01-15')
      const result = new Dater(d)
      expect(result.raw).toEqual(d)

      d.setFullYear(2025)
      expect(result.year).toBe(2024)
    })

    it('应该接受时间戳', () => {
      const timestamp = Date.now()
      const result = new Dater(timestamp)
      expect(result.timestamp).toBe(timestamp)
    })

    it('应该接受字符串', () => {
      const result = new Dater('2024-01-15')
      expect(result.year).toBe(2024)
      expect(result.month).toBe(1)
      expect(result.day).toBe(15)
    })

    it('应该接受另一个 Dater 实例', () => {
      const original = new Dater('2024-01-15')
      const copy = new Dater(original)
      expect(copy.timestamp).toBe(original.timestamp)
    })
  })

  describe('不可变操作与起止对齐', () => {
    it('add 方法族不会修改原始实例', () => {
      const base = date('2024-01-15')
      const nextDay = base.addDays(1)
      const nextWeek = base.addWeeks(1)
      const nextMonth = base.addMonths(1)
      const nextYear = base.addYears(1)

      expect(base.day).toBe(15)
      expect(nextDay.day).toBe(16)
      expect(nextWeek.day).toBe(22)
      expect(nextMonth.month).toBe(2)
      expect(nextYear.year).toBe(2025)
    })

    it('startOf 与 endOf day', () => {
      const d = date('2024-03-15 10:20:30')
      expect(d.startOf('day').format('yyyy-MM-dd HH:mm:ss')).toBe(
        '2024-03-15 00:00:00'
      )
      expect(d.endOf('day').format('yyyy-MM-dd HH:mm:ss')).toBe(
        '2024-03-15 23:59:59'
      )
    })

    it('startOf 与 endOf week (周一为一周开始)', () => {
      const sunday = date('2024-01-14 12:00:00') // 周日
      expect(sunday.startOf('week').format('yyyy-MM-dd HH:mm:ss')).toBe(
        '2024-01-08 00:00:00'
      )
      expect(sunday.endOf('week').format('yyyy-MM-dd HH:mm:ss')).toBe(
        '2024-01-14 23:59:59'
      )
    })

    it('startOf 与 endOf month/year', () => {
      const d = date('2024-02-15 10:00:00')
      expect(d.startOf('month').format('yyyy-MM-dd HH:mm:ss')).toBe(
        '2024-02-01 00:00:00'
      )
      expect(d.endOf('month').format('yyyy-MM-dd HH:mm:ss')).toBe(
        '2024-02-29 23:59:59'
      )
      expect(d.startOf('year').format('yyyy-MM-dd HH:mm:ss')).toBe(
        '2024-01-01 00:00:00'
      )
      expect(d.endOf('year').format('yyyy-MM-dd HH:mm:ss')).toBe(
        '2024-12-31 23:59:59'
      )
    })
  })

  describe('getter 属性', () => {
    it('应该返回正确的年份', () => {
      expect(testDate.year).toBe(2024)
    })

    it('应该返回正确的月份（从1开始）', () => {
      expect(testDate.month).toBe(1)
    })

    it('应该返回正确的日期', () => {
      expect(testDate.day).toBe(15)
    })

    it('应该返回正确的小时', () => {
      expect(testDate.hours).toBe(10)
    })

    it('应该返回正确的分钟', () => {
      expect(testDate.minutes).toBe(30)
    })

    it('应该返回正确的秒数', () => {
      expect(testDate.seconds).toBe(45)
    })

    it('应该返回正确的星期', () => {
      // 2024-01-15 是星期一
      expect(testDate.weekDay).toBe(1)
    })

    it('应该返回正确的时间戳', () => {
      const expected = new Date('2024-01-15 10:30:45').getTime()
      expect(testDate.timestamp).toBe(expected)
    })
  })

  describe('setter 方法', () => {
    it('应该设置年份', () => {
      const result = testDate.setYear(2025)
      expect(result.year).toBe(2025)
      expect(result).toBe(testDate) // 返回自身用于链式调用
    })

    it('应该设置月份', () => {
      const result = testDate.setMonth(12)
      expect(result.month).toBe(12)
      expect(result).toBe(testDate)
    })

    it('应该设置日期', () => {
      const result = testDate.setDay(31)
      expect(result.day).toBe(31)
      expect(result).toBe(testDate)
    })

    it('应该设置小时', () => {
      const result = testDate.setHours(23)
      expect(result.hours).toBe(23)
      expect(result).toBe(testDate)
    })

    it('应该设置分钟', () => {
      const result = testDate.setMinutes(59)
      expect(result.minutes).toBe(59)
      expect(result).toBe(testDate)
    })

    it('应该设置秒数', () => {
      const result = testDate.setSeconds(59)
      expect(result.seconds).toBe(59)
      expect(result).toBe(testDate)
    })

    it('应该设置时间戳', () => {
      const newTimestamp = Date.now()
      const result = testDate.setTime(newTimestamp)
      expect(result.timestamp).toBe(newTimestamp)
      expect(result).toBe(testDate)
    })
  })

  describe('format 方法', () => {
    it('应该格式化为默认格式', () => {
      expect(testDate.format()).toBe('2024-01-15')
    })

    it('应该格式化年份', () => {
      expect(testDate.format('yyyy')).toBe('2024')
      expect(testDate.format('YYYY')).toBe('2024')
    })

    it('应该格式化月份', () => {
      expect(testDate.format('M')).toBe('1')
      expect(testDate.format('MM')).toBe('01')
    })

    it('应该格式化日期', () => {
      expect(testDate.format('d')).toBe('15')
      expect(testDate.format('dd')).toBe('15')
      expect(testDate.format('D')).toBe('15')
      expect(testDate.format('DD')).toBe('15')
    })

    it('应该格式化小时', () => {
      expect(testDate.format('H')).toBe('10')
      expect(testDate.format('HH')).toBe('10')
      expect(testDate.format('h')).toBe('10')
      expect(testDate.format('hh')).toBe('10')
    })

    it('应该处理12小时制', () => {
      const afternoonDate = new Dater('2024-01-15 14:30:45')
      expect(afternoonDate.format('h')).toBe('2')
      expect(afternoonDate.format('hh')).toBe('02')
    })

    it('应该格式化分钟和秒', () => {
      expect(testDate.format('m')).toBe('30')
      expect(testDate.format('mm')).toBe('30')
      expect(testDate.format('s')).toBe('45')
      expect(testDate.format('ss')).toBe('45')
    })

    it('应该格式化完整的日期时间', () => {
      expect(testDate.format('yyyy-MM-dd HH:mm:ss')).toBe('2024-01-15 10:30:45')
    })

    it('应该支持多次占位符和 UTC 选项', () => {
      const utcDate = new Dater(new Date(Date.UTC(2024, 0, 1, 23, 5, 9)))
      expect(utcDate.format('yyyy-MM-dd HH:mm:ss HH', { utc: true })).toBe(
        '2024-01-01 23:05:09 23'
      )
    })
  })

  describe('calc 方法', () => {
    it('应该计算天数偏移', () => {
      const future = testDate.calc(5, 'days')
      expect(future.day).toBe(20)
      expect(future.month).toBe(1)
      expect(future.year).toBe(2024)

      const past = testDate.calc(-5, 'days')
      expect(past.day).toBe(10)
      expect(past.month).toBe(1)
      expect(past.year).toBe(2024)
    })

    it('应该计算周偏移', () => {
      const future = testDate.calc(2, 'weeks')
      expect(future.day).toBe(29)
      expect(future.month).toBe(1)
      expect(future.year).toBe(2024)
    })

    it('应该计算月偏移', () => {
      const future = testDate.calc(2, 'months')
      expect(future.month).toBe(3)
      expect(future.year).toBe(2024)
      expect(future.day).toBe(15)

      const past = testDate.calc(-2, 'months')
      expect(past.month).toBe(11)
      expect(past.year).toBe(2023)
      expect(past.day).toBe(15)
    })

    it('应该计算年偏移', () => {
      const future = testDate.calc(3, 'years')
      expect(future.year).toBe(2027)
      expect(future.month).toBe(1)
      expect(future.day).toBe(15)

      const past = testDate.calc(-1, 'years')
      expect(past.year).toBe(2023)
      expect(past.month).toBe(1)
      expect(past.day).toBe(15)
    })

    it('应该默认按天计算', () => {
      const future = testDate.calc(7)
      expect(future.day).toBe(22)
    })
  })

  describe('compare 方法', () => {
    it('应该比较两个日期并返回天数差', () => {
      const laterDate = new Date('2024-01-20')
      const diff = testDate.compare(laterDate)
      expect(diff).toBe(-4) // 5天后

      const earlierDate = new Date('2024-01-10')
      const diff2 = testDate.compare(earlierDate)
      expect(diff2).toBe(5) // 5天前
    })

    it('应该支持自定义减少器', () => {
      const laterDate = new Date('2024-01-20 10:30:45') // 使用相同的时间避免部分小时差异
      const hoursDiff = testDate.compare(laterDate, timeDiff =>
        Math.floor(timeDiff / (1000 * 60 * 60))
      )
      expect(hoursDiff).toBe(-120) // 120小时后
    })

    it('应该比较相同日期', () => {
      const sameDate = new Date(testDate.timestamp)
      expect(testDate.compare(sameDate)).toBe(0)
    })
  })

  describe('diff / 判定类方法', () => {
    it('应该支持多单位 diff', () => {
      const left = date('2024-01-02 00:00:00')
      const right = date('2024-01-01 00:00:00')

      expect(left.diff(right, 'milliseconds')).toBe(86400000)
      expect(left.diff(right, 'days')).toBe(1)
      expect(left.diff(right, 'weeks', { float: true })).toBe(1 / 7)
      expect(left.diff(right, 'months')).toBe(0)

      const monthDiff = date('2024-03-31').diff(date('2024-02-29'), 'months')
      expect(monthDiff).toBe(1)

      const negativeMonthDiff = date('2024-02-15').diff(
        date('2024-03-15'),
        'months'
      )
      expect(negativeMonthDiff).toBe(-1)
    })

    it('应该支持绝对值与 isBetween', () => {
      const target = date('2024-01-15')
      const start = date('2024-01-10')
      const end = date('2024-01-20')

      expect(target.diff(end, 'days', { absolute: true })).toBe(5)
      expect(target.isBetween(start, end)).toBe(true)
      expect(target.isBetween(end, start)).toBe(true)
      expect(target.isBetween(start, end, { inclusive: '()' })).toBe(true)
      expect(start.isBetween(start, end, { inclusive: '()' })).toBe(false)
    })

    it('应该判断同日/同月/同年与周末、闰年', () => {
      const d = date('2024-02-29')
      expect(d.isLeapYear()).toBe(true)
      expect(d.isWeekend()).toBe(false)
      expect(d.isSameDay(date('2024-02-29 12:00:00'))).toBe(true)
      expect(d.isSameMonth(date('2024-02-01'))).toBe(true)
      expect(d.isSameYear(date('2024-12-01'))).toBe(true)
    })
  })

  describe('parse', () => {
    it('应该按格式解析字符串', () => {
      const parsed = Dater.parse('2024-03-05 14:20:10', 'yyyy-MM-dd HH:mm:ss')
      expect(parsed.year).toBe(2024)
      expect(parsed.month).toBe(3)
      expect(parsed.day).toBe(5)
      expect(parsed.hours).toBe(14)
      expect(parsed.minutes).toBe(20)
      expect(parsed.seconds).toBe(10)
    })

    it('应该支持 UTC 解析', () => {
      const parsed = Dater.parse('2024-01-01 00:00:00', 'yyyy-MM-dd HH:mm:ss', {
        utc: true
      })
      expect(parsed.format('yyyy-MM-dd HH:mm:ss', { utc: true })).toBe(
        '2024-01-01 00:00:00'
      )
    })

    it('无效日期应返回 Invalid Date（不抛错）', () => {
      const parsed = Dater.parse('2024-02-30', 'yyyy-MM-dd')
      expect(Number.isNaN(parsed.timestamp)).toBe(true)
    })
  })
})

describe('date 工厂函数', () => {
  it('应该创建 Dater 实例', () => {
    const result = date('2024-01-15')
    expect(result).toBeInstanceOf(Dater)
    expect(result.year).toBe(2024)
  })

  it('应该处理无参数调用', () => {
    const result = date()
    expect(result).toBeInstanceOf(Dater)
    // 应该是当前时间，这里只检查是否为有效日期
    expect(result.year).toBeGreaterThan(2020)
  })
})
