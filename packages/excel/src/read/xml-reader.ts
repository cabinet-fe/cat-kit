import { parseCellAddress } from '../address'
import { excelSerialToDate } from '../date'
import { ExcelParseError, ExcelSchemaError } from '../errors'
import type {
  CellBorderStyle,
  CellStyle,
  DateSystem,
  WorksheetColumn,
  WorksheetFrozenPane,
  WorksheetOptions
} from '../types'
import { toArray } from '../utils/guards'
import { parseXml } from '../utils/xml'

const BUILTIN_DATE_NUMFMT_IDS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 45, 46, 47])

export interface WorkbookSheetEntry {
  sheetName: string
  sheetPath: string
  sheetIndex: number
}

export interface StyleLookup {
  styles: Array<CellStyle | undefined>
  dateStyleIds: Set<number>
}

export interface ParsedCell {
  row: number
  col: number
  style?: CellStyle
  value: unknown
}

export interface ParsedWorksheet {
  options: WorksheetOptions
  columns: Array<[index: number, column: WorksheetColumn]>
  cells: ParsedCell[]
}

export function parseWorkbookSheets(
  workbookXml: string,
  relsXml: string
): WorkbookSheetEntry[] {
  const workbook = parseXml<any>(workbookXml).workbook
  const rels = parseXml<any>(relsXml).Relationships
  if (!workbook?.sheets?.sheet) {
    throw new ExcelSchemaError('Workbook missing <sheets>', 'MISSING_SHEETS')
  }

  const relationshipById = new Map<string, string>()
  for (const rel of toArray(rels?.Relationship)) {
    if (rel['@_Id'] && rel['@_Target']) {
      relationshipById.set(String(rel['@_Id']), String(rel['@_Target']))
    }
  }

  return toArray(workbook.sheets.sheet).map((sheet, index) => {
    const rid = String(sheet['@_r:id'] ?? '')
    const name = String(sheet['@_name'] ?? '').trim()
    if (!rid || !name) {
      throw new ExcelSchemaError('Invalid sheet reference in workbook.xml', 'INVALID_SHEET_REF')
    }
    const target = relationshipById.get(rid)
    if (!target) {
      throw new ExcelSchemaError(`Missing workbook relation for ${rid}`, 'MISSING_SHEET_REL')
    }
    const normalizedTarget = normalizeSheetTarget(target)
    return {
      sheetName: name,
      sheetPath: normalizedTarget,
      sheetIndex: index
    }
  })
}

export function parseSharedStrings(sharedStringsXml: string | undefined): string[] {
  if (!sharedStringsXml) return []
  const root = parseXml<any>(sharedStringsXml).sst
  if (!root?.si) return []
  return toArray(root.si).map((si: any) => extractSharedStringItem(si))
}

function extractSharedStringItem(si: any): string {
  if (typeof si?.t === 'string') return si.t
  if (si?.t?.['#text']) return String(si.t['#text'])
  if (!si?.r) return ''
  return toArray(si.r)
    .map((run: any) => {
      if (typeof run?.t === 'string') return run.t
      if (run?.t?.['#text']) return String(run.t['#text'])
      return ''
    })
    .join('')
}

