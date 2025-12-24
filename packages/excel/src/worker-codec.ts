import { Workbook } from './core/workbook'
import { Worksheet } from './core/worksheet'
import { Row } from './core/row'
import { Cell } from './core/cell'
import type {
  CellValue,
  CellStyle,
  WorkbookMetadata,
  MergedCellRange
} from './core/types'

export interface SerializedCell {
  value: CellValue
  style?: CellStyle
}

export interface SerializedRow {
  cells: SerializedCell[]
  height?: number
  hidden?: boolean
}

export interface SerializedWorksheet {
  name: string
  rows: SerializedRow[]
  mergedCells: MergedCellRange[]
  columnWidths: Record<number, number>
}

export interface SerializedWorkbook {
  name: string
  sheets: SerializedWorksheet[]
  metadata?: WorkbookMetadata
}

/**
 * 将 Workbook 转为可结构化克隆（structured clone）的纯数据对象。
 *
 * 说明：
 * - 不能使用 JSON 序列化（会把 Date 变成字符串）
 * - structured clone 可保留 Date（以及 ArrayBuffer/Map/Set 等内建类型）
 */
export function serializeWorkbook(workbook: Workbook): SerializedWorkbook {
  return {
    name: workbook.name,
    metadata: workbook.metadata,
    sheets: workbook.sheets.map(sheet => ({
      name: sheet.name,
      mergedCells: [...sheet.mergedCells],
      columnWidths: { ...sheet.columnWidths },
      rows: sheet.rows.map(row => ({
        height: row.height,
        hidden: row.hidden,
        cells: row.cells.map(cell => ({
          value: cell.value,
          style: cell.style
        }))
      }))
    }))
  }
}

/**
 * 将序列化后的工作簿数据重建为 Workbook 实例（用于主线程/worker 任一侧）。
 */
export function rebuildWorkbook(data: SerializedWorkbook | Workbook): Workbook {
  if (data instanceof Workbook) return data

  const sheets = Array.isArray(data?.sheets) ? data.sheets.map(rebuildWorksheet) : []
  const metadata: WorkbookMetadata | undefined = data?.metadata

  return new Workbook(data?.name || '工作簿', {
    sheets,
    metadata
  })
}

function rebuildWorksheet(sheet: SerializedWorksheet): Worksheet {
  const rows = Array.isArray(sheet?.rows)
    ? sheet.rows.map(row => {
        if (Array.isArray(row?.cells)) {
          const cells = row.cells.map(cell => new Cell(cell.value, cell.style))
          return new Row(cells, {
            height: row.height,
            hidden: row.hidden
          })
        }
        return new Row([])
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


