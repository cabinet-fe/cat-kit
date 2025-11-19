/**
 * Excel Library v2 - 现代化 API
 *
 * 基于不可变数据结构和 Web Streams API 的 Excel 库
 */

// 核心类
export { Cell } from './core/cell'
export { Row } from './core/row'
export { Worksheet } from './core/worksheet'
export { Workbook } from './core/workbook'

// 读取功能
export { readWorkbook } from './reader/xlsx-reader'

// 类型
export type {
  CellValue,
  CellStyle,
  CellFont,
  CellBorder,
  CellFill,
  CellAlignment,
  MergedCellRange,
  WorkbookMetadata,
  CellAddress,
  CellRange
} from './core/types'

export type {
  TableColumn,
  TableData,
  WorksheetOptions
} from './core/worksheet'

// 错误类
export {
  ExcelError,
  FileFormatError,
  ParseError,
  StreamError,
  ValidationError,
  MemoryError
} from './errors'

// 辅助函数
export {
  parseAddress,
  formatAddress,
  parseRange,
  formatRange,
  columnLetterToIndex,
  columnIndexToLetter,
  pixelsToExcelWidth,
  excelWidthToPixels
} from './helpers/address'

