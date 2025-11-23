import { ValidationError } from '../errors'
import type { CellAddress, CellRange } from '../core/types'

/**
 * 将列字母转换为数字索引
 *
 * Excel 列使用字母表示（A, B, C, ..., Z, AA, AB, ...），
 * 此函数将其转换为 0-based 的数字索引。
 *
 * @param letter - 列字母（如 'A', 'Z', 'AA'）
 * @returns 0-based 的列索引
 *
 * @example
 * ```typescript
 * columnLetterToIndex('A')  // 0
 * columnLetterToIndex('B')  // 1
 * columnLetterToIndex('Z')  // 25
 * columnLetterToIndex('AA') // 26
 * columnLetterToIndex('AB') // 27
 * ```
 */
export function columnLetterToIndex(letter: string): number {
  let result = 0
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 65 + 1)
  }
  return result - 1
}

/**
 * 将数字索引转换为列字母
 *
 * 将 0-based 的数字索引转换为 Excel 列字母表示。
 *
 * @param index - 0-based 的列索引
 * @returns 列字母（如 'A', 'Z', 'AA'）
 *
 * @example
 * ```typescript
 * columnIndexToLetter(0)  // 'A'
 * columnIndexToLetter(1)  // 'B'
 * columnIndexToLetter(25) // 'Z'
 * columnIndexToLetter(26) // 'AA'
 * columnIndexToLetter(27) // 'AB'
 * ```
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
 *
 * 将 Excel 的 A1 表示法（如 'A1', 'B2', 'AA10'）解析为行列索引对象。
 *
 * @param address - A1 格式的地址字符串
 * @returns CellAddress 对象，包含 0-based 的行列索引
 * @throws {ValidationError} 如果地址格式无效
 *
 * @example
 * ```typescript
 * parseAddress('A1')   // { row: 0, column: 0 }
 * parseAddress('B2')   // { row: 1, column: 1 }
 * parseAddress('AA10') // { row: 9, column: 26 }
 * parseAddress('Z100') // { row: 99, column: 25 }
 * ```
 */
export function parseAddress(address: string): CellAddress {
  const match = address.match(/^([A-Z]+)(\d+)$/)

  if (!match || !match[1] || !match[2]) {
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
 *
 * 将行列索引对象转换为 Excel 的 A1 表示法。
 *
 * @param address - CellAddress 对象，包含 0-based 的行列索引
 * @returns A1 格式的地址字符串
 *
 * @example
 * ```typescript
 * formatAddress({ row: 0, column: 0 })   // 'A1'
 * formatAddress({ row: 1, column: 1 })   // 'B2'
 * formatAddress({ row: 9, column: 26 })  // 'AA10'
 * formatAddress({ row: 99, column: 25 }) // 'Z100'
 * ```
 */
export function formatAddress(address: CellAddress): string {
  return columnIndexToLetter(address.column) + (address.row + 1)
}

/**
 * 解析范围地址
 *
 * 将 Excel 的范围表示法（如 'A1:B10'）解析为范围对象。
 *
 * @param range - 范围字符串，格式为 'StartAddress:EndAddress'
 * @returns CellRange 对象，包含起始和结束地址
 * @throws {ValidationError} 如果范围格式无效或起始位置在结束位置之后
 *
 * @example
 * ```typescript
 * parseRange('A1:B10')
 * // {
 * //   start: { row: 0, column: 0 },
 * //   end: { row: 9, column: 1 }
 * // }
 *
 * parseRange('C3:E5')
 * // {
 * //   start: { row: 2, column: 2 },
 * //   end: { row: 4, column: 4 }
 * // }
 * ```
 */
export function parseRange(range: string): CellRange {
  const parts = range.split(':')

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
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
 *
 * 将范围对象转换为 Excel 的范围表示法。
 *
 * @param range - CellRange 对象
 * @returns 范围字符串，格式为 'StartAddress:EndAddress'
 *
 * @example
 * ```typescript
 * formatRange({
 *   start: { row: 0, column: 0 },
 *   end: { row: 9, column: 1 }
 * }) // 'A1:B10'
 *
 * formatRange({
 *   start: { row: 2, column: 2 },
 *   end: { row: 4, column: 4 }
 * }) // 'C3:E5'
 * ```
 */
export function formatRange(range: CellRange): string {
  return `${formatAddress(range.start)}:${formatAddress(range.end)}`
}

/**
 * 像素转换为 Excel 列宽单位
 *
 * Excel 使用特殊的单位表示列宽，大约 1 个单位 = 7 像素。
 * Excel 允许的列宽范围是 1-255。
 *
 * @param pixels - 像素值
 * @returns Excel 列宽单位（1-255）
 *
 * @example
 * ```typescript
 * pixelsToExcelWidth(70)  // 约 10
 * pixelsToExcelWidth(140) // 约 20
 * pixelsToExcelWidth(700) // 100
 * ```
 */
export function pixelsToExcelWidth(pixels: number): number {
  const width = pixels / 7
  // 限制在 Excel 允许的范围内（1-255）
  return Math.max(1, Math.min(255, Math.round(width)))
}

/**
 * Excel 列宽单位转换为像素
 *
 * 将 Excel 的列宽单位转换为近似的像素值。
 *
 * @param width - Excel 列宽单位
 * @returns 近似的像素值
 *
 * @example
 * ```typescript
 * excelWidthToPixels(10) // 约 70
 * excelWidthToPixels(20) // 约 140
 * excelWidthToPixels(100) // 约 700
 * ```
 */
export function excelWidthToPixels(width: number): number {
  return Math.round(width * 7)
}
