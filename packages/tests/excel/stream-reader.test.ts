import { describe, expect, it } from 'vitest'
import {
  Workbook,
  readWorkbookStream,
  writeWorkbook,
  type StreamEvent
} from '@cat-kit/excel/src'

async function collectEvents(iterable: AsyncIterable<StreamEvent>): Promise<StreamEvent[]> {
  const events: StreamEvent[] = []
  for await (const event of iterable) {
    events.push(event)
  }
  return events
}

describe('readWorkbookStream', () => {
  it('应按 sheet 名过滤，并在 includeEmptyRows=true 时补齐空行事件', async () => {
    const workbook = new Workbook()

    const skip = workbook.addWorksheet('Skip')
    skip.setCell('A1', 'skip')

    const target = workbook.addWorksheet('Target')
    target.row(1).setCell(1, 1).setCell(3, 3)
    target.row(3).setCell(2, 'B3')

    const bytes = writeWorkbook(workbook)

    const events = await collectEvents(
      readWorkbookStream(bytes, {
        sheets: ['Target'],
        includeEmptyRows: true
      })
    )

    expect(events).toEqual([
      { type: 'sheetStart', sheetName: 'Target', sheetIndex: 1 },
      { type: 'row', sheetName: 'Target', sheetIndex: 1, rowIndex: 1, values: [1, null, 3] },
      { type: 'row', sheetName: 'Target', sheetIndex: 1, rowIndex: 2, values: [] },
      { type: 'row', sheetName: 'Target', sheetIndex: 1, rowIndex: 3, values: [null, 'B3'] },
      { type: 'sheetEnd', sheetName: 'Target', sheetIndex: 1 }
    ])
  })

  it('includeEmptyRows=false 时不应补齐缺失行', async () => {
    const workbook = new Workbook()
    const sheet = workbook.addWorksheet('S')
    sheet.row(2).setCell(1, 'A2')

    const bytes = writeWorkbook(workbook)
    const events = await collectEvents(readWorkbookStream(bytes, { sheets: ['S'] }))

    const rowEvents = events.filter(event => event.type === 'row')
    expect(rowEvents).toHaveLength(1)
    expect(rowEvents[0]).toEqual({
      type: 'row',
      sheetName: 'S',
      sheetIndex: 0,
      rowIndex: 2,
      values: ['A2']
    })
  })
})