export function parseStyles(stylesXml: string | undefined): StyleLookup {
  if (!stylesXml) return { styles: [], dateStyleIds: new Set() }
  const styleSheet = parseXml<any>(stylesXml).styleSheet

  const numFmtMap = new Map<number, string>()
  for (const numFmt of toArray(styleSheet?.numFmts?.numFmt)) {
    const id = Number.parseInt(String(numFmt['@_numFmtId'] ?? ''), 10)
    const code = String(numFmt['@_formatCode'] ?? '')
    if (Number.isInteger(id) && code) {
      numFmtMap.set(id, code)
    }
  }

  const fonts = toArray(styleSheet?.fonts?.font).map((font: any) => {
    const result: NonNullable<CellStyle['font']> = {}
    if (font?.name?.['@_val']) result.name = String(font.name['@_val'])
    if (font?.sz?.['@_val']) result.size = Number.parseFloat(String(font.sz['@_val']))
    if (font?.b != null) result.bold = true
    if (font?.i != null) result.italic = true
    if (font?.u != null) result.underline = true
    if (font?.strike != null) result.strike = true
    if (font?.color?.['@_rgb']) {
      result.color = `#${String(font.color['@_rgb']).slice(-6)}`
    }
    return result
  })

  const fills = toArray(styleSheet?.fills?.fill).map((fill: any) => {
    const patternFill = fill?.patternFill
    const type = String(patternFill?.['@_patternType'] ?? 'none')
    const color = patternFill?.fgColor?.['@_rgb']
    const result: NonNullable<CellStyle['fill']> = {}
    if (type === 'solid') result.type = 'solid'
    if (color) result.color = `#${String(color).slice(-6)}`
    return result
  })

  const borders = toArray(styleSheet?.borders?.border).map((border: any) => {
    const edge = (value: any) => {
      const item: NonNullable<NonNullable<CellBorderStyle['left']>> = {}
      if (value?.['@_style']) item.style = value['@_style']
      if (value?.color?.['@_rgb']) item.color = `#${String(value.color['@_rgb']).slice(-6)}`
      return item
    }
    return {
      left: edge(border?.left),
      right: edge(border?.right),
      top: edge(border?.top),
      bottom: edge(border?.bottom),
      diagonal: edge(border?.diagonal)
    } as CellBorderStyle
  })

  const styles: Array<CellStyle | undefined> = []
  const dateStyleIds = new Set<number>()
  for (const [xfIndex, xf] of toArray(styleSheet?.cellXfs?.xf).entries()) {
    const fontId = Number.parseInt(String(xf['@_fontId'] ?? '0'), 10)
    const fillId = Number.parseInt(String(xf['@_fillId'] ?? '0'), 10)
    const borderId = Number.parseInt(String(xf['@_borderId'] ?? '0'), 10)
    const numFmtId = Number.parseInt(String(xf['@_numFmtId'] ?? '0'), 10)
    const style: CellStyle = {}

    if (fonts[fontId] && Object.keys(fonts[fontId]).length > 0) style.font = fonts[fontId]
    if (fills[fillId] && Object.keys(fills[fillId]).length > 0) style.fill = fills[fillId]
    if (borders[borderId] && Object.keys(borders[borderId]).length > 0) style.border = borders[borderId]
    if (numFmtMap.has(numFmtId)) style.numberFormat = numFmtMap.get(numFmtId)
    if (xf.alignment) {
      style.alignment = {
        horizontal: xf.alignment['@_horizontal'],
        vertical: xf.alignment['@_vertical'],
        wrapText: xf.alignment['@_wrapText'] === '1',
        textRotation: xf.alignment['@_textRotation']
          ? Number.parseInt(String(xf.alignment['@_textRotation']), 10)
          : undefined,
        indent: xf.alignment['@_indent']
          ? Number.parseInt(String(xf.alignment['@_indent']), 10)
          : undefined
      }
    }
    if (xf.protection) {
      style.protection = {
        locked: xf.protection['@_locked'] !== '0',
        hidden: xf.protection['@_hidden'] === '1'
      }
    }

    styles[xfIndex] = Object.keys(style).length > 0 ? style : undefined
    if (BUILTIN_DATE_NUMFMT_IDS.has(numFmtId) || isDateNumberFormat(numFmtMap.get(numFmtId))) {
      dateStyleIds.add(xfIndex)
    }
  }

  return { styles, dateStyleIds }
}

function isDateNumberFormat(formatCode: string | undefined): boolean {
  if (!formatCode) return false
  const cleaned = formatCode.toLowerCase().replaceAll(/"[^"]*"/g, '')
  return /[ymdhis]/.test(cleaned)
}

export function parseWorksheet(
  sheetXml: string,
  sharedStrings: string[],
  styleLookup: StyleLookup,
  dateSystem: DateSystem
): ParsedWorksheet {
  const worksheet = parseXml<any>(sheetXml).worksheet
  if (!worksheet) {
    throw new ExcelParseError('Missing worksheet root element', 'INVALID_WORKSHEET_XML')
  }

  const options = parseWorksheetOptions(worksheet)
  const columns = parseWorksheetColumns(worksheet)
  const cells: ParsedCell[] = []

  const rows = toArray(worksheet?.sheetData?.row)
  for (const rowNode of rows) {
    const rowIndex = rowNode?.['@_r']
      ? Number.parseInt(String(rowNode['@_r']), 10)
      : undefined
    for (const cellNode of toArray(rowNode?.c)) {
      const ref = String(cellNode?.['@_r'] ?? '')
      const address = ref ? parseCellAddress(ref) : undefined
      const col = address?.col ?? inferColumnIndex(cellNode, cells, rowIndex)
      const row = address?.row ?? rowIndex ?? 0
      if (!row || !col) {
        throw new ExcelSchemaError('Cannot resolve cell position', 'CELL_POSITION_UNKNOWN')
      }
      const styleId = parseIntOrZero(cellNode?.['@_s'])
      const style = styleLookup.styles[styleId]
      const value = parseCellValue(cellNode, sharedStrings, styleId, styleLookup, dateSystem)
      cells.push({ row, col, value, style })
    }
  }

  return { options, columns, cells }
}

