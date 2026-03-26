import {
  columnToIndex,
  indexToColumn,
  parseCellAddress,
  formatCellAddress,
  pixelsToExcelWidth,
  excelWidthToPixels,
  ExcelValueError
} from '@cat-kit/excel/src'
import { describe, expect, it } from 'vitest'

describe('address', () => {
  describe('columnToIndex / indexToColumn', () => {
    it('应支持 Excel 1-based 列索引转换', () => {
      expect(columnToIndex('A')).toBe(1)
      expect(columnToIndex('Z')).toBe(26)
      expect(columnToIndex('AA')).toBe(27)
      expect(columnToIndex('XFD')).toBe(16384)

      expect(indexToColumn(1)).toBe('A')
      expect(indexToColumn(26)).toBe('Z')
      expect(indexToColumn(27)).toBe('AA')
      expect(indexToColumn(16384)).toBe('XFD')
    })

    it('应互为逆操作', () => {
      const indexes = [1, 2, 26, 27, 52, 702, 703, 16384]
      for (const index of indexes) {
        expect(columnToIndex(indexToColumn(index))).toBe(index)
      }
    })

    it('应拒绝非法列名或越界索引', () => {
      expect(() => columnToIndex('')).toThrow(ExcelValueError)
      expect(() => columnToIndex('A1')).toThrow('Invalid column label')
      expect(() => columnToIndex('XFE')).toThrow('Column index out of range')

      expect(() => indexToColumn(0)).toThrow('Column index out of range')
      expect(() => indexToColumn(16385)).toThrow('Column index out of range')
      expect(() => indexToColumn(1.5)).toThrow('Column index out of range')
    })
  })

  describe('parseCellAddress / formatCellAddress', () => {
    it('应解析并格式化 A1 地址', () => {
      expect(parseCellAddress('A1')).toEqual({ row: 1, col: 1 })
      expect(parseCellAddress(' c10 ')).toEqual({ row: 10, col: 3 })
      expect(parseCellAddress('XFD1048576')).toEqual({ row: 1048576, col: 16384 })

      expect(formatCellAddress(1, 1)).toBe('A1')
      expect(formatCellAddress(10, 3)).toBe('C10')
      expect(formatCellAddress(1048576, 16384)).toBe('XFD1048576')
    })

    it('应拒绝非法地址与越界行号', () => {
      expect(() => parseCellAddress('1A')).toThrow('Invalid cell address')
      expect(() => parseCellAddress('A0')).toThrow('Row index out of range')
      expect(() => parseCellAddress('A1048577')).toThrow('Row index out of range')

      expect(() => formatCellAddress(0, 1)).toThrow('Row index out of range')
      expect(() => formatCellAddress(1048577, 1)).toThrow('Row index out of range')
    })
  })

  describe('width conversion', () => {
    it('应在像素与 Excel 宽度之间转换并做边界处理', () => {
      expect(pixelsToExcelWidth(70)).toBe(10)
      expect(pixelsToExcelWidth(0)).toBe(1)
      expect(pixelsToExcelWidth(100000)).toBe(255)

      expect(excelWidthToPixels(10)).toBe(70)
      expect(excelWidthToPixels(-1)).toBe(0)
      expect(excelWidthToPixels(10.5)).toBe(74)
    })

    it('应拒绝非有限数字', () => {
      expect(() => pixelsToExcelWidth(Number.NaN)).toThrow('Pixel width must be a finite number')
      expect(() => excelWidthToPixels(Number.POSITIVE_INFINITY)).toThrow(
        'Excel width must be a finite number'
      )
    })
  })
})
