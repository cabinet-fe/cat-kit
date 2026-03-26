import { formatCellAddress } from '../address'
import { dateToExcelSerial } from '../date'
import { ExcelWriteError } from '../errors'
import { SharedStringPool } from '../model/shared-string'
import { StylePool, type StyleSnapshot } from '../model/style'
import { Workbook } from '../model/workbook'
import { Worksheet } from '../model/worksheet'
import type { CellStyle, DateSystem } from '../types'
import { isFormulaValue } from '../utils/guards'
import { escapeXml, xmlAttr, xmlLeaf, xmlNode } from '../utils/xml'

const SHEET_XMLNS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const REL_XMLNS = 'http://schemas.openxmlformats.org/package/2006/relationships'
const DOC_REL_XMLNS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'

export interface WorksheetWriteContext {
  stylePool: StylePool
  sharedStrings: SharedStringPool
  useSharedStrings: boolean
  dateSystem: DateSystem
  defaultDateStyleId: number
}

export interface WorkbookSheetRef {
  id: number
  name: string
  rid: string
  path: string
}

export function buildContentTypesXml(sheetCount: number, hasSharedStrings: boolean): string {
  const sheetOverrides = new Array(sheetCount)
    .fill(0)
    .map((_, index) =>
      xmlLeaf(
        'Override',
        `${xmlAttr('PartName', `/xl/worksheets/sheet${index + 1}.xml`)}${xmlAttr(
          'ContentType',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml'
        )}`
      )
    )
    .join('')
  const sharedStringsOverride = hasSharedStrings
    ? xmlLeaf(
        'Override',
        `${xmlAttr('PartName', '/xl/sharedStrings.xml')}${xmlAttr(
          'ContentType',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml'
        )}`
      )
    : ''

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    xmlLeaf(
      'Default',
      `${xmlAttr('Extension', 'rels')}${xmlAttr(
        'ContentType',
        'application/vnd.openxmlformats-package.relationships+xml'
      )}`
    ) +
    xmlLeaf(
      'Default',
      `${xmlAttr('Extension', 'xml')}${xmlAttr('ContentType', 'application/xml')}`
    ) +
    xmlLeaf(
      'Override',
      `${xmlAttr('PartName', '/xl/workbook.xml')}${xmlAttr(
        'ContentType',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml'
      )}`
    ) +
    xmlLeaf(
      'Override',
      `${xmlAttr('PartName', '/xl/styles.xml')}${xmlAttr(
        'ContentType',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml'
      )}`
    ) +
    xmlLeaf(
      'Override',
      `${xmlAttr('PartName', '/docProps/core.xml')}${xmlAttr(
        'ContentType',
        'application/vnd.openxmlformats-package.core-properties+xml'
      )}`
    ) +
    xmlLeaf(
      'Override',
      `${xmlAttr('PartName', '/docProps/app.xml')}${xmlAttr(
        'ContentType',
        'application/vnd.openxmlformats-officedocument.extended-properties+xml'
      )}`
    ) +
    sharedStringsOverride +
    sheetOverrides +
    '</Types>'
  )
}

export function buildRootRelsXml(): string {
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<Relationships xmlns="${REL_XMLNS}">` +
    xmlLeaf(
      'Relationship',
      `${xmlAttr('Id', 'rId1')}${xmlAttr(
        'Type',
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument'
      )}${xmlAttr('Target', 'xl/workbook.xml')}`
    ) +
    xmlLeaf(
      'Relationship',
      `${xmlAttr('Id', 'rId2')}${xmlAttr(
        'Type',
        'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties'
      )}${xmlAttr('Target', 'docProps/core.xml')}`
    ) +
    xmlLeaf(
      'Relationship',
      `${xmlAttr('Id', 'rId3')}${xmlAttr(
        'Type',
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties'
      )}${xmlAttr('Target', 'docProps/app.xml')}`
    ) +
    '</Relationships>'
  )
}

export function buildWorkbookXml(sheets: WorkbookSheetRef[]): string {
  const sheetNodes = sheets
    .map((ref) =>
      xmlLeaf(
        'sheet',
        `${xmlAttr('name', ref.name)}${xmlAttr('sheetId', ref.id)}${xmlAttr('r:id', ref.rid)}`
      )
    )
    .join('')

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<workbook xmlns="${SHEET_XMLNS}" xmlns:r="${DOC_REL_XMLNS}">` +
    '<bookViews><workbookView/></bookViews>' +
    xmlNode('sheets', sheetNodes) +
    '</workbook>'
  )
}

