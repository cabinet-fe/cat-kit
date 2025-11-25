/**
 * v2 XLSX 写入器 - 使用 fflate 优化体积
 *
 * 这是一个轻量级的 XLSX 写入实现，使用 fflate 替代 JSZip
 */

import { strToU8 } from 'fflate'
import type { Workbook } from '../core/workbook'
import type { Worksheet } from '../core/worksheet'
import type { Cell } from '../core/cell'
import type { CellStyle, WorkbookMetadata } from '../core/types'
import { isCellFormula, isCellError } from '../core/types'
import { columnIndexToLetter } from '../helpers/address'
import { dateToExcelNumber } from '../helpers/date'
import { isString, isNumber, isDate } from '@cat-kit/core'

/**
 * 写入 Workbook 为 XLSX Blob
 */
export async function writeWorkbook(workbook: Workbook): Promise<Blob> {
  const files = generateXLSXFiles(workbook)

  // 使用 fflate 异步压缩
  return new Promise((resolve, reject) => {
    import('fflate').then(({ zip }) => {
      zip(files, { level: 6 }, (err, data) => {
        if (err) {
          reject(err)
          return
        }
        // 转换为 Blob
        resolve(
          new Blob([data as any], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
        )
      })
    })
  })
}

/**
 * 生成 XLSX 文件结构
 */
function generateXLSXFiles(workbook: Workbook): Record<string, Uint8Array> {
  const files: Record<string, Uint8Array> = {}

  // [Content_Types].xml
  files['[Content_Types].xml'] = strToU8(generateContentTypes(workbook))

  // _rels/.rels
  files['_rels/.rels'] = strToU8(generateRootRels())

  // xl/_rels/workbook.xml.rels
  files['xl/_rels/workbook.xml.rels'] = strToU8(generateWorkbookRels(workbook))

  // xl/workbook.xml
  files['xl/workbook.xml'] = strToU8(generateWorkbookXML(workbook))

  // xl/styles.xml
  const { xml: stylesXML, styleManager } = generateStylesXML(workbook)
  files['xl/styles.xml'] = strToU8(stylesXML)

  // xl/sharedStrings.xml
  const { xml: sharedStringsXML, stringMap } = generateSharedStrings(workbook)
  files['xl/sharedStrings.xml'] = strToU8(sharedStringsXML)

  // xl/worksheets/sheetN.xml
  workbook.sheets.forEach((sheet, index) => {
    files[`xl/worksheets/sheet${index + 1}.xml`] = strToU8(
      generateWorksheetXML(sheet, stringMap, styleManager)
    )
  })

  // 元数据文件
  if (workbook.metadata) {
    files['docProps/core.xml'] = strToU8(
      generateCorePropsXML(workbook.metadata)
    )
    files['docProps/app.xml'] = strToU8(generateAppPropsXML(workbook))
  }

  return files
}

/**
 * 生成 [Content_Types].xml
 */
function generateContentTypes(workbook: Workbook): string {
  const sheetOverrides = workbook.sheets
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${
          i + 1
        }.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('\n  ')

  const metadataOverrides = workbook.metadata
    ? `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  ${sheetOverrides}
  ${metadataOverrides ? metadataOverrides + '\n  ' : ''}</Types>`
}

/**
 * 生成 _rels/.rels
 */
function generateRootRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
}

/**
 * 生成 xl/_rels/workbook.xml.rels
 */
function generateWorkbookRels(workbook: Workbook): string {
  const sheetRels = workbook.sheets
    .map(
      (_, i) =>
        `<Relationship Id="rId${
          i + 3
        }" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${
          i + 1
        }.xml"/>`
    )
    .join('\n  ')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
  ${sheetRels}
</Relationships>`
}

/**
 * 生成 xl/workbook.xml
 */
function generateWorkbookXML(workbook: Workbook): string {
  const sheets = workbook.sheets
    .map(
      (sheet, i) =>
        `<sheet name="${escapeXML(sheet.name)}" sheetId="${i + 1}" r:id="rId${
          i + 3
        }"/>`
    )
    .join('\n    ')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${sheets}
  </sheets>
