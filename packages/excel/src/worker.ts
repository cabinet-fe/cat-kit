import { readWorkbook } from './reader/xlsx-reader'
import { Workbook } from './core/workbook'
import { Worksheet } from './core/worksheet'
import { Row } from './core/row'
import { Cell } from './core/cell'
import type { CellValue, WorkbookMetadata, MergedCellRange } from './core/types'

/**
 * Excel Worker 消息类型
 */
export type ExcelWorkerMessage =
  | { type: 'read'; data: Blob | ArrayBuffer | Uint8Array; id: string }
  | { type: 'write'; workbook: any; id: string } // Workbook 序列化后传输

/**
 * Excel Worker 响应类型
 */
export type ExcelWorkerResponse =
  | { type: 'read_success'; id: string; workbook: any }
  | { type: 'write_success'; id: string; data: Blob }
  | { type: 'error'; id: string; error: string }

self.onmessage = async (e: MessageEvent<ExcelWorkerMessage>) => {
  const { type, id } = e.data

  try {
    if (type === 'read') {
      const workbook = await readWorkbook(e.data.data)
      // 由于 Workbook 包含方法，无法直接传输，需要序列化
      // 这里简化处理，只返回数据结构
      // 在实际应用中，可能需要一个 serialize/deserialize 方法
      self.postMessage({
        type: 'read_success',
        id,
        workbook: JSON.parse(JSON.stringify(workbook))
      })
    } else if (type === 'write') {
      const { writeWorkbook } = await import('./writer/xlsx-writer')
      const workbook = rebuildWorkbook(e.data.workbook)
      const blob = await writeWorkbook(workbook)

      self.postMessage({
        type: 'write_success',
        id,
        data: blob
      })
    }
  } catch (error: any) {
    self.postMessage({
      type: 'error',
      id,
      error: error.message || String(error)
    })
  }
}

/**
 * 将可序列化的工作簿对象重建为 Workbook 实例
 */
function rebuildWorkbook(data: any): Workbook {
  if (data instanceof Workbook) return data

  const sheets = Array.isArray(data?.sheets)
    ? data.sheets.map(rebuildWorksheet)
    : []

  const metadata: WorkbookMetadata | undefined = data?.metadata

  return new Workbook(data?.name || '工作簿', {
    sheets,
    metadata
  })
}

function rebuildWorksheet(sheet: any): Worksheet {
  const rows = Array.isArray(sheet?.rows)
    ? sheet.rows.map((row: any) => {
        // JSON 序列化后的 Row 形如 { cells: [...], height, hidden }
        if (Array.isArray(row?.cells)) {
          const cells = row.cells.map(
            (cell: any) => new Cell(cell?.value as CellValue, cell?.style)
          )
          return new Row(cells, {
            height: row.height,
            hidden: row.hidden
          })
        }
        return new Row(row as CellValue[])
      })
    : []

  const mergedCells: MergedCellRange[] = sheet?.mergedCells || []
  const columnWidths: Record<number, number> = sheet?.columnWidths || {}

  return new Worksheet(sheet?.name || 'Sheet', {
    rows,
    mergedCells,
    columnWidths
  })
}
