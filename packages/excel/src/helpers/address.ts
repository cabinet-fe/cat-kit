import { ValidationError } from '../errors'
import type { CellAddress, CellRange } from '../core/types'

/**
 * 将列字母转换为数字索引（A=0, B=1, ..., Z=25, AA=26, ...）
 */
export function columnLetterToIndex(letter: string): number {
  let result = 0
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 65 + 1)
  }
  return result - 1
}

/**
 * 将数字索引转换为列字母（0=A, 1=B, ..., 25=Z, 26=AA, ...）
 */
export function columnIndexToLetter(index: number): string {
  let letter = ''
  let num = index + 1

  while (num > 0) {
    const remainder = (num - 1) % 26
    letter = String.fromCharCode(65 + remainder) + letter
    num = Math.floor((num - 1) / 26)
  }

  return letter
}

/**
 * 解析 A1 格式的单元格地址
 * @example parseAddress('A1') => { row: 0, column: 0 }
 * @example parseAddress('AA10') => { row: 9, column: 26 }
 */
export function parseAddress(address: string): CellAddress {
  const match = address.match(/^([A-Z]+)(\d+)$/)

  if (!match) {
    throw new ValidationError(`无效的单元格地址: ${address}`)
  }

  const [, columnLetter, rowNumber] = match
  const column = columnLetterToIndex(columnLetter)
  const row = parseInt(rowNumber, 10) - 1

  if (row < 0) {
    throw new ValidationError(`无效的行号: ${rowNumber}`)
  }

  return { row, column }
}

/**
 * 将地址对象转换为 A1 格式字符串
 */
export function formatAddress(address: CellAddress): string {
  return columnIndexToLetter(address.column) + (address.row + 1)
}

/**
 * 解析范围地址（如 "A1:B10"）
 */
export function parseRange(range: string): CellRange {
  const parts = range.split(':')

  if (parts.length !== 2) {
    throw new ValidationError(`无效的范围格式: ${range}`)
  }

  const [startAddr, endAddr] = parts
  const start = parseAddress(startAddr)
  const end = parseAddress(endAddr)

  if (start.row > end.row || start.column > end.column) {
    throw new ValidationError(`无效的范围: 起始位置必须在结束位置之前`)
  }

  return { start, end }
}

/**
 * 将范围对象转换为字符串格式
 */
export function formatRange(range: CellRange): string {
  return `${formatAddress(range.start)}:${formatAddress(range.end)}`
}

/**
 * 像素转换为 Excel 列宽单位
 * Excel 列宽单位约等于 7 像素
 */
export function pixelsToExcelWidth(pixels: number): number {
  const width = pixels / 7
  // 限制在 Excel 允许的范围内（1-255）
  return Math.max(1, Math.min(255, Math.round(width)))
}

/**
 * Excel 列宽单位转换为像素
 */
export function excelWidthToPixels(width: number): number {
  return Math.round(width * 7)
}

