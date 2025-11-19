/**
 * 单元格值类型
 */
export type CellValue = string | number | Date | boolean | null

/**
 * 字体样式
 */
export interface CellFont {
  name?: string
  size?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  color?: string
}

/**
 * 边框样式
 */
export interface CellBorder {
  top?: {
    style?: 'thin' | 'medium' | 'thick' | 'double'
    color?: string
  }
  right?: {
    style?: 'thin' | 'medium' | 'thick' | 'double'
    color?: string
  }
  bottom?: {
    style?: 'thin' | 'medium' | 'thick' | 'double'
    color?: string
  }
  left?: {
    style?: 'thin' | 'medium' | 'thick' | 'double'
    color?: string
  }
}

/**
 * 填充样式
 */
export interface CellFill {
  fgColor?: string
  bgColor?: string
  patternType?:
    | 'none'
    | 'solid'
    | 'mediumGray'
    | 'darkGray'
    | 'lightGray'
    | 'gray125'
}

/**
 * 对齐方式
 */
export interface CellAlignment {
  horizontal?: 'left' | 'center' | 'right'
  vertical?: 'top' | 'middle' | 'bottom'
  wrapText?: boolean
  indent?: number
}

/**
 * 单元格样式
 */
export interface CellStyle {
  font?: CellFont
  border?: CellBorder
  fill?: CellFill
  alignment?: CellAlignment
  numberFormat?: string
}

/**
 * 合并单元格配置
 */
export interface MergedCellRange {
  start: { row: number; column: number }
  end: { row: number; column: number }
}

/**
 * Workbook 元数据
 */
export interface WorkbookMetadata {
  creator?: string
  lastModifiedBy?: string
  created?: Date
  modified?: Date
  customProperties?: Record<string, string | number | boolean>
}

/**
 * 单元格地址
 */
export interface CellAddress {
  row: number
  column: number
}

/**
 * 单元格范围
 */
export interface CellRange {
  start: CellAddress
  end: CellAddress
}
