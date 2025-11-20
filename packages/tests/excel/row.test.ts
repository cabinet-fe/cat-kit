import { describe, it, expect } from 'vitest'
import { Row, Cell } from '@cat-kit/excel/src'
import type { CellStyle } from '@cat-kit/excel/src'

describe('Row', () => {
  describe('构造函数', () => {
    it('应该从值数组创建行', () => {
      const row = new Row(['A', 'B', 'C'])
      expect(row.length).toBe(3)
      expect(row.getCell(0)?.value).toBe('A')
      expect(row.getCell(1)?.value).toBe('B')
      expect(row.getCell(2)?.value).toBe('C')
    })

    it('应该从 Cell 数组创建行', () => {
      const cells = [
        new Cell('A'),
        new Cell('B'),
        new Cell('C')
      ]
      const row = new Row(cells)
      expect(row.length).toBe(3)
      expect(row.getCell(0)).toBe(cells[0])
      expect(row.getCell(1)).toBe(cells[1])
      expect(row.getCell(2)).toBe(cells[2])
    })

    it('应该支持混合类型的值', () => {
      const row = new Row(['text', 42, true, null, new Date('2024-01-01')])
      expect(row.length).toBe(5)
      expect(row.getCell(0)?.value).toBe('text')
      expect(row.getCell(1)?.value).toBe(42)
      expect(row.getCell(2)?.value).toBe(true)
      expect(row.getCell(3)?.value).toBeNull()
      expect(row.getCell(4)?.value).toBeInstanceOf(Date)
    })

    it('应该支持行选项', () => {
      const row = new Row(['A'], { height: 20, hidden: true })
      expect(row.height).toBe(20)
      expect(row.hidden).toBe(true)
    })
  })

  describe('getCell', () => {
    it('应该返回指定索引的单元格', () => {
      const row = new Row(['A', 'B', 'C'])
      expect(row.getCell(0)?.value).toBe('A')
      expect(row.getCell(1)?.value).toBe('B')
      expect(row.getCell(2)?.value).toBe('C')
    })

    it('索引超出范围应该返回 undefined', () => {
      const row = new Row(['A'])
      expect(row.getCell(1)).toBeUndefined()
      expect(row.getCell(-1)).toBeUndefined()
    })
  })

  describe('length', () => {
    it('应该返回单元格数量', () => {
      expect(new Row([]).length).toBe(0)
      expect(new Row(['A']).length).toBe(1)
      expect(new Row(['A', 'B', 'C']).length).toBe(3)
    })
  })

  describe('withHeight', () => {
    it('应该返回设置行高后的新行实例', () => {
      const row1 = new Row(['A', 'B'])
      const row2 = row1.withHeight(25)

      expect(row1.height).toBeUndefined()
      expect(row2.height).toBe(25)
      expect(row1).not.toBe(row2)
    })

    it('应该保留原有单元格', () => {
      const row1 = new Row(['A', 'B'])
      const row2 = row1.withHeight(25)

      expect(row2.getCell(0)?.value).toBe('A')
      expect(row2.getCell(1)?.value).toBe('B')
    })

    it('应该保留隐藏状态', () => {
      const row1 = new Row(['A'], { hidden: true })
      const row2 = row1.withHeight(25)

      expect(row2.hidden).toBe(true)
    })
  })

  describe('withHidden', () => {
    it('应该返回设置隐藏状态后的新行实例', () => {
      const row1 = new Row(['A'])
      const row2 = row1.withHidden(true)

      expect(row1.hidden).toBeUndefined()
      expect(row2.hidden).toBe(true)
      expect(row1).not.toBe(row2)
    })

    it('应该保留行高', () => {
      const row1 = new Row(['A'], { height: 20 })
      const row2 = row1.withHidden(true)

      expect(row2.height).toBe(20)
    })
  })

  describe('withCell', () => {
    it('应该返回更新指定单元格后的新行实例', () => {
      const row1 = new Row(['A', 'B', 'C'])
      const newCell = new Cell('X')
      const row2 = row1.withCell(1, newCell)

      expect(row1.getCell(1)?.value).toBe('B')
      expect(row2.getCell(1)?.value).toBe('X')
      expect(row1).not.toBe(row2)
    })

    it('应该保留其他单元格', () => {
      const row1 = new Row(['A', 'B', 'C'])
      const row2 = row1.withCell(1, new Cell('X'))

      expect(row2.getCell(0)?.value).toBe('A')
      expect(row2.getCell(2)?.value).toBe('C')
    })

    it('应该保留行属性', () => {
      const row1 = new Row(['A'], { height: 20, hidden: true })
      const row2 = row1.withCell(0, new Cell('X'))

      expect(row2.height).toBe(20)
      expect(row2.hidden).toBe(true)
    })
  })

  describe('withStyle', () => {
    it('应该返回应用样式到所有单元格后的新行', () => {
      const row1 = new Row(['A', 'B', 'C'])
      const style: CellStyle = { font: { bold: true } }
      const row2 = row1.withStyle(style)

      expect(row2.getCell(0)?.style).toEqual(style)
      expect(row2.getCell(1)?.style).toEqual(style)
      expect(row2.getCell(2)?.style).toEqual(style)
    })

    it('应该保留单元格值', () => {
      const row1 = new Row(['A', 'B'])
      const row2 = row1.withStyle({ font: { bold: true } })

      expect(row2.getCell(0)?.value).toBe('A')
      expect(row2.getCell(1)?.value).toBe('B')
    })

    it('应该保留行属性', () => {
      const row1 = new Row(['A'], { height: 20, hidden: true })
      const row2 = row1.withStyle({ font: { bold: true } })

      expect(row2.height).toBe(20)
      expect(row2.hidden).toBe(true)
    })
  })

  describe('getValues', () => {
    it('应该返回所有单元格的值', () => {
      const row = new Row(['A', 'B', 'C'])
      expect(row.getValues()).toEqual(['A', 'B', 'C'])
    })

    it('应该支持混合类型', () => {
      const date = new Date('2024-01-01')
      const row = new Row(['text', 42, true, null, date])
      expect(row.getValues()).toEqual(['text', 42, true, null, date])
    })

    it('空行应该返回空数组', () => {
      const row = new Row([])
      expect(row.getValues()).toEqual([])
    })
  })

  describe('isEmpty', () => {
    it('所有单元格都为空时应该返回 true', () => {
      const row = new Row([null, null, null])
      expect(row.isEmpty()).toBe(true)
    })

    it('包含非空单元格时应该返回 false', () => {
      const row1 = new Row(['A', null, null])
      const row2 = new Row([null, 0, null])
      const row3 = new Row([null, null, false])

      expect(row1.isEmpty()).toBe(false)
      expect(row2.isEmpty()).toBe(false)
      expect(row3.isEmpty()).toBe(false)
    })

    it('空行应该返回 true', () => {
      const row = new Row([])
      expect(row.isEmpty()).toBe(true)
    })

    it('空字符串不算空', () => {
      const row = new Row([''])
      expect(row.isEmpty()).toBe(false)
    })
  })

  describe('迭代器', () => {
    it('应该支持 for...of 循环', () => {
      const row = new Row(['A', 'B', 'C'])
      const values: string[] = []

      for (const cell of row) {
        values.push(cell.value as string)
      }

      expect(values).toEqual(['A', 'B', 'C'])
    })

    it('应该支持展开运算符', () => {
      const row = new Row(['A', 'B', 'C'])
      const cells = [...row]

      expect(cells).toHaveLength(3)
      expect(cells[0].value).toBe('A')
      expect(cells[1].value).toBe('B')
      expect(cells[2].value).toBe('C')
    })
  })
})

