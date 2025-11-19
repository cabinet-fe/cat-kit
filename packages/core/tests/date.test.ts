import { describe, it, expect, beforeEach } from 'vitest'
import { date, Dater } from '../src/date/date'

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
      expect(diff).toBe(-5) // 5天后

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
