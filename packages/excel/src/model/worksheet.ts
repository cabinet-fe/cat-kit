import { parseCellAddress } from '../address'
import { ExcelSchemaError, ExcelValueError } from '../errors'
import type { CellStyle, CellValue, WorksheetColumn, WorksheetOptions } from '../types'
import { Row } from './row'

export class Worksheet {
  public name: string
  public readonly options: WorksheetOptions
  private readonly rows = new Map<number, Row>()
  private readonly columns = new Map<number, WorksheetColumn>()

  constructor(name: string, options: WorksheetOptions = {}) {
    const normalizedName = name.trim()
    if (!normalizedName) {
      throw new ExcelSchemaError('Worksheet name must not be empty', 'INVALID_SHEET_NAME')
    }
    this.name = normalizedName
    this.options = options
  }

  row(index: number): Row {
    if (!Number.isInteger(index) || index < 1) {
      throw new ExcelValueError(`Invalid row index: ${index}`, 'INVALID_ROW_INDEX')
    }
    let row = this.rows.get(index)
    if (!row) {
      row = new Row(index)
      this.rows.set(index, row)
    }
    return row
  }

  getRow(index: number): Row | undefined {
    return this.rows.get(index)
  }

  addRow(values: CellValue[]): Row {
    const rowIndex = this.maxRowIndex() + 1
    const row = this.row(rowIndex)
    for (let i = 0; i < values.length; i += 1) {
      row.setCell(i + 1, values[i] ?? null)
    }
    return row
  }

  setCell(address: string, value: CellValue, style?: CellStyle): this {
    const { row, col } = parseCellAddress(address)
    this.row(row).setCell(col, value, style)
    return this
  }

  getCell(address: string) {
    const { row, col } = parseCellAddress(address)
    return this.rows.get(row)?.getCell(col)
  }

  setColumn(index: number, column: WorksheetColumn): this {
    if (!Number.isInteger(index) || index < 1) {
      throw new ExcelValueError(`Invalid column index: ${index}`, 'INVALID_COLUMN_INDEX')
    }
    this.columns.set(index, { ...column })
    return this
  }

  getColumn(index: number): WorksheetColumn | undefined {
    return this.columns.get(index)
  }

  getColumns(): Array<[index: number, column: WorksheetColumn]> {
    return [...this.columns.entries()].sort((a, b) => a[0] - b[0])
  }

  getRows(): Row[] {
    return [...this.rows.values()].sort((a, b) => a.index - b.index)
  }

  maxRowIndex(): number {
    let max = 0
    for (const index of this.rows.keys()) {
      if (index > max) max = index
    }
    return max
  }

  maxColIndex(): number {
    let max = 0
    for (const row of this.rows.values()) {
      const cells = row.getCells()
      if (cells.length > 0) {
        const last = cells[cells.length - 1]
        if (!last) continue
        const col = last[0]
        if (col > max) max = col
      }
    }
    for (const colIndex of this.columns.keys()) {
      if (colIndex > max) max = colIndex
    }
    return max
  }
}
