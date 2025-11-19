import { describe, it, expect } from 'vitest'
import { Cell } from '../src/core/cell'
import type { CellStyle } from '../src/core/types'

describe('Cell', () => {
  describe('构造函数', () => {
    it('应该创建一个包含值的单元格', () => {
      const cell = new Cell('Hello')
      expect(cell.value).toBe('Hello')
      expect(cell.style).toBeUndefined()
    })

    it('应该创建一个包含值和样式的单元格', () => {
      const style: CellStyle = {
        font: { bold: true }
      }
      const cell = new Cell('Hello', style)
      expect(cell.value).toBe('Hello')
      expect(cell.style).toEqual(style)
    })

    it('应该创建不同类型的单元格', () => {
      expect(new Cell('text').value).toBe('text')
      expect(new Cell(42).value).toBe(42)
      expect(new Cell(true).value).toBe(true)
      expect(new Cell(null).value).toBeNull()

      const date = new Date('2024-01-01')
      expect(new Cell(date).value).toBe(date)
    })
  })

  describe('withValue', () => {
    it('应该返回包含新值的新单元格实例', () => {
      const cell1 = new Cell('Hello')
      const cell2 = cell1.withValue('World')

      expect(cell1.value).toBe('Hello')
      expect(cell2.value).toBe('World')
      expect(cell1).not.toBe(cell2)
    })

    it('应该保留原有样式', () => {
      const style: CellStyle = { font: { bold: true } }
      const cell1 = new Cell('Hello', style)
      const cell2 = cell1.withValue('World')

      expect(cell2.style).toEqual(style)
    })

    it('应该支持改变值类型', () => {
      const cell1 = new Cell('text')
      const cell2 = cell1.withValue(42)

      expect(cell2.value).toBe(42)
    })
  })

  describe('withStyle', () => {
    it('应该返回包含新样式的新单元格实例', () => {
      const cell1 = new Cell('Hello')
      const style: CellStyle = { font: { bold: true } }
      const cell2 = cell1.withStyle(style)

      expect(cell1.style).toBeUndefined()
      expect(cell2.style).toEqual(style)
      expect(cell1).not.toBe(cell2)
    })

    it('应该完全替换原有样式', () => {
      const style1: CellStyle = { font: { bold: true } }
      const style2: CellStyle = { font: { italic: true } }

      const cell1 = new Cell('Hello', style1)
      const cell2 = cell1.withStyle(style2)

      expect(cell2.style).toEqual(style2)
    })

    it('应该保留原有值', () => {
      const cell1 = new Cell('Hello')
      const cell2 = cell1.withStyle({ font: { bold: true } })

      expect(cell2.value).toBe('Hello')
    })
  })

  describe('mergeStyle', () => {
    it('应该合并字体样式', () => {
      const cell1 = new Cell('Hello', {
        font: { bold: true, size: 12 }
      })
      const cell2 = cell1.mergeStyle({
        font: { italic: true }
      })

      expect(cell2.style?.font).toEqual({
        bold: true,
        size: 12,
        italic: true
      })
    })

    it('应该合并边框样式', () => {
      const cell1 = new Cell('Hello', {
        border: { left: { style: 'thin' } }
      })
      const cell2 = cell1.mergeStyle({
        border: { right: { style: 'thick' } }
      })

      expect(cell2.style?.border).toEqual({
        left: { style: 'thin' },
        right: { style: 'thick' }
      })
    })

    it('应该合并填充样式', () => {
      const cell1 = new Cell('Hello', {
        fill: { fgColor: '#FF0000' }
      })
      const cell2 = cell1.mergeStyle({
        fill: { patternType: 'solid' }
      })

      expect(cell2.style?.fill).toEqual({
        fgColor: '#FF0000',
        patternType: 'solid'
      })
    })

    it('应该合并对齐样式', () => {
      const cell1 = new Cell('Hello', {
        alignment: { horizontal: 'left' }
      })
      const cell2 = cell1.mergeStyle({
        alignment: { vertical: 'middle' }
      })

      expect(cell2.style?.alignment).toEqual({
        horizontal: 'left',
        vertical: 'middle'
      })
    })

    it('应该覆盖数字格式', () => {
      const cell1 = new Cell(42, {
        numberFormat: '0.00'
      })
      const cell2 = cell1.mergeStyle({
        numberFormat: '0.000'
      })

      expect(cell2.style?.numberFormat).toBe('0.000')
    })

    it('空样式合并不应报错', () => {
      const cell1 = new Cell('Hello')
      const cell2 = cell1.mergeStyle({})

      expect(cell2.style).toBeDefined()
    })
  })

  describe('isEmpty', () => {
    it('null 值应该为空', () => {
      expect(new Cell(null).isEmpty()).toBe(true)
    })

    it('undefined 值应该为空', () => {
      expect(new Cell(undefined as any).isEmpty()).toBe(true)
    })

    it('空字符串不应该为空', () => {
      expect(new Cell('').isEmpty()).toBe(false)
    })

    it('0 不应该为空', () => {
      expect(new Cell(0).isEmpty()).toBe(false)
    })

    it('false 不应该为空', () => {
      expect(new Cell(false).isEmpty()).toBe(false)
    })
  })

  describe('getValueType', () => {
    it('应该识别字符串类型', () => {
      expect(new Cell('text').getValueType()).toBe('string')
    })

    it('应该识别数字类型', () => {
      expect(new Cell(42).getValueType()).toBe('number')
      expect(new Cell(3.14).getValueType()).toBe('number')
      expect(new Cell(0).getValueType()).toBe('number')
    })

    it('应该识别日期类型', () => {
      expect(new Cell(new Date()).getValueType()).toBe('date')
    })

    it('应该识别布尔类型', () => {
      expect(new Cell(true).getValueType()).toBe('boolean')
      expect(new Cell(false).getValueType()).toBe('boolean')
    })

    it('应该识别 null 类型', () => {
      expect(new Cell(null).getValueType()).toBe('null')
      expect(new Cell(undefined as any).getValueType()).toBe('null')
    })
  })
})

