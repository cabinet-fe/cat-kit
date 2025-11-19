import { describe, it, expect } from 'vitest'
import {
  columnLetterToIndex,
  columnIndexToLetter,
  parseAddress,
  formatAddress,
  parseRange,
  formatRange,
  pixelsToExcelWidth,
  excelWidthToPixels
} from '../src/helpers/address'

describe('地址辅助函数', () => {
  describe('columnLetterToIndex', () => {
    it('应该转换单字母列', () => {
      expect(columnLetterToIndex('A')).toBe(0)
      expect(columnLetterToIndex('B')).toBe(1)
      expect(columnLetterToIndex('Z')).toBe(25)
    })

    it('应该转换双字母列', () => {
      expect(columnLetterToIndex('AA')).toBe(26)
      expect(columnLetterToIndex('AB')).toBe(27)
      expect(columnLetterToIndex('AZ')).toBe(51)
      expect(columnLetterToIndex('BA')).toBe(52)
    })

    it('应该转换三字母列', () => {
      expect(columnLetterToIndex('AAA')).toBe(702)
      expect(columnLetterToIndex('ZZZ')).toBe(18277)
    })
  })

  describe('columnIndexToLetter', () => {
    it('应该转换单字母列索引', () => {
      expect(columnIndexToLetter(0)).toBe('A')
      expect(columnIndexToLetter(1)).toBe('B')
      expect(columnIndexToLetter(25)).toBe('Z')
    })

    it('应该转换双字母列索引', () => {
      expect(columnIndexToLetter(26)).toBe('AA')
      expect(columnIndexToLetter(27)).toBe('AB')
      expect(columnIndexToLetter(51)).toBe('AZ')
      expect(columnIndexToLetter(52)).toBe('BA')
    })

    it('应该转换三字母列索引', () => {
      expect(columnIndexToLetter(702)).toBe('AAA')
    })

    it('应该与 columnLetterToIndex 互为逆操作', () => {
      for (let i = 0; i < 1000; i++) {
        const letter = columnIndexToLetter(i)
        expect(columnLetterToIndex(letter)).toBe(i)
      }
    })
  })

  describe('parseAddress', () => {
    it('应该解析 A1 格式地址', () => {
      expect(parseAddress('A1')).toEqual({ row: 0, column: 0 })
      expect(parseAddress('B2')).toEqual({ row: 1, column: 1 })
      expect(parseAddress('Z26')).toEqual({ row: 25, column: 25 })
    })

    it('应该解析双字母列地址', () => {
      expect(parseAddress('AA1')).toEqual({ row: 0, column: 26 })
      expect(parseAddress('AB10')).toEqual({ row: 9, column: 27 })
    })

    it('应该解析大行号', () => {
      expect(parseAddress('A100')).toEqual({ row: 99, column: 0 })
      expect(parseAddress('A1000')).toEqual({ row: 999, column: 0 })
    })

    it('无效格式应该抛出错误', () => {
      expect(() => parseAddress('invalid')).toThrow('无效的单元格地址')
      expect(() => parseAddress('1A')).toThrow('无效的单元格地址')
      expect(() => parseAddress('A')).toThrow('无效的单元格地址')
      expect(() => parseAddress('123')).toThrow('无效的单元格地址')
    })

    it('行号为 0 应该抛出错误', () => {
      expect(() => parseAddress('A0')).toThrow('无效的行号')
    })

    it('负数行号应该抛出错误', () => {
      expect(() => parseAddress('A-1')).toThrow('无效的单元格地址')
    })
  })

  describe('formatAddress', () => {
    it('应该格式化地址对象', () => {
      expect(formatAddress({ row: 0, column: 0 })).toBe('A1')
      expect(formatAddress({ row: 1, column: 1 })).toBe('B2')
      expect(formatAddress({ row: 25, column: 25 })).toBe('Z26')
    })

    it('应该格式化双字母列地址', () => {
      expect(formatAddress({ row: 0, column: 26 })).toBe('AA1')
      expect(formatAddress({ row: 9, column: 27 })).toBe('AB10')
    })

    it('应该格式化大行号', () => {
      expect(formatAddress({ row: 99, column: 0 })).toBe('A100')
      expect(formatAddress({ row: 999, column: 0 })).toBe('A1000')
    })

    it('应该与 parseAddress 互为逆操作', () => {
      const addresses = ['A1', 'B2', 'Z26', 'AA1', 'AB10', 'ZZ100']
      for (const addr of addresses) {
        expect(formatAddress(parseAddress(addr))).toBe(addr)
      }
    })
  })

  describe('parseRange', () => {
    it('应该解析范围', () => {
      expect(parseRange('A1:B2')).toEqual({
        start: { row: 0, column: 0 },
        end: { row: 1, column: 1 }
      })

      expect(parseRange('A1:Z26')).toEqual({
        start: { row: 0, column: 0 },
        end: { row: 25, column: 25 }
      })
    })

    it('应该解析大范围', () => {
      expect(parseRange('AA10:ZZ100')).toEqual({
        start: { row: 9, column: 26 },
        end: { row: 99, column: 701 }
      })
    })

    it('无效格式应该抛出错误', () => {
      expect(() => parseRange('A1')).toThrow('无效的范围格式')
      expect(() => parseRange('A1:B2:C3')).toThrow('无效的范围格式')
      expect(() => parseRange('invalid')).toThrow()
    })

    it('起始位置在结束位置之后应该抛出错误', () => {
      expect(() => parseRange('B2:A1')).toThrow('无效的范围: 起始位置必须在结束位置之前')
      expect(() => parseRange('A2:A1')).toThrow('无效的范围: 起始位置必须在结束位置之前')
    })
  })

  describe('formatRange', () => {
    it('应该格式化范围对象', () => {
      expect(formatRange({
        start: { row: 0, column: 0 },
        end: { row: 1, column: 1 }
      })).toBe('A1:B2')

      expect(formatRange({
        start: { row: 0, column: 0 },
        end: { row: 25, column: 25 }
      })).toBe('A1:Z26')
    })

    it('应该格式化大范围', () => {
      expect(formatRange({
        start: { row: 9, column: 26 },
        end: { row: 99, column: 51 }
      })).toBe('AA10:AZ100')
    })

    it('应该与 parseRange 互为逆操作', () => {
      const ranges = ['A1:B2', 'A1:Z26', 'AA10:AZ100']
      for (const range of ranges) {
        expect(formatRange(parseRange(range))).toBe(range)
      }
    })
  })

  describe('pixelsToExcelWidth', () => {
    it('应该转换像素为 Excel 列宽', () => {
      expect(pixelsToExcelWidth(70)).toBe(10) // 70 / 7 = 10
      expect(pixelsToExcelWidth(140)).toBe(20) // 140 / 7 = 20
      expect(pixelsToExcelWidth(210)).toBe(30) // 210 / 7 = 30
    })

    it('应该四舍五入', () => {
      expect(pixelsToExcelWidth(73)).toBe(10) // 73 / 7 ≈ 10.4 -> 10
      expect(pixelsToExcelWidth(76)).toBe(11) // 76 / 7 ≈ 10.9 -> 11
    })

    it('应该限制在最小值 1', () => {
      expect(pixelsToExcelWidth(0)).toBe(1)
      expect(pixelsToExcelWidth(1)).toBe(1)
      expect(pixelsToExcelWidth(3)).toBe(1)
    })

    it('应该限制在最大值 255', () => {
      expect(pixelsToExcelWidth(2000)).toBe(255)
      expect(pixelsToExcelWidth(10000)).toBe(255)
    })
  })

  describe('excelWidthToPixels', () => {
    it('应该转换 Excel 列宽为像素', () => {
      expect(excelWidthToPixels(10)).toBe(70) // 10 * 7 = 70
      expect(excelWidthToPixels(20)).toBe(140) // 20 * 7 = 140
      expect(excelWidthToPixels(30)).toBe(210) // 30 * 7 = 210
    })

    it('应该处理小数', () => {
      expect(excelWidthToPixels(10.5)).toBe(74) // 10.5 * 7 = 73.5 -> 74
    })

    it('应该处理极端值', () => {
      expect(excelWidthToPixels(0)).toBe(0)
      expect(excelWidthToPixels(1)).toBe(7)
      expect(excelWidthToPixels(255)).toBe(1785)
    })

    it('与 pixelsToExcelWidth 应该大致可逆', () => {
      // 由于四舍五入，不是完全可逆，但应该接近
      const widths = [10, 20, 30, 50, 100]
      for (const width of widths) {
        const pixels = excelWidthToPixels(width)
        const backToWidth = pixelsToExcelWidth(pixels)
        expect(Math.abs(backToWidth - width)).toBeLessThanOrEqual(1)
      }
    })
  })
})