export function buildWorkbookRelsXml(
  sheets: WorkbookSheetRef[],
  hasSharedStrings: boolean
): string {
  const sheetRels = sheets
    .map((ref) =>
      xmlLeaf(
        'Relationship',
        `${xmlAttr('Id', ref.rid)}${xmlAttr(
          'Type',
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet'
        )}${xmlAttr('Target', `worksheets/sheet${ref.id}.xml`)}`
      )
    )
    .join('')
  const styleRel = xmlLeaf(
    'Relationship',
    `${xmlAttr('Id', 'rIdStyles')}${xmlAttr(
      'Type',
      'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles'
    )}${xmlAttr('Target', 'styles.xml')}`
  )
  const sharedRel = hasSharedStrings
    ? xmlLeaf(
        'Relationship',
        `${xmlAttr('Id', 'rIdSharedStrings')}${xmlAttr(
          'Type',
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings'
        )}${xmlAttr('Target', 'sharedStrings.xml')}`
      )
    : ''

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<Relationships xmlns="${REL_XMLNS}">` +
    sheetRels +
    styleRel +
    sharedRel +
    '</Relationships>'
  )
}

export function buildCorePropsXml(workbook: Workbook): string {
  const created = workbook.metadata.createdAt ?? new Date()
  const modified = workbook.metadata.modifiedAt ?? new Date()
  const creator = workbook.metadata.creator ?? 'cat-kit'
  const lastModifiedBy = workbook.metadata.lastModifiedBy ?? creator
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<cp:coreProperties ' +
    'xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
    'xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
    'xmlns:dcterms="http://purl.org/dc/terms/" ' +
    'xmlns:dcmitype="http://purl.org/dc/dcmitype/" ' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
    xmlNode('dc:creator', escapeXml(creator)) +
    xmlNode('cp:lastModifiedBy', escapeXml(lastModifiedBy)) +
    xmlNode(
      'dcterms:created',
      escapeXml(created.toISOString()),
      `${xmlAttr('xsi:type', 'dcterms:W3CDTF')}`
    ) +
    xmlNode(
      'dcterms:modified',
      escapeXml(modified.toISOString()),
      `${xmlAttr('xsi:type', 'dcterms:W3CDTF')}`
    ) +
    '</cp:coreProperties>'
  )
}

export function buildAppPropsXml(workbook: Workbook): string {
  const titles = workbook.worksheets
    .map((sheet) => xmlNode('vt:lpstr', escapeXml(sheet.name)))
    .join('')
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" ' +
    'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' +
    xmlNode('Application', 'cat-kit excel') +
    xmlNode(
      'HeadingPairs',
      `<vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>${workbook.worksheets.length}</vt:i4></vt:variant></vt:vector>`
    ) +
    xmlNode(
      'TitlesOfParts',
      `<vt:vector size="${workbook.worksheets.length}" baseType="lpstr">${titles}</vt:vector>`
    ) +
    '</Properties>'
  )
}

export function buildSharedStringsXml(pool: SharedStringPool): string {
  const all = pool.all()
  const nodes = all.map((item) => xmlNode('si', xmlNode('t', escapeXml(item)))).join('')
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<sst xmlns="${SHEET_XMLNS}"${xmlAttr('count', all.length)}${xmlAttr(
      'uniqueCount',
      all.length
    )}>${nodes}</sst>`
  )
}