</workbook>`
}

/**
 * 样式管理器 - 收集并生成唯一样式
 */
class StyleManager {
  private fonts: CellStyle['font'][] = []
  private fills: CellStyle['fill'][] = []
  private borders: CellStyle['border'][] = []
  private numFmts: Array<{ id: number; code: string }> = []
  private cellXfs: string[] = []
  private styleCache = new Map<string, number>()
  private customNumFmtId = 164 // Excel 自定义格式从 164 开始

  constructor() {
    // 添加默认字体
    this.fonts.push({ size: 11, name: 'Calibri' })

    // 添加默认填充（Excel 要求前两个）
    this.fills.push({ patternType: 'none' })
    this.fills.push({ patternType: 'gray125' })

    // 添加默认边框
    this.borders.push({})

    // 添加默认 cellXf
    this.cellXfs.push('<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>')
    this.styleCache.set(this.getStyleKey({}), 0)
  }

  /**
   * 注册样式并返回样式索引
   */
  registerStyle(style: CellStyle | undefined): number {
    if (!style) return 0

    const key = this.getStyleKey(style)
    if (this.styleCache.has(key)) {
      return this.styleCache.get(key)!
    }

    // 注册字体
    let fontId = 0
    if (style.font) {
      fontId = this.registerFont(style.font)
    }

    // 注册填充
    let fillId = 0
    if (style.fill) {
      fillId = this.registerFill(style.fill)
    }

    // 注册边框
    let borderId = 0
    if (style.border) {
      borderId = this.registerBorder(style.border)
    }

    // 数字格式
    const numFmtId = this.getNumFmtId(style.numberFormat)

    // 对齐
    const alignmentXml = this.getAlignmentXml(style.alignment)

    // 创建 cellXf
    const xf = `<xf numFmtId="${numFmtId}" fontId="${fontId}" fillId="${fillId}" borderId="${borderId}"${
      fontId > 0 ? ' applyFont="1"' : ''
    }${fillId > 0 ? ' applyFill="1"' : ''}${
      borderId > 0 ? ' applyBorder="1"' : ''
    }${numFmtId > 0 ? ' applyNumberFormat="1"' : ''}${
      alignmentXml ? ' applyAlignment="1"' : ''
    }>${alignmentXml}</xf>`

    const styleId = this.cellXfs.length
    this.cellXfs.push(xf)
    this.styleCache.set(key, styleId)

    return styleId
  }

  private getStyleKey(style: CellStyle): string {
    return JSON.stringify(style)
  }

  private registerFont(font: CellStyle['font']): number {
    const existing = this.fonts.findIndex(
      f =>
        f?.bold === font?.bold &&
        f?.italic === font?.italic &&
        f?.color === font?.color &&
        f?.size === font?.size &&
        f?.name === font?.name
    )
    if (existing >= 0) return existing

    this.fonts.push(font)
    return this.fonts.length - 1
  }

  private registerFill(fill: CellStyle['fill']): number {
    const existing = this.fills.findIndex(
      f =>
        f?.fgColor === fill?.fgColor &&
        f?.bgColor === fill?.bgColor &&
        f?.patternType === fill?.patternType
    )
    if (existing >= 0) return existing

    this.fills.push(fill)
    return this.fills.length - 1
  }

  private registerBorder(border: CellStyle['border']): number {
    const existing = this.borders.findIndex(
      b =>
        JSON.stringify(b?.left) === JSON.stringify(border?.left) &&
        JSON.stringify(b?.right) === JSON.stringify(border?.right) &&
        JSON.stringify(b?.top) === JSON.stringify(border?.top) &&
        JSON.stringify(b?.bottom) === JSON.stringify(border?.bottom)
    )
    if (existing >= 0) return existing

    this.borders.push(border)
    return this.borders.length - 1
  }

  private getNumFmtId(numFmt?: string): number {
    if (!numFmt) return 0

    // 内置格式
    const builtInFormats: Record<string, number> = {
      '0': 1,
      '0.00': 2,
      '#,##0': 3,
      '#,##0.00': 4,
      '0%': 9,
      '0.00%': 10,
      '0.00E+00': 11,
      '# ?/?': 12,
      '# ??/??': 13,
      'm/d/yy': 14,
      'd-mmm-yy': 15,
      'd-mmm': 16,
      'mmm-yy': 17,
      'h:mm AM/PM': 18,
      'h:mm:ss AM/PM': 19,
      'h:mm': 20,
      'h:mm:ss': 21,
      'm/d/yy h:mm': 22,
      'yyyy-mm-dd': 14, // 映射到标准日期格式
      'yyyy-mm-dd hh:mm:ss': 22 // 映射到标准日期时间格式
    }

    // 检查是否为内置格式
    if (builtInFormats[numFmt]) {
      return builtInFormats[numFmt]
    }

    // 检查是否已经注册为自定义格式
    const existing = this.numFmts.find(f => f.code === numFmt)
    if (existing) {
      return existing.id
    }

    // 注册新的自定义格式
    const id = this.customNumFmtId++
    this.numFmts.push({ id, code: numFmt })
    return id
  }

  private getAlignmentXml(alignment?: CellStyle['alignment']): string {
    if (!alignment) return ''

    const parts: string[] = []
    if (alignment.horizontal) {
      parts.push(`horizontal="${alignment.horizontal}"`)
    }
    if (alignment.vertical) {
      parts.push(`vertical="${alignment.vertical}"`)
    }
    if (alignment.wrapText) {
      parts.push('wrapText="1"')
    }

    return parts.length > 0 ? `<alignment ${parts.join(' ')}/>` : ''
  }

  /**
   * 生成 styles.xml
   */
  generateXml(): string {
    // 生成自定义数字格式
    const numFmtsXml =
      this.numFmts.length > 0
        ? `<numFmts count="${this.numFmts.length}">
    ${this.numFmts
      .map(
        fmt =>
          `<numFmt numFmtId="${fmt.id}" formatCode="${escapeXML(fmt.code)}"/>`
      )
      .join('\n    ')}
  </numFmts>`
        : ''

    const fontsXml = this.fonts
      .map(font => {
        const parts: string[] = []
        if (font?.bold) parts.push('<b/>')
        if (font?.italic) parts.push('<i/>')
        parts.push(`<sz val="${font?.size || 11}"/>`)
        if (font?.color) {
          parts.push(`<color rgb="${this.normalizeColor(font.color)}"/>`)
        }
        parts.push(`<name val="${font?.name || 'Calibri'}"/>`)
        return `<font>${parts.join('')}</font>`
      })
      .join('\n    ')

    const fillsXml = this.fills
      .map(fill => {
        if (!fill || fill.patternType === 'none') {
          return '<fill><patternFill patternType="none"/></fill>'
        }
        if (fill.patternType === 'gray125') {
          return '<fill><patternFill patternType="gray125"/></fill>'
        }
        const fgColor = fill.fgColor
          ? `<fgColor rgb="${this.normalizeColor(fill.fgColor)}"/>`
          : ''
        const bgColor = fill.bgColor
          ? `<bgColor rgb="${this.normalizeColor(fill.bgColor)}"/>`
          : ''
        return `<fill><patternFill patternType="${
          fill.patternType || 'solid'
        }">${fgColor}${bgColor}</patternFill></fill>`
      })
      .join('\n    ')

    const bordersXml = this.borders
      .map(border => {
        if (!border || Object.keys(border).length === 0) {
          return '<border><left/><right/><top/><bottom/><diagonal/></border>'
        }
        const left = this.getBorderSideXml('left', border.left)
        const right = this.getBorderSideXml('right', border.right)
        const top = this.getBorderSideXml('top', border.top)
        const bottom = this.getBorderSideXml('bottom', border.bottom)
        return `<border>${left}${right}${top}${bottom}<diagonal/></border>`
      })
      .join('\n    ')

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${numFmtsXml ? numFmtsXml + '\n  ' : ''}<fonts count="${this.fonts.length}">
    ${fontsXml}
  </fonts>
  <fills count="${this.fills.length}">
    ${fillsXml}
  </fills>
  <borders count="${this.borders.length}">
    ${bordersXml}
  </borders>
  <cellXfs count="${this.cellXfs.length}">
    ${this.cellXfs.join('\n    ')}
  </cellXfs>
