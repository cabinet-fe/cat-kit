import { Cell, ExcelValueError } from '@cat-kit/excel/src'
import type { CellStyle } from '@cat-kit/excel/src'
import { describe, expect, it } from 'vitest'

describe('Cell', () => {
  it('应支持设置基础值类型与公式值', () => {
    const date = new Date('2024-02-01T00:00:00.000Z')
    const formula = { formula: 'A1+B1', result: 3 } as const

    expect(new Cell('text').value).toBe('text')
    expect(new Cell(42).value).toBe(42)
    expect(new Cell(true).value).toBe(true)
    expect(new Cell(null).value).toBeNull()
    expect(new Cell(date).value).toEqual(date)
    expect(new Cell(formula).value).toEqual(formula)
  })

  it('setValue 应返回当前实例并覆盖值', () => {
    const cell = new Cell('old')
    const next = cell.setValue('new')

    expect(next).toBe(cell)
    expect(cell.value).toBe('new')
  })

  it('setStyle 应设置和清除样式', () => {
    const style: CellStyle = { font: { bold: true } }
    const cell = new Cell('v')

    cell.setStyle(style)
    expect(cell.style).toEqual(style)

    cell.setStyle(undefined)
    expect(cell.style).toBeUndefined()
  })

  it('clone 应复制值，并对 Date 创建新实例', () => {
    const date = new Date('2024-02-01T10:20:30.000Z')
    const cell = new Cell(date, { numberFormat: 'yyyy-mm-dd' })

    const cloned = cell.clone()
    expect(cloned).not.toBe(cell)
    expect(cloned.value).toBeInstanceOf(Date)
    expect((cloned.value as Date).toISOString()).toBe(date.toISOString())
    expect(cloned.value).not.toBe(cell.value)
    expect(cloned.style).toEqual(cell.style)
  })

  it('应拒绝非法值类型和非法日期', () => {
    expect(() => new Cell(new Date('invalid'))).toThrowError(ExcelValueError)
    expect(() => new Cell({ foo: 'bar' } as unknown as string)).toThrow(
      'Unsupported cell value type'
    )
    expect(() => new Cell({ formula: '', result: 1 })).toThrow('Unsupported cell value type')
  })
})