export function buildStylesXml(snapshot: StyleSnapshot): string {
  const numFmtNodes = snapshot.numFmts
    .map((item) =>
      xmlLeaf('numFmt', `${xmlAttr('numFmtId', item.id)}${xmlAttr('formatCode', item.code)}`)
    )
    .join('')

  const fontNodes = snapshot.fonts
    .map((font) => {
      let body = ''
      if (font.bold) body += xmlLeaf('b')
      if (font.italic) body += xmlLeaf('i')
      if (font.underline) body += xmlLeaf('u')
      if (font.strike) body += xmlLeaf('strike')
      if (font.size != null) body += xmlLeaf('sz', xmlAttr('val', font.size))
      if (font.color) body += xmlLeaf('color', xmlAttr('rgb', font.color))
      if (font.name) body += xmlLeaf('name', xmlAttr('val', font.name))
      return xmlNode('font', body)
    })
    .join('')

  const fillNodes = snapshot.fills
    .map((fill, index) => {
      if (index === 1) {
        return xmlNode('fill', xmlNode('patternFill', '', xmlAttr('patternType', 'gray125')))
      }
      if (fill.type === 'solid' && fill.color) {
        const pattern =
          xmlLeaf('fgColor', xmlAttr('rgb', fill.color)) +
          xmlLeaf('bgColor', xmlAttr('indexed', 64))
        return xmlNode('fill', xmlNode('patternFill', pattern, xmlAttr('patternType', 'solid')))
      }
      return xmlNode('fill', xmlNode('patternFill', '', xmlAttr('patternType', 'none')))
    })
    .join('')

  const borderNodes = snapshot.borders
    .map((border) => {
      const edge = (name: string, data: { style?: string; color?: string }): string => {
        const attrs = data.style ? xmlAttr('style', data.style) : ''
        const body = data.color ? xmlLeaf('color', xmlAttr('rgb', data.color)) : ''
        return xmlNode(name, body, attrs)
      }
      return xmlNode(
        'border',
        edge('left', border.left) +
          edge('right', border.right) +
          edge('top', border.top) +
          edge('bottom', border.bottom) +
          edge('diagonal', border.diagonal)
      )
    })
    .join('')

  const xfNodes = snapshot.xfs
    .map((xf) => {
      const hasAlignment = xf.alignment && Object.values(xf.alignment).some((v) => v !== undefined)
      const hasProtection =
        xf.protection && Object.values(xf.protection).some((v) => v !== undefined)
      const attrs =
        xmlAttr('numFmtId', xf.numFmtId) +
        xmlAttr('fontId', xf.fontId) +
        xmlAttr('fillId', xf.fillId) +
        xmlAttr('borderId', xf.borderId) +
        xmlAttr('xfId', 0) +
        xmlAttr('applyNumberFormat', xf.numFmtId !== 0 ? 1 : undefined) +
        xmlAttr('applyFont', xf.fontId !== 0 ? 1 : undefined) +
        xmlAttr('applyFill', xf.fillId !== 0 ? 1 : undefined) +
        xmlAttr('applyBorder', xf.borderId !== 0 ? 1 : undefined) +
        xmlAttr('applyAlignment', hasAlignment ? 1 : undefined) +
        xmlAttr('applyProtection', hasProtection ? 1 : undefined)

      const alignmentNode = hasAlignment
        ? xmlLeaf(
            'alignment',
            xmlAttr('horizontal', xf.alignment?.horizontal) +
              xmlAttr('vertical', xf.alignment?.vertical) +
              xmlAttr('wrapText', xf.alignment?.wrapText ? 1 : undefined) +
              xmlAttr('textRotation', xf.alignment?.textRotation) +
              xmlAttr('indent', xf.alignment?.indent)
          )
        : ''
      const protectionNode = hasProtection
        ? xmlLeaf(
            'protection',
            xmlAttr('locked', xf.protection?.locked === false ? 0 : undefined) +
              xmlAttr('hidden', xf.protection?.hidden ? 1 : undefined)
          )
        : ''

      return xmlNode('xf', alignmentNode + protectionNode, attrs)
    })
    .join('')

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<styleSheet xmlns="${SHEET_XMLNS}">` +
    xmlNode('numFmts', numFmtNodes, xmlAttr('count', snapshot.numFmts.length)) +
    xmlNode('fonts', fontNodes, xmlAttr('count', snapshot.fonts.length)) +
    xmlNode('fills', fillNodes, xmlAttr('count', snapshot.fills.length)) +
    xmlNode('borders', borderNodes, xmlAttr('count', snapshot.borders.length)) +
    xmlNode(
      'cellStyleXfs',
      xmlLeaf(
        'xf',
        `${xmlAttr('numFmtId', 0)}${xmlAttr('fontId', 0)}${xmlAttr('fillId', 0)}${xmlAttr(
          'borderId',
          0
        )}`
      ),
      xmlAttr('count', 1)
    ) +
    xmlNode('cellXfs', xfNodes, xmlAttr('count', snapshot.xfs.length)) +
    xmlNode(
      'cellStyles',
      xmlLeaf(
        'cellStyle',
        `${xmlAttr('name', 'Normal')}${xmlAttr('xfId', 0)}${xmlAttr('builtinId', 0)}`
      ),
      xmlAttr('count', 1)
    ) +
    '</styleSheet>'
  )
}

export function buildWorksheetXml(sheet: Worksheet, ctx: WorksheetWriteContext): string {
  const rows = sheet.getRows()
  const cols = sheet.getColumns()

  const colsNode = cols.length
    ? xmlNode(
        'cols',
        cols
          .map(([index, col]) =>
            xmlLeaf(
              'col',
              xmlAttr('min', index) +
                xmlAttr('max', index) +
                xmlAttr('width', col.width) +
                xmlAttr('customWidth', col.width != null ? 1 : undefined) +
                xmlAttr('hidden', col.hidden ? 1 : undefined)
            )
          )
          .join('')
      )
    : ''

  const sheetViews = sheet.options.frozenPane
    ? xmlNode(
        'sheetViews',
        xmlNode(
          'sheetView',
          xmlLeaf(
            'pane',
            xmlAttr('xSplit', sheet.options.frozenPane.xSplit) +
              xmlAttr('ySplit', sheet.options.frozenPane.ySplit) +
              xmlAttr('topLeftCell', sheet.options.frozenPane.topLeftCell) +
              xmlAttr('state', 'frozen')
          ),
          xmlAttr('workbookViewId', 0)
        )
      )
    : xmlNode('sheetViews', xmlLeaf('sheetView', xmlAttr('workbookViewId', 0)))

  const dimensionRef = resolveDimensionRef(sheet)
  const dimensionNode = dimensionRef ? xmlLeaf('dimension', xmlAttr('ref', dimensionRef)) : ''

  const rowNodes = rows
    .map((row) => {
      const rowCells = row
        .getCells()
        .map(([colIndex, cell]) => {
          const cellRef = formatCellAddress(row.index, colIndex)
          const columnStyle = sheet.getColumn(colIndex)?.style
          const styleId = resolveStyleId(cell.style ?? columnStyle, ctx)
          return serializeCell(cellRef, cell.value, styleId, ctx)
        })
        .filter(Boolean)
        .join('')
      return xmlNode('row', rowCells, xmlAttr('r', row.index))
    })
    .join('')

  const sheetFormatPr = xmlLeaf(
    'sheetFormatPr',
    xmlAttr('defaultRowHeight', sheet.options.defaultRowHeight ?? 15) +
      xmlAttr('defaultColWidth', sheet.options.defaultColWidth)
  )

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<worksheet xmlns="${SHEET_XMLNS}" xmlns:r="${DOC_REL_XMLNS}">` +
    sheetViews +
    dimensionNode +
    sheetFormatPr +
    colsNode +
    xmlNode('sheetData', rowNodes) +
    '</worksheet>'
  )
}