</styleSheet>`
  }

  private normalizeColor(color: string): string {
    // 移除 # 并确保是 8 位 ARGB（Excel 格式）
    let c = color.replace('#', '')
    if (c.length === 6) {
      c = 'FF' + c // 添加 alpha 通道
    }
    return c.toUpperCase()
  }

  private getBorderSideXml(
    side: string,
    borderSide?: { style?: string; color?: string }
  ): string {
    if (!borderSide) {
      return `<${side}/>`
    }
    const style = borderSide.style || 'thin'
    const color = borderSide.color
      ? `<color rgb="${this.normalizeColor(borderSide.color)}"/>`
      : ''
    return `<${side} style="${style}">${color}</${side}>`
  }
}

/**
 * 生成 xl/styles.xml (完整版)
 */
function generateStylesXML(workbook: Workbook): {
  xml: string
  styleManager: StyleManager
} {
  const styleManager = new StyleManager()

  // 预注册所有样式
  for (const sheet of workbook.sheets) {
    for (const row of sheet.rows) {
      for (const cell of row.cells) {
        if (cell.style) {
          styleManager.registerStyle(cell.style)
        }
      }
    }
  }

  return {
    xml: styleManager.generateXml(),
    styleManager
  }
}

/**
 * 生成 SharedStrings 并返回字符串映射
 */
function generateSharedStrings(workbook: Workbook): {
  xml: string
  stringMap: Map<string, number>
} {
  const stringMap = new Map<string, number>()
  const strings: string[] = []

  // 收集所有字符串
  for (const sheet of workbook.sheets) {
    for (const row of sheet.rows) {
      for (const cell of row.cells) {
        const value = cell.value
        if (typeof value === 'string' && value !== '') {
          if (!stringMap.has(value)) {
            stringMap.set(value, strings.length)
            strings.push(value)
          }
        }
      }
    }
  }

  const siElements = strings
    .map(str => `<si><t>${escapeXML(str)}</t></si>`)
    .join('\n    ')

  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">
  ${siElements}
</sst>`

  return { xml, stringMap }
}

