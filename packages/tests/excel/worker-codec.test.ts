import { describe, it, expect } from 'vitest'
import {
  Workbook,
  Worksheet,
  Row,
  Cell,
  rebuildWorkbook,
  serializeWorkbook
} from '@cat-kit/excel/src'

describe('Excel worker codec', () => {
  it('structuredClone roundtrip 后 Date 应保持类型，并可重建为 Workbook 实例', () => {
    const d = new Date('2024-01-02T03:04:05Z')
    const sheet = new Worksheet('Sheet1', {
      rows: [new Row([new Cell(d, { numberFormat: 'yyyy-mm-dd' })])]
    })
    const workbook = new Workbook('Book', { sheets: [sheet] })

    const serialized = serializeWorkbook(workbook)
    const cloned = structuredClone(serialized)
    const rebuilt = rebuildWorkbook(cloned)

    expect(rebuilt).toBeInstanceOf(Workbook)
    expect(rebuilt.getSheet(0)?.getCell('A1')?.value).toBeInstanceOf(Date)
    expect((rebuilt.getSheet(0)?.getCell('A1')?.value as Date).toISOString()).toBe(
      d.toISOString()
    )
  })
})