function resolveDimensionRef(sheet: Worksheet): string | undefined {
  const maxRow = sheet.maxRowIndex()
  const maxCol = sheet.maxColIndex()
  if (maxRow <= 0 || maxCol <= 0) return undefined
  return `A1:${formatCellAddress(maxRow, maxCol)}`
}

function resolveStyleId(style: CellStyle | undefined, ctx: WorksheetWriteContext): number {
  if (!style) return 0
  return ctx.stylePool.register(style)
}

function serializeCell(
  cellRef: string,
  value: unknown,
  styleId: number,
  ctx: WorksheetWriteContext
): string {
  if (value == null && styleId === 0) return ''
  const styleAttr = styleId > 0 ? xmlAttr('s', styleId) : ''
  const commonAttrs = `${xmlAttr('r', cellRef)}${styleAttr}`

  if (isFormulaValue(value)) {
    const formulaBody = xmlNode('f', escapeXml(value.formula))
    const resultBody = serializeFormulaResult(value.result)
    const resultType = resolveFormulaResultType(value.result)
    return xmlNode('c', formulaBody + resultBody, `${commonAttrs}${xmlAttr('t', resultType)}`)
  }

  if (typeof value === 'string') {
    if (ctx.useSharedStrings) {
      const index = ctx.sharedStrings.add(value)
      return xmlNode('c', xmlNode('v', String(index)), `${commonAttrs}${xmlAttr('t', 's')}`)
    }
    return xmlNode(
      'c',
      xmlNode('is', xmlNode('t', escapeXml(value))),
      `${commonAttrs}${xmlAttr('t', 'inlineStr')}`
    )
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new ExcelWriteError(
        `Invalid numeric value in cell ${cellRef}`,
        'INVALID_NUMBER',
        cellRef
      )
    }
    return xmlNode('c', xmlNode('v', String(value)), commonAttrs)
  }

  if (typeof value === 'boolean') {
    return xmlNode('c', xmlNode('v', value ? '1' : '0'), `${commonAttrs}${xmlAttr('t', 'b')}`)
  }

  if (value instanceof Date) {
    const serial = dateToExcelSerial(value, ctx.dateSystem)
    const dateStyle = styleId === 0 ? ctx.defaultDateStyleId : styleId
    return xmlNode(
      'c',
      xmlNode('v', String(serial)),
      `${xmlAttr('r', cellRef)}${xmlAttr('s', dateStyle)}`
    )
  }

  if (value == null) {
    return xmlLeaf('c', commonAttrs)
  }

  throw new ExcelWriteError(`Unsupported value in cell ${cellRef}`, 'UNSUPPORTED_VALUE', cellRef)
}

function resolveFormulaResultType(result: unknown): 'str' | 'b' | undefined {
  if (typeof result === 'string') return 'str'
  if (typeof result === 'boolean') return 'b'
  return undefined
}

function serializeFormulaResult(result: unknown): string {
  if (result == null) return ''
  if (typeof result === 'boolean') return xmlNode('v', result ? '1' : '0')
  return xmlNode('v', escapeXml(String(result)))
}
