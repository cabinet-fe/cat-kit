import { Workbook, readWorkbook, writeWorkbook, ExcelWriteError } from '@cat-kit/excel/src'
import { unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'

describe('readWorkbook / writeWorkbook 集成', () => {
  it('应保留工作表结构、列信息、样式、日期与公式结果', async () => {
    const workbook = new Workbook({
      creator: 'cat-kit-test',
      createdAt: new Date('2024-01-01T00:00:00.000Z')
    })

    const report = workbook.addWorksheet('Report', {
      defaultRowHeight: 18,
      defaultColWidth: 11,
      frozenPane: { xSplit: 1, ySplit: 1, topLeftCell: 'B2' }
    })
    report.setColumn(1, { width: 20 })
    report.setColumn(2, { width: 12, hidden: true })

    const date = new Date('2024-05-01T00:00:00.000Z')
    report.setCell('A1', 'Title', { font: { bold: true, color: '#ff0000' } })
    report.setCell('B1', 123.45, { numberFormat: '0.00' })
    report.setCell('C1', date)
    report.setCell('D1', { formula: 'B1*2', result: 246.9 })
    report.setCell('A3', true)

    workbook.addWorksheet('Raw').addRow(['x'])

    const bytes = writeWorkbook(workbook, { useSharedStrings: true, compressionLevel: 5 })
    const zipEntries = unzipSync(bytes)

    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(zipEntries['xl/sharedStrings.xml']).toBeDefined()

    const parsed = await readWorkbook(bytes)
    const parsedReport = parsed.getWorksheet('Report')
    expect(parsedReport).toBeDefined()

    expect(parsedReport?.options.defaultRowHeight).toBe(18)
    expect(parsedReport?.options.defaultColWidth).toBe(11)
    expect(parsedReport?.options.frozenPane).toEqual({ xSplit: 1, ySplit: 1, topLeftCell: 'B2' })

    expect(parsedReport?.getColumn(1)).toEqual({ width: 20, hidden: false })
    expect(parsedReport?.getColumn(2)).toEqual({ width: 12, hidden: true })

    expect(parsedReport?.getCell('A1')?.value).toBe('Title')
    expect(parsedReport?.getCell('A1')?.style?.font?.bold).toBe(true)
    expect(parsedReport?.getCell('A1')?.style?.font?.color).toBe('#FF0000')

    expect(parsedReport?.getCell('B1')?.value).toBe(123.45)
    expect(parsedReport?.getCell('B1')?.style?.numberFormat).toBe('0.00')

    const parsedDate = parsedReport?.getCell('C1')?.value
    expect(parsedDate).toBeInstanceOf(Date)
    expect((parsedDate as Date).toISOString()).toBe('2024-05-01T00:00:00.000Z')

    expect(parsedReport?.getCell('D1')?.value).toEqual({ formula: 'B1*2', result: 246.9 })
    expect(parsedReport?.getCell('A3')?.value).toBe(true)
    expect(parsedReport?.maxRowIndex()).toBe(3)
    expect(parsedReport?.maxColIndex()).toBe(4)

    expect(parsed.getWorksheet(1)?.name).toBe('Raw')
    expect(parsed.getWorksheet('Raw')?.getCell('A1')?.value).toBe('x')
  })

  it('空工作簿写入应抛错', () => {
    expect(() => writeWorkbook(new Workbook())).toThrowError(ExcelWriteError)
    expect(() => writeWorkbook(new Workbook())).toThrow(
      'Workbook must contain at least one worksheet'
    )
  })
})
