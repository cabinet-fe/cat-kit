import { columnToIndex } from '../address'
import { ExcelValueError } from '../errors'
import type { CellStyle, CellValue } from '../types'
import { Cell } from './cell'

export class Row {
  public readonly index: number
  private readonly cells = new Map<number, Cell>()

  constructor(index: number) {
    if (!Number.isInteger(index) || index < 1) {
      throw new ExcelValueError(`Invalid row index: ${index}`, 'INVALID_ROW_INDEX')
    }
    this.index = index
  }

  cell(column: number | string): Cell {
    const colIndex = this.resolveColumn(column)
    let cell = this.cells.get(colIndex)
    if (!cell) {
      cell = new Cell()
      this.cells.set(colIndex, cell)
    }
    return cell
  }

  setCell(column: number | string, value: CellValue, style?: CellStyle): this {
    this.cell(column).setValue(value).setStyle(style)
    return this
  }

  getCell(column: number | string): Cell | undefined {
    return this.cells.get(this.resolveColumn(column))
  }

  getCells(): Array<[column: number, cell: Cell]> {
    return [...this.cells.entries()].sort((a, b) => a[0] - b[0])
  }

  toValues(): CellValue[] {
    const sorted = this.getCells()
    if (sorted.length === 0) return []
    const last = sorted[sorted.length - 1]
    if (!last) return []
    const maxCol = last[0]
    const values: CellValue[] = new Array(maxCol).fill(null)
    for (const [col, cell] of sorted) {
      values[col - 1] = cell.value
    }
    return values
  }

  private resolveColumn(column: number | string): number {
    if (typeof column === 'string') {
      return columnToIndex(column)
    }
    if (!Number.isInteger(column) || column < 1) {
      throw new ExcelValueError(`Invalid column index: ${column}`, 'INVALID_COLUMN_INDEX')
    }
    return column
  }
}
