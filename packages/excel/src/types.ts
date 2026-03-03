export type DateSystem = 1900 | 1904

export type CellPrimitive = string | number | boolean | null

export interface FormulaValue {
  formula: string
  result?: CellPrimitive
}

export type CellValue = CellPrimitive | Date | FormulaValue

export interface CellFontStyle {
  name?: string
  size?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  color?: string
}

export interface CellFillStyle {
  type?: 'none' | 'solid'
  color?: string
}

export interface CellBorderEdgeStyle {
  style?:
    | 'none'
    | 'thin'
    | 'medium'
    | 'thick'
    | 'double'
    | 'dotted'
    | 'dashed'
    | 'dashDot'
    | 'dashDotDot'
  color?: string
}

export interface CellBorderStyle {
  left?: CellBorderEdgeStyle
  right?: CellBorderEdgeStyle
  top?: CellBorderEdgeStyle
  bottom?: CellBorderEdgeStyle
  diagonal?: CellBorderEdgeStyle
}

export interface CellAlignmentStyle {
  horizontal?:
    | 'general'
    | 'left'
    | 'center'
    | 'right'
    | 'fill'
    | 'justify'
    | 'centerContinuous'
    | 'distributed'
  vertical?:
    | 'top'
    | 'center'
    | 'bottom'
    | 'justify'
    | 'distributed'
  wrapText?: boolean
  textRotation?: number
  indent?: number
}

export interface CellProtectionStyle {
  locked?: boolean
  hidden?: boolean
}

export interface CellStyle {
  font?: CellFontStyle
  fill?: CellFillStyle
  border?: CellBorderStyle
  alignment?: CellAlignmentStyle
  numberFormat?: string
  protection?: CellProtectionStyle
}

export interface WorksheetColumn {
  key?: string
  header?: string
  width?: number
  hidden?: boolean
  style?: CellStyle
}

export interface WorksheetFrozenPane {
  xSplit?: number
  ySplit?: number
  topLeftCell?: string
}

export interface WorksheetOptions {
  frozenPane?: WorksheetFrozenPane
  defaultRowHeight?: number
  defaultColWidth?: number
}

export interface WorkbookMetadata {
  creator?: string
  lastModifiedBy?: string
  createdAt?: Date
  modifiedAt?: Date
}

export interface ReadOptions {
  dateSystem?: DateSystem
  strict?: boolean
}

export interface ReadStreamOptions extends ReadOptions {
  sheets?: string[]
  includeEmptyRows?: boolean
}

export interface WriteOptions {
  dateSystem?: DateSystem
  useSharedStrings?: boolean
  compressionLevel?: number
}

export type WorkbookInput =
  | Uint8Array
  | ArrayBuffer
  | Blob
  | ReadableStream<Uint8Array>
  | AsyncIterable<Uint8Array>

export interface StreamSheetStartEvent {
  type: 'sheetStart'
  sheetName: string
  sheetIndex: number
}

export interface StreamSheetEndEvent {
  type: 'sheetEnd'
  sheetName: string
  sheetIndex: number
}

export interface StreamRowEvent {
  type: 'row'
  sheetName: string
  sheetIndex: number
  rowIndex: number
  values: CellValue[]
}

export type StreamEvent =
  | StreamSheetStartEvent
  | StreamSheetEndEvent
  | StreamRowEvent