/**
 * 生成 Worksheet XML
 */
function generateWorksheetXML(
  sheet: Worksheet,
  stringMap: Map<string, number>,
  styleManager: StyleManager
): string {
  // 生成列宽信息
  const colsXML = generateColsXML(sheet)

  // 生成行数据
  const rowsXML = sheet.rows
    .map((row, rowIndex) => {
      const cellsXML = row.cells
        .map((cell, colIndex) =>
          generateCellXML(cell, rowIndex, colIndex, stringMap, styleManager)
        )
        .filter(xml => xml !== '')
        .join('\n        ')

      if (cellsXML === '') return ''

      const rowNum = rowIndex + 1
      const rowHeight = row.height ? ` ht="${row.height}" customHeight="1"` : ''

      return `    <row r="${rowNum}"${rowHeight}>
        ${cellsXML}
    </row>`
    })
    .filter(xml => xml !== '')
    .join('\n    ')

  // 生成合并单元格
  const mergeCellsXML = generateMergeCellsXML(sheet)

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  ${colsXML}
  <sheetData>
    ${rowsXML}
  </sheetData>
  ${mergeCellsXML}
</worksheet>`
}

/**
 * 生成列宽 XML
 */
function generateColsXML(sheet: Worksheet): string {
  if (!sheet.columnWidths || Object.keys(sheet.columnWidths).length === 0) {
    return ''
  }

  const colElements = Object.entries(sheet.columnWidths)
    .map(([index, width]) => {
      const colNum = parseInt(index) + 1
      return `<col min="${colNum}" max="${colNum}" width="${width}" customWidth="1"/>`
    })
    .join('\n    ')

  return `<cols>
    ${colElements}
  </cols>`
}

/**
 * 生成单元格 XML
 */
function generateCellXML(
  cell: Cell<any>,
  rowIndex: number,
  colIndex: number,
  stringMap: Map<string, number>,
  styleManager: StyleManager
): string {
  const value = cell.value

  // 空单元格跳过（除非有样式）
  if (value === null || value === undefined) {
    if (!cell.style) return ''
    // 有样式但无值的单元格
    const cellRef = columnIndexToLetter(colIndex) + (rowIndex + 1)
    const styleId = styleManager.registerStyle(cell.style)
    return `<c r="${cellRef}" s="${styleId}"/>`
  }

  const cellRef = columnIndexToLetter(colIndex) + (rowIndex + 1)
  const styleId = cell.style ? styleManager.registerStyle(cell.style) : 0
  const styleAttr = styleId > 0 ? ` s="${styleId}"` : ''

  // 公式类型
  if (isCellFormula(value)) {
    const formulaXml = `<f>${escapeXML(value.formula)}</f>`
    const cachedValue = value.value
    let valueXml = ''
    if (cachedValue !== undefined && cachedValue !== null) {
      if (isString(cachedValue)) {
        valueXml = `<v>${escapeXML(cachedValue)}</v>`
      } else if (isNumber(cachedValue)) {
        valueXml = `<v>${cachedValue}</v>`
      } else if (typeof cachedValue === 'boolean') {
        valueXml = `<v>${cachedValue ? 1 : 0}</v>`
      } else if (isDate(cachedValue)) {
        valueXml = `<v>${dateToExcelNumber(cachedValue)}</v>`
      }
    }
    return `<c r="${cellRef}"${styleAttr}>${formulaXml}${valueXml}</c>`
  }

  // 错误值类型
  if (isCellError(value)) {
    return `<c r="${cellRef}" t="e"${styleAttr}><v>${escapeXML(
      value.error
    )}</v></c>`
  }

  // 字符串类型
  if (isString(value)) {
    const strIndex = stringMap.get(value)
    if (strIndex !== undefined) {
      return `<c r="${cellRef}" t="s"${styleAttr}><v>${strIndex}</v></c>`
    }
    return ''
  }

  // 数字类型
  if (isNumber(value)) {
    return `<c r="${cellRef}"${styleAttr}><v>${value}</v></c>`
  }

  // 布尔类型
  if (typeof value === 'boolean') {
    return `<c r="${cellRef}" t="b"${styleAttr}><v>${value ? 1 : 0}</v></c>`
  }

  // 日期类型
  if (isDate(value)) {
    const excelDate = dateToExcelNumber(value)
    return `<c r="${cellRef}"${styleAttr}><v>${excelDate}</v></c>`
  }

  return ''
}

/**
 * 生成合并单元格 XML
 */
function generateMergeCellsXML(sheet: Worksheet): string {
  if (!sheet.mergedCells || sheet.mergedCells.length === 0) {
    return ''
  }

  const mergeElements = sheet.mergedCells
    .map(merge => {
      const startCell =
        columnIndexToLetter(merge.start.column) + (merge.start.row + 1)
      const endCell =
        columnIndexToLetter(merge.end.column) + (merge.end.row + 1)
      return `<mergeCell ref="${startCell}:${endCell}"/>`
    })
    .join('\n    ')

  return `<mergeCells count="${sheet.mergedCells.length}">
    ${mergeElements}
  </mergeCells>`
}

/**
 * 生成 docProps/core.xml（核心属性）
 */
function generateCorePropsXML(metadata: WorkbookMetadata): string {
  const creator = escapeXML(metadata.creator || 'cat-kit/excel')
  const lastModifiedBy = escapeXML(
    metadata.lastModifiedBy || metadata.creator || 'cat-kit/excel'
  )
  const created = metadata.created
    ? metadata.created.toISOString()
    : new Date().toISOString()
  const modified = metadata.modified
    ? metadata.modified.toISOString()
    : new Date().toISOString()

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>${creator}</dc:creator>
  <cp:lastModifiedBy>${lastModifiedBy}</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${modified}</dcterms:modified>
</cp:coreProperties>`
}

/**
 * 生成 docProps/app.xml（应用程序属性）
 */
function generateAppPropsXML(workbook: Workbook): string {
  const sheetNames = workbook.sheets
    .map(sheet => `<vt:lpstr>${escapeXML(sheet.name)}</vt:lpstr>`)
    .join('\n        ')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>cat-kit/excel</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant>
        <vt:lpstr>工作表</vt:lpstr>
      </vt:variant>
      <vt:variant>
        <vt:i4>${workbook.sheets.length}</vt:i4>
      </vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="${workbook.sheets.length}" baseType="lpstr">
      ${sheetNames}
    </vt:vector>
  </TitlesOfParts>
  <Company></Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0300</AppVersion>
</Properties>`
}

/**
 * XML 转义
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
