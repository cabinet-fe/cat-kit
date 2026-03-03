import { describe, expect, it } from 'vitest'
import { Row, ExcelValueError } from '@cat-kit/excel/src'

describe('Row', () => {
  it('应要求行号为 >=1 的整数', () => {
    expect(() => new Row(0)).toThrowError(ExcelValueError)
    expect(() => new Row(-1)).toThrow('Invalid row index')
    expect(() => new Row(1.5)).toThrow('Invalid row index')
  })

  it('cell() 应按列号或列字母创建并复用单元格', () => {
    const row = new Row(2)

    const cellA1 = row.cell(1)
    const cellA2 = row.cell('A')
    const cellC = row.cell('C')

    expect(cellA1).toBe(cellA2)
    expect(cellC.value).toBeNull()
    expect(row.getCells().map(([col]) => col)).toEqual([1, 3])
  })

  it('setCell/getCell 应读写值与样式', () => {
    const row = new Row(1)
    row.setCell('B', 'hello', { font: { bold: true } })

    const cell = row.getCell(2)
    expect(cell?.value).toBe('hello')
    expect(cell?.style?.font?.bold).toBe(true)
  })

  it('getCells 应按列排序，toValues 应补齐空洞为 null', () => {
    const row = new Row(3)
    row.setCell(4, 'D')
    row.setCell(1, 'A')

    expect(row.getCells().map(([col]) => col)).toEqual([1, 4])
    expect(row.toValues()).toEqual(['A', null, null, 'D'])
  })

  it('应拒绝非法列索引', () => {
    const row = new Row(1)

    expect(() => row.cell(0)).toThrow('Invalid column index')
    expect(() => row.cell('1')).toThrow('Invalid column label')
    expect(() => row.setCell(-1, 'x')).toThrow('Invalid column index')
  })
})
