import { Worksheet, ExcelSchemaError, ExcelValueError } from '@cat-kit/excel/src'
import { describe, expect, it } from 'vitest'

describe('Worksheet', () => {
  it('应在构造时规范化名称并保留 options', () => {
    const sheet = new Worksheet('  Sheet 1  ', {
      defaultRowHeight: 20,
      frozenPane: { xSplit: 1, ySplit: 2, topLeftCell: 'B3' }
    })

    expect(sheet.name).toBe('Sheet 1')
    expect(sheet.options.defaultRowHeight).toBe(20)
    expect(sheet.options.frozenPane).toEqual({ xSplit: 1, ySplit: 2, topLeftCell: 'B3' })
  })

  it('应拒绝空白工作表名称', () => {
    expect(() => new Worksheet('   ')).toThrowError(ExcelSchemaError)
  })

  it('row() 应创建并缓存同一行实例', () => {
    const sheet = new Worksheet('S')

    const row1 = sheet.row(1)
    const row1Again = sheet.row(1)

    expect(row1).toBe(row1Again)
    expect(sheet.getRow(1)).toBe(row1)
  })

  it('addRow() 应在当前最大行后追加', () => {
    const sheet = new Worksheet('S')
    sheet.row(3).setCell(1, 'existing')

    const appended = sheet.addRow(['A', 'B'])

    expect(appended.index).toBe(4)
    expect(sheet.getCell('A4')?.value).toBe('A')
    expect(sheet.getCell('B4')?.value).toBe('B')
  })

  it('setCell/getCell 应通过地址读写', () => {
    const sheet = new Worksheet('S')
    sheet.setCell('B2', 42, { numberFormat: '0.00' })

    const cell = sheet.getCell('B2')
    expect(cell?.value).toBe(42)
    expect(cell?.style?.numberFormat).toBe('0.00')
    expect(sheet.getCell('A1')).toBeUndefined()
  })

  it('应拒绝非法行列索引与非法地址', () => {
    const sheet = new Worksheet('S')

    expect(() => sheet.row(0)).toThrowError(ExcelValueError)
    expect(() => sheet.setColumn(0, { width: 10 })).toThrow('Invalid column index')
    expect(() => sheet.setCell('invalid', 'x')).toThrow('Invalid cell address')
  })

  it('setColumn/getColumns 应维护列信息并按索引排序', () => {
    const sheet = new Worksheet('S')

    sheet.setColumn(3, { width: 30, hidden: true })
    sheet.setColumn(1, { width: 10 })

    expect(sheet.getColumn(3)).toEqual({ width: 30, hidden: true })
    expect(sheet.getColumns()).toEqual([
      [1, { width: 10 }],
      [3, { width: 30, hidden: true }]
    ])
  })

  it('getRows/maxRowIndex/maxColIndex 应反映当前工作表结构', () => {
    const sheet = new Worksheet('S')
    sheet.row(5).setCell(2, 'B5')
    sheet.row(1).setCell(4, 'D1')
    sheet.setColumn(6, { width: 12 })

    expect(sheet.getRows().map((row) => row.index)).toEqual([1, 5])
    expect(sheet.maxRowIndex()).toBe(5)
    expect(sheet.maxColIndex()).toBe(6)
  })
})
