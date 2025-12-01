import { describe, it, expect } from 'vitest'
import {
  Workbook,
  Worksheet,
  Row,
  Cell,
  readWorkbookStream
} from '@cat-kit/excel/src'

async function collectStreamRows(stream: ReadableStream<any>) {
  const reader = stream.getReader()
  const rows: any[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    rows.push(value)
  }
  return rows
}

describe('readWorkbookStream', () => {
  it('按 sheetNames 过滤并增量输出行', async () => {
    const sheet1 = new Worksheet('S1', {
      rows: [new Row([new Cell('A1'), new Cell('B1')]), new Row(['A2', 'B2'])]
    })
    const sheet2 = new Worksheet('Target', {
      rows: [new Row([new Cell(1), new Cell(2)])]
    })
    const blob = await new Workbook('Book', {
      sheets: [sheet1, sheet2]
    }).write()

    const stream = readWorkbookStream(blob, {
      sheetNames: ['Target']
    })

    const rows = await collectStreamRows(stream)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.sheetName).toBe('Target')
    expect(rows[0]?.rowIndex).toBe(0)
    expect(rows[0]?.row.getValues()).toEqual([1, 2])
  })
})
