import { ExcelValueError } from './errors'

const MAX_COLUMN_INDEX = 16384
const MAX_ROW_INDEX = 1048576

export interface CellAddress {
  row: number
  col: number
}

export function columnToIndex(column: string): number {
  const normalized = column.trim().toUpperCase()
  if (!/^[A-Z]+$/.test(normalized)) {
    throw new ExcelValueError(`Invalid column label: "${column}"`, 'INVALID_COLUMN')
  }

  let result = 0
  for (let i = 0; i < normalized.length; i += 1) {
    result = result * 26 + (normalized.charCodeAt(i) - 64)
  }

  if (result < 1 || result > MAX_COLUMN_INDEX) {
    throw new ExcelValueError(`Column index out of range: ${result}`, 'COLUMN_OUT_OF_RANGE')
  }
  return result
}

export function indexToColumn(index: number): string {
  if (!Number.isInteger(index) || index < 1 || index > MAX_COLUMN_INDEX) {
    throw new ExcelValueError(`Column index out of range: ${index}`, 'COLUMN_OUT_OF_RANGE')
  }

  let value = index
  let label = ''
  while (value > 0) {
    const rem = (value - 1) % 26
    label = String.fromCharCode(65 + rem) + label
    value = Math.floor((value - 1) / 26)
  }
  return label
}

export function parseCellAddress(address: string): CellAddress {
  const normalized = address.trim().toUpperCase()
  const match = /^([A-Z]+)(\d+)$/.exec(normalized)
  if (!match) {
    throw new ExcelValueError(`Invalid cell address: "${address}"`, 'INVALID_ADDRESS')
  }

  const [, colToken, rowToken] = match
  if (!colToken || !rowToken) {
    throw new ExcelValueError(`Invalid cell address: "${address}"`, 'INVALID_ADDRESS')
  }
  const col = columnToIndex(colToken)
  const row = Number.parseInt(rowToken, 10)
  if (!Number.isInteger(row) || row < 1 || row > MAX_ROW_INDEX) {
    throw new ExcelValueError(`Row index out of range: ${row}`, 'ROW_OUT_OF_RANGE')
  }

  return { row, col }
}

export function formatCellAddress(row: number, col: number): string {
  if (!Number.isInteger(row) || row < 1 || row > MAX_ROW_INDEX) {
    throw new ExcelValueError(`Row index out of range: ${row}`, 'ROW_OUT_OF_RANGE')
  }
  return `${indexToColumn(col)}${row}`
}

export function pixelsToExcelWidth(pixels: number): number {
  if (!Number.isFinite(pixels)) {
    throw new ExcelValueError('Pixel width must be a finite number', 'INVALID_WIDTH')
  }
  const width = Math.round(pixels / 7)
  return Math.max(1, Math.min(255, width))
}

export function excelWidthToPixels(width: number): number {
  if (!Number.isFinite(width)) {
    throw new ExcelValueError('Excel width must be a finite number', 'INVALID_WIDTH')
  }
  return Math.round(Math.max(0, width) * 7)
}
