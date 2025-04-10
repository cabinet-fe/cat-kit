import { describe, expect, test, beforeEach } from 'bun:test'
import { date } from '../../src/date/date'

describe('日期工具函数测试', () => {
  describe('date 基本功能', () => {
    test('应该创建一个日期对象', () => {
      const d = date('2023-01-01')
      expect(d.year).toBe(2023)
      expect(d.month).toBe(1)
      expect(d.day).toBe(1)
    })

    test('应该支持多种输入格式', () => {
      // 时间戳
      const d1 = date(new Date(2023, 0, 1).getTime())
      expect(d1.year).toBe(2023)
      expect(d1.month).toBe(1)
      expect(d1.day).toBe(1)

      // Date 对象
      const d2 = date(new Date(2023, 0, 1))
      expect(d2.year).toBe(2023)
      expect(d2.month).toBe(1)
      expect(d2.day).toBe(1)

      // 日期字符串
      const d3 = date('2023/01/01')
      expect(d3.year).toBe(2023)
      expect(d3.month).toBe(1)
      expect(d3.day).toBe(1)
    })
  })

  describe('日期格式化', () => {
    test('应该正确格式化日期', () => {
      const d = date('2023-01-01')

      expect(d.format('yyyy-MM-dd')).toBe('2023-01-01')
      expect(d.format('yyyy/MM/dd')).toBe('2023/01/01')
      expect(d.format('yyyy年MM月dd日')).toBe('2023年01月01日')
    })
  })

  describe('日期计算', () => {
    test('应该能够进行日期计算', () => {
      const d = date('2023-01-01')

      // 加5天
      const d1 = d.calc(5, 'days')
      expect(d1.format('yyyy-MM-dd')).toBe('2023-01-06')

      // 加1个月
      const d2 = d.calc(1, 'months')
      expect(d2.format('yyyy-MM-dd')).toBe('2023-02-01')

      // 加1年
      const d3 = d.calc(1, 'years')
      expect(d3.format('yyyy-MM-dd')).toBe('2024-01-01')
    })
  })

  describe('日期比较', () => {
    test('应该能够比较两个日期', () => {
      const d1 = date('2023-01-01')
      const d2 = date('2023-01-02')

      // 比较并获取年月日的差值
      const diff = d1.compare(d2, (year, month, day) => {
        return { year, month, day }
      })

      expect(diff.year).toBe(0)
      expect(diff.month).toBe(0)
      expect(diff.day).toBe(-1) // d1比d2早1天
    })
  })
})