function parseWorksheetOptions(worksheet: any): WorksheetOptions {
  const options: WorksheetOptions = {}
  if (worksheet?.sheetFormatPr?.['@_defaultRowHeight']) {
    options.defaultRowHeight = Number.parseFloat(String(worksheet.sheetFormatPr['@_defaultRowHeight']))
  }
  if (worksheet?.sheetFormatPr?.['@_defaultColWidth']) {
    options.defaultColWidth = Number.parseFloat(String(worksheet.sheetFormatPr['@_defaultColWidth']))
  }
  const pane = worksheet?.sheetViews?.sheetView?.pane ?? worksheet?.sheetViews?.sheetView?.[0]?.pane
  if (pane) {
    const frozenPane: WorksheetFrozenPane = {}
    if (pane['@_xSplit'] != null) frozenPane.xSplit = Number.parseInt(String(pane['@_xSplit']), 10)
    if (pane['@_ySplit'] != null) frozenPane.ySplit = Number.parseInt(String(pane['@_ySplit']), 10)
    if (pane['@_topLeftCell']) frozenPane.topLeftCell = String(pane['@_topLeftCell'])
    options.frozenPane = frozenPane
  }
  return options
}

function parseWorksheetColumns(worksheet: any): Array<[index: number, column: WorksheetColumn]> {
  const result: Array<[index: number, column: WorksheetColumn]> = []
  const colNodes = toArray(worksheet?.cols?.col)
  for (const colNode of colNodes) {
    const min = Number.parseInt(String(colNode['@_min'] ?? '0'), 10)
    const max = Number.parseInt(String(colNode['@_max'] ?? String(min)), 10)
    for (let index = min; index <= max; index += 1) {
      result.push([
        index,
        {
          width: colNode['@_width'] != null
            ? Number.parseFloat(String(colNode['@_width']))
            : undefined,
          hidden: colNode['@_hidden'] === '1'
        }
      ])
    }
  }
  return result
}

function inferColumnIndex(cellNode: any, cells: ParsedCell[], rowIndex?: number): number {
  if (rowIndex == null) return 0
  const rowCells = cells.filter(cell => cell.row === rowIndex)
  if (rowCells.length === 0) return 1
  const last = rowCells[rowCells.length - 1]
  if (!last) return 1
  return last.col + 1
}

function parseCellValue(
  cellNode: any,
  sharedStrings: string[],
  styleId: number,
  styleLookup: StyleLookup,
  dateSystem: DateSystem
): unknown {
  const type = String(cellNode?.['@_t'] ?? '')
  const raw = cellNode?.v
  const formula = typeof cellNode?.f === 'string' ? cellNode.f : cellNode?.f?.['#text']

  let value: unknown
  if (type === 's') {
    const index = Number.parseInt(String(raw ?? '-1'), 10)
    value = sharedStrings[index] ?? ''
  } else if (type === 'inlineStr') {
    value = parseInlineString(cellNode?.is)
  } else if (type === 'b') {
    value = String(raw ?? '') === '1'
  } else if (type === 'str') {
    value = raw != null ? String(raw) : ''
  } else if (raw == null || raw === '') {
    value = null
  } else {
    const numeric = Number.parseFloat(String(raw))
    if (!Number.isFinite(numeric)) {
      throw new ExcelParseError(`Invalid numeric cell value: ${raw}`, 'INVALID_NUMERIC_VALUE')
    }
    value = !formula && styleLookup.dateStyleIds.has(styleId)
      ? excelSerialToDate(numeric, dateSystem)
      : numeric
  }

  if (formula) {
    const result = value as string | number | boolean | null
    return {
      formula: String(formula),
      result
    }
  }
  return value
}

function parseInlineString(node: any): string {
  if (!node) return ''
  if (typeof node.t === 'string') return node.t
  if (node.t?.['#text']) return String(node.t['#text'])
  if (!node.r) return ''
  return toArray(node.r)
    .map((run: any) => {
      if (typeof run?.t === 'string') return run.t
      if (run?.t?.['#text']) return String(run.t['#text'])
      return ''
    })
    .join('')
}

function parseIntOrZero(value: unknown): number {
  if (value == null || value === '') return 0
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeSheetTarget(target: string): string {
  const trimmed = target.replace(/^\/+/, '')
  if (trimmed.startsWith('xl/')) return trimmed
  if (trimmed.startsWith('worksheets/')) return `xl/${trimmed}`
  return `xl/${trimmed}`
}
