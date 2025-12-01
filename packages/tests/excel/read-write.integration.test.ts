import { describe, it, expect } from 'vitest'
import {
  Workbook,
  Worksheet,
  Row,
  Cell,
  readWorkbook
} from '@cat-kit/excel/src'

describe('Excel 读写集成', () => {
  it('应保留样式、合并、列宽和日期', async () => {
    const sheet = new Worksheet('Sheet1', {
      rows: [
        new Row([
          new Cell('Title', { font: { bold: true } }),
          new Cell(new Date('2024-01-02'), { numberFormat: 'yyyy-mm-dd' })
        ])
      ],
      mergedCells: [
        { start: { row: 0, column: 0 }, end: { row: 0, column: 1 } }
      ],
      columnWidths: { 0: 25 }
    })

    const workbook = new Workbook('Report', { sheets: [sheet] })
    const blob = await workbook.write()
    const parsed = await readWorkbook(blob)

    const parsedSheet = parsed.getSheet(0)
    expect(parsedSheet?.mergedCells).toHaveLength(1)
    expect(parsedSheet?.columnWidths[0]).toBe(25)
    expect(parsedSheet?.getCell('A1')?.style?.font?.bold).toBe(true)
    expect(parsedSheet?.getCell('B1')?.value).toBeInstanceOf(Date)
  })
})
