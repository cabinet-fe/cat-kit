import { describe, it, expect } from 'vitest'
import { Worksheet } from '../src/core/worksheet'
import { Row } from '../src/core/row'
import { Cell } from '../src/core/cell'
import type { TableData, TableColumn } from '../src/core/worksheet'
import type { CellStyle } from '../src/core/types'

describe('Worksheet', () => {
  describe('构造函数', () => {
    it('应该创建空工作表', () => {
      const sheet = new Worksheet('Sheet1')
      expect(sheet.name).toBe('Sheet1')
      expect(sheet.rowCount).toBe(0)
      expect(sheet.columnCount).toBe(0)
    })

    it('应该从行数据创建工作表', () => {
      const sheet = new Worksheet('Sheet1', {
        rows: [
          ['A1', 'B1', 'C1'],
          ['A2', 'B2', 'C2']
        ]
      })

      expect(sheet.rowCount).toBe(2)
      expect(sheet.columnCount).toBe(3)
      expect(sheet.getCell(0, 0)?.value).toBe('A1')
      expect(sheet.getCell(1, 2)?.value).toBe('C2')
    })

    it('应该从表格数据创建工作表', () => {
      interface User {
        name: string
        age: number
      }

      const columns: TableColumn<User>[] = [
        { name: '姓名', key: 'name' },
        { name: '年龄', key: 'age' }
      ]

      const data: User[] = [
        { name: '张三', age: 25 },
        { name: '李四', age: 30 }
      ]

      const sheet = new Worksheet('Sheet1', {
        table: { columns, data }
      })

      expect(sheet.rowCount).toBe(3) // 表头 + 2 行数据
      expect(sheet.getCell(0, 0)?.value).toBe('姓名')
      expect(sheet.getCell(0, 1)?.value).toBe('年龄')
      expect(sheet.getCell(1, 0)?.value).toBe('张三')
      expect(sheet.getCell(1, 1)?.value).toBe(25)
      expect(sheet.getCell(2, 0)?.value).toBe('李四')
      expect(sheet.getCell(2, 1)?.value).toBe(30)
    })

    it('表格数据应该应用表头样式', () => {
      const headerStyle: CellStyle = {
        font: { bold: true }
      }

      const sheet = new Worksheet('Sheet1', {
        table: {
          columns: [{ name: '列1', key: 'col1' }],
          data: [{ col1: 'value' }],
          headerStyle
        }
      })

      expect(sheet.getCell(0, 0)?.style?.font?.bold).toBe(true)
    })

    it('表格数据应该应用列对齐', () => {
      interface Data {
        text: string
        number: number
      }

      const columns: TableColumn<Data>[] = [
        { name: '文本', key: 'text', align: 'left' },
        { name: '数字', key: 'number', align: 'right' }
      ]

      const sheet = new Worksheet('Sheet1', {
        table: {
          columns,
          data: [{ text: 'hello', number: 42 }]
        }
      })

      expect(sheet.getCell(1, 0)?.style?.alignment?.horizontal).toBe('left')
      expect(sheet.getCell(1, 1)?.style?.alignment?.horizontal).toBe('right')
    })

    it('表格数据应该应用列宽', () => {
      const sheet = new Worksheet('Sheet1', {
        table: {
          columns: [
            { name: '列1', key: 'col1', width: 100 },
            { name: '列2', key: 'col2', width: 200 }
          ],
          data: [{ col1: 'a', col2: 'b' }]
        }
      })

      // pixelsToExcelWidth(100) ≈ 14
      // pixelsToExcelWidth(200) ≈ 29
      expect(sheet.columnWidths[0]).toBeGreaterThan(10)
      expect(sheet.columnWidths[1]).toBeGreaterThan(20)
    })

    it('应该抛出错误当表格没有列时', () => {
      expect(() => {
        new Worksheet('Sheet1', {
          table: {
            columns: [],
            data: []
          }
        })
      }).toThrow('至少需要一列')
    })
  })

  describe('getRow', () => {
    it('应该返回指定索引的行', () => {
      const sheet = new Worksheet('Sheet1', {
        rows: [['A1'], ['A2']]
      })

      const row = sheet.getRow(1)
      expect(row?.getCell(0)?.value).toBe('A2')
    })

    it('索引超出范围应该返回 undefined', () => {
      const sheet = new Worksheet('Sheet1', {
        rows: [['A1']]
      })

      expect(sheet.getRow(10)).toBeUndefined()
    })
  })

  describe('getCell', () => {
    it('应该通过行列索引获取单元格', () => {
      const sheet = new Worksheet('Sheet1', {
        rows: [
          ['A1', 'B1'],
          ['A2', 'B2']
        ]
      })

      expect(sheet.getCell(0, 0)?.value).toBe('A1')
      expect(sheet.getCell(0, 1)?.value).toBe('B1')
      expect(sheet.getCell(1, 0)?.value).toBe('A2')
      expect(sheet.getCell(1, 1)?.value).toBe('B2')
    })

    it('应该通过 A1 格式地址获取单元格', () => {
      const sheet = new Worksheet('Sheet1', {
        rows: [
          ['A1', 'B1'],
          ['A2', 'B2']
        ]
      })

      expect(sheet.getCell('A1')?.value).toBe('A1')
      expect(sheet.getCell('B1')?.value).toBe('B1')
      expect(sheet.getCell('A2')?.value).toBe('A2')
      expect(sheet.getCell('B2')?.value).toBe('B2')
    })

    it('无效地址应该抛出错误', () => {
      const sheet = new Worksheet('Sheet1')
      expect(() => sheet.getCell('invalid')).toThrow()
    })

    it('缺少列索引应该抛出错误', () => {
      const sheet = new Worksheet('Sheet1')
      expect(() => sheet.getCell(0)).toThrow('列索引是必需的')
    })
  })

  describe('withName', () => {
    it('应该返回重命名后的新工作表', () => {
      const sheet1 = new Worksheet('Sheet1', {
        rows: [['A1']]
      })
      const sheet2 = sheet1.withName('NewSheet')

      expect(sheet1.name).toBe('Sheet1')
      expect(sheet2.name).toBe('NewSheet')
      expect(sheet1).not.toBe(sheet2)
    })

    it('应该保留行数据', () => {
      const sheet1 = new Worksheet('Sheet1', {
        rows: [['A1']]
      })
      const sheet2 = sheet1.withName('NewSheet')

      expect(sheet2.getCell(0, 0)?.value).toBe('A1')
    })
  })

  describe('appendRow', () => {
    it('应该追加行到工作表', () => {
      const sheet1 = new Worksheet('Sheet1', {
        rows: [['A1']]
      })
      const sheet2 = sheet1.appendRow(new Row(['A2']))

      expect(sheet1.rowCount).toBe(1)
      expect(sheet2.rowCount).toBe(2)
      expect(sheet2.getCell(0, 0)?.value).toBe('A1')
      expect(sheet2.getCell(1, 0)?.value).toBe('A2')
    })

    it('空工作表应该可以追加行', () => {
      const sheet1 = new Worksheet('Sheet1')
      const sheet2 = sheet1.appendRow(new Row(['A1']))

      expect(sheet2.rowCount).toBe(1)
      expect(sheet2.getCell(0, 0)?.value).toBe('A1')
    })
  })

  describe('appendRows', () => {
    it('应该追加多行到工作表', () => {
      const sheet1 = new Worksheet('Sheet1', {
        rows: [['A1']]
      })
      const sheet2 = sheet1.appendRows([
        new Row(['A2']),
        new Row(['A3'])
      ])

      expect(sheet2.rowCount).toBe(3)
      expect(sheet2.getCell(0, 0)?.value).toBe('A1')
      expect(sheet2.getCell(1, 0)?.value).toBe('A2')
      expect(sheet2.getCell(2, 0)?.value).toBe('A3')
    })

    it('空数组不应该报错', () => {
      const sheet1 = new Worksheet('Sheet1')
      const sheet2 = sheet1.appendRows([])

      expect(sheet2.rowCount).toBe(0)
    })
  })

  describe('withColumnWidth', () => {
    it('应该设置列宽', () => {
      const sheet1 = new Worksheet('Sheet1')
      const sheet2 = sheet1.withColumnWidth(0, 20)

      expect(sheet1.columnWidths[0]).toBeUndefined()
      expect(sheet2.columnWidths[0]).toBe(20)
    })

    it('应该支持设置多个列宽', () => {
      const sheet1 = new Worksheet('Sheet1')
      const sheet2 = sheet1.withColumnWidth(0, 20).withColumnWidth(1, 30)

      expect(sheet2.columnWidths[0]).toBe(20)
      expect(sheet2.columnWidths[1]).toBe(30)
    })
  })

  describe('withMergedCell', () => {
    it('应该添加合并单元格', () => {
      const sheet1 = new Worksheet('Sheet1')
      const sheet2 = sheet1.withMergedCell({
        start: { row: 0, column: 0 },
        end: { row: 1, column: 1 }
      })

      expect(sheet1.mergedCells).toHaveLength(0)
      expect(sheet2.mergedCells).toHaveLength(1)
      expect(sheet2.mergedCells[0]).toEqual({
        start: { row: 0, column: 0 },
        end: { row: 1, column: 1 }
      })
    })

    it('应该支持添加多个合并单元格', () => {
      const sheet1 = new Worksheet('Sheet1')
      const sheet2 = sheet1
        .withMergedCell({
          start: { row: 0, column: 0 },
          end: { row: 0, column: 1 }
        })
        .withMergedCell({
          start: { row: 1, column: 0 },
          end: { row: 1, column: 1 }
        })

      expect(sheet2.mergedCells).toHaveLength(2)
    })
  })

  describe('rowCount 和 columnCount', () => {
    it('空工作表应该返回 0', () => {
      const sheet = new Worksheet('Sheet1')
      expect(sheet.rowCount).toBe(0)
      expect(sheet.columnCount).toBe(0)
    })

    it('应该返回正确的行数和列数', () => {
      const sheet = new Worksheet('Sheet1', {
        rows: [
          ['A1', 'B1', 'C1'],
          ['A2', 'B2']
        ]
      })

      expect(sheet.rowCount).toBe(2)
      expect(sheet.columnCount).toBe(3) // 基于第一行
    })
  })

  describe('迭代器', () => {
    it('应该支持 for...of 循环', () => {
      const sheet = new Worksheet('Sheet1', {
        rows: [['A1'], ['A2']]
      })

      const values: string[] = []
      for (const row of sheet) {
        values.push(row.getCell(0)?.value as string)
      }

      expect(values).toEqual(['A1', 'A2'])
    })

    it('应该支持展开运算符', () => {
      const sheet = new Worksheet('Sheet1', {
        rows: [['A1'], ['A2']]
      })

      const rows = [...sheet]
      expect(rows).toHaveLength(2)
    })
  })
})

