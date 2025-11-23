/**
 * v2 XLSX 读取器 - 使用 fflate 和 fast-xml-parser
 *
 * 读取 XLSX 文件并转换为 v2 Workbook 格式
 */

import { unzipSync, strFromU8 } from 'fflate'
import { XMLParser } from 'fast-xml-parser'
import { Workbook } from '../core/workbook'
import { Worksheet } from '../core/worksheet'
import { Row } from '../core/row'
import { Cell } from '../core/cell'
import type {
  CellValue,
  CellStyle,
  CellFormula,
  CellError
} from '../core/types'
import { excelNumberToDate, isDateFormat } from '../helpers/date'
import { FileFormatError, ParseError } from '../errors'
import { isBlob, isArrayBuffer, isUint8Array } from '@cat-kit/core'

/**
 * 读取 Excel 工作簿
 *
 * 从 Blob、ArrayBuffer 或 Uint8Array 中解析 .xlsx 文件，
 * 返回完整的 Workbook 对象，包含所有工作表、样式和元数据。
 *
 * @param data - Excel 文件数据，支持 Blob、ArrayBuffer 或 Uint8Array
 * @returns Promise<Workbook> - 解析后的工作簿对象
 * @throws {FileFormatError} 如果文件格式无效或无法解压
 * @throws {ParseError} 如果解析过程中出错
 *
 * @example
 * ```typescript
 * // 从文件输入读取
 * const file = event.target.files[0]
 * const workbook = await readWorkbook(file)
 *
 * // 从 fetch 读取
 * const response = await fetch('data.xlsx')
 * const blob = await response.blob()
 * const workbook = await readWorkbook(blob)
 *
 * // 访问工作表
 * const sheet = workbook.getSheet(0)
 * console.log(sheet.name)
 *
 * // 遍历所有工作表
 * for (const sheet of workbook) {
 *   console.log(`Sheet: ${sheet.name}, Rows: ${sheet.rowCount}`)
 * }
 * ```
 */
export async function readWorkbook(
  data: Blob | ArrayBuffer | Uint8Array
): Promise<Workbook> {
  // 转换为 Uint8Array
  let bytes: Uint8Array
  if (isBlob(data)) {
    const buffer = await data.arrayBuffer()
    bytes = new Uint8Array(buffer)
  } else if (isArrayBuffer(data)) {
    bytes = new Uint8Array(data)
  } else if (isUint8Array(data)) {
    bytes = data
  } else {
    throw new FileFormatError('不支持的数据类型')
  }

  // 解压 ZIP
  let files: Record<string, Uint8Array>
  try {
    files = unzipSync(bytes)
  } catch (error) {
    throw new FileFormatError('无法解压 XLSX 文件', { error })
  }

  // 解析 XLSX 结构
  const reader = new XLSXReader(files)
  return reader.parse()
}

/**
 * XLSX 读取器类
 */
class XLSXReader {
  private files: Record<string, Uint8Array>
  private parser: XMLParser
  private sharedStrings: string[] = []
  private styles: CellStyle[] = []
  private numFmts: Map<number, string> = new Map()

  constructor(files: Record<string, Uint8Array>) {
    this.files = files
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: false
    })
  }

  static readonly ADDRESS_REGEX = /^([A-Z]+)(\d+)$/

  /**
   * 解析整个工作簿
   */
  parse(): Workbook {
    // 1. 读取 SharedStrings
    this.parseSharedStrings()

    // 2. 读取样式
    this.parseStyles()

    // 3. 读取工作簿结构
    const workbookData = this.parseWorkbookStructure()

    // 4. 读取元数据
    const metadata = this.parseMetadata()

    // 5. 读取所有工作表
    const sheets = workbookData.sheets.map(sheetInfo =>
      this.parseWorksheet(sheetInfo.name, sheetInfo.id)
    )

    return new Workbook(workbookData.name || '工作簿', { sheets, metadata })
  }

  /**
   * 解析 SharedStrings
   */
  private parseSharedStrings(): void {
    const sst = this.getFile('xl/sharedStrings.xml')
    if (!sst) {
      this.sharedStrings = []
      return
    }

    try {
      const xml = strFromU8(sst)
      const data = this.parser.parse(xml)

      if (!data.sst) {
        this.sharedStrings = []
        return
      }

      const si = data.sst.si
      if (!si) {
        this.sharedStrings = []
        return
      }

      // si 可能是单个对象或数组
      const items = Array.isArray(si) ? si : [si]
      this.sharedStrings = items.map(item => {
        // 处理不同的文本格式
        if (typeof item === 'string') return item
        if (item.t) {
          if (typeof item.t === 'string') return item.t
          if (item.t['#text']) return item.t['#text']
        }
        if (item['#text']) return item['#text']
        return ''
      })
    } catch (error) {
      throw new ParseError('解析 SharedStrings 失败', { error })
    }
  }

  /**
   * 解析样式（完整版）
   */
  private parseStyles(): void {
    const stylesFile = this.getFile('xl/styles.xml')
    if (!stylesFile) {
      this.styles = []
      return
    }

    try {
      const xml = strFromU8(stylesFile)
      const data = this.parser.parse(xml)
      const styleSheet = data.styleSheet

      if (!styleSheet) {
        this.styles = []
        return
      }

      // 解析自定义数字格式
      if (styleSheet.numFmts?.numFmt) {
        const numFmts = Array.isArray(styleSheet.numFmts.numFmt)
          ? styleSheet.numFmts.numFmt
          : [styleSheet.numFmts.numFmt]

        for (const fmt of numFmts) {
          const id = parseInt(fmt['@_numFmtId'])
          const code = fmt['@_formatCode']
          if (!isNaN(id) && code) {
            this.numFmts.set(id, code)
          }
        }
      }

      // 解析字体
      const fonts = this.parseFonts(styleSheet.fonts)

      // 解析填充
      const fills = this.parseFills(styleSheet.fills)

      // 解析边框
      const borders = this.parseBorders(styleSheet.borders)

      // 解析单元格格式（cellXfs）
      this.styles = []
      if (styleSheet.cellXfs?.xf) {
        const xfs = Array.isArray(styleSheet.cellXfs.xf)
          ? styleSheet.cellXfs.xf
          : [styleSheet.cellXfs.xf]

        for (const xf of xfs) {
          const style: CellStyle = {}

          // 字体
          const fontId = parseInt(xf['@_fontId'] || '0')
          if (fontId > 0 && fontId < fonts.length) {
            style.font = fonts[fontId]
          }

          // 填充
          const fillId = parseInt(xf['@_fillId'] || '0')
          if (fillId > 0 && fillId < fills.length) {
            style.fill = fills[fillId]
          }

          // 边框
          const borderId = parseInt(xf['@_borderId'] || '0')
          if (borderId > 0 && borderId < borders.length) {
            style.border = borders[borderId]
          }

          // 数字格式
          const numFmtId = parseInt(xf['@_numFmtId'] || '0')
          if (numFmtId > 0) {
            style.numberFormat = this.numFmts.get(numFmtId) || String(numFmtId)
          }

          // 对齐
          if (xf.alignment) {
            style.alignment = {
              horizontal: xf.alignment['@_horizontal'] as any,
              vertical: xf.alignment['@_vertical'] as any,
              wrapText: xf.alignment['@_wrapText'] === '1',
              indent: parseInt(xf.alignment['@_indent'] || '0')
            }
          }

          this.styles.push(style)
        }
      }
    } catch (error) {
      // 样式解析失败不影响数据读取
      console.warn('解析样式失败:', error)
      this.styles = []
    }
  }

  /**
   * 解析字体
   */
  private parseFonts(fontsData: any): Array<CellStyle['font']> {
    if (!fontsData?.font) return [{}]

    const fonts = Array.isArray(fontsData.font)
      ? fontsData.font
      : [fontsData.font]

    return fonts.map(font => {
      const result: CellStyle['font'] = {}

      if (font.name?.['@_val']) {
        result.name = font.name['@_val']
      }
      if (font.sz?.['@_val']) {
        result.size = parseFloat(font.sz['@_val'])
      }
      if (font.b !== undefined) {
        result.bold = true
      }
      if (font.i !== undefined) {
        result.italic = true
      }
      if (font.u !== undefined) {
        result.underline = true
      }
      if (font.color?.['@_rgb']) {
        result.color = '#' + font.color['@_rgb'].substring(2) // 移除 alpha 通道
      }

      return result
    })
  }

  /**
   * 解析填充
   */
  private parseFills(fillsData: any): Array<CellStyle['fill']> {
    if (!fillsData?.fill) return [{}, {}] // Excel 需要至少两个默认填充

    const fills = Array.isArray(fillsData.fill)
      ? fillsData.fill
      : [fillsData.fill]

    return fills.map(fill => {
      const result: CellStyle['fill'] = {}
      const patternFill = fill.patternFill

      if (patternFill) {
        result.patternType = patternFill['@_patternType'] as any

        if (patternFill.fgColor?.['@_rgb']) {
          result.fgColor = '#' + patternFill.fgColor['@_rgb'].substring(2)
        }
        if (patternFill.bgColor?.['@_rgb']) {
          result.bgColor = '#' + patternFill.bgColor['@_rgb'].substring(2)
        }
      }

      return result
    })
  }

  /**
   * 解析边框
   */
  private parseBorders(bordersData: any): Array<CellStyle['border']> {
    if (!bordersData?.border) return [{}]

    const borders = Array.isArray(bordersData.border)
      ? bordersData.border
      : [bordersData.border]

    return borders.map(border => {
      const result: CellStyle['border'] = {}

      const parseSide = (side: any) => {
        if (!side) return undefined
        return {
          style: side['@_style'] as any,
          color: side.color?.['@_rgb']
            ? '#' + side.color['@_rgb'].substring(2)
            : undefined
        }
      }

      result.left = parseSide(border.left)
      result.right = parseSide(border.right)
      result.top = parseSide(border.top)
      result.bottom = parseSide(border.bottom)

      return result
    })
  }

  /**
   * 解析工作簿结构
   */
  private parseWorkbookStructure(): {
    name: string
    sheets: Array<{ name: string; id: number }>
  } {
    const workbookFile = this.getFile('xl/workbook.xml')
    if (!workbookFile) {
      throw new FileFormatError('未找到 workbook.xml')
    }

    try {
      const xml = strFromU8(workbookFile)
      const data = this.parser.parse(xml)

      const workbook = data.workbook
      if (!workbook?.sheets?.sheet) {
        throw new ParseError('工作簿结构无效')
      }

      const sheetElements = Array.isArray(workbook.sheets.sheet)
        ? workbook.sheets.sheet
        : [workbook.sheets.sheet]

      const sheets = sheetElements.map((sheet, index) => ({
        name: sheet['@_name'] || `Sheet${index + 1}`,
        id: index + 1
      }))

      return {
        name: '工作簿',
        sheets
      }
    } catch (error) {
      throw new ParseError('解析工作簿结构失败', { error })
    }
  }

  /**
   * 解析单个工作表
   */
  private parseWorksheet(name: string, sheetId: number): Worksheet {
    const sheetFile = this.getFile(`xl/worksheets/sheet${sheetId}.xml`)
    if (!sheetFile) {
      throw new FileFormatError(`未找到 sheet${sheetId}.xml`)
    }

    try {
      const xml = strFromU8(sheetFile)
      const data = this.parser.parse(xml)

      const worksheet = data.worksheet
      if (!worksheet) {
        throw new ParseError(`工作表 ${name} 结构无效`)
      }

      // 解析行数据
      const rows: Row[] = []
      if (worksheet.sheetData?.row) {
        const rowElements = Array.isArray(worksheet.sheetData.row)
          ? worksheet.sheetData.row
          : [worksheet.sheetData.row]

        // 获取最大行号
        const maxRow = Math.max(
          ...rowElements.map(r => parseInt(r['@_r'] || '0'))
        )

        // 创建空行数组
        for (let i = 0; i < maxRow; i++) {
          rows.push(new Row([]))
        }

        // 填充数据
        for (const rowElement of rowElements) {
          const rowIndex = parseInt(rowElement['@_r'] || '1') - 1
          const cells = this.parseRowCells(rowElement)
          if (rowIndex >= 0 && rowIndex < maxRow) {
            rows[rowIndex] = new Row(cells)
          }
        }
      }

      // 解析合并单元格（暂未使用，将来可以添加到 Worksheet 选项中）
      // const mergedCells = this.parseMergedCells(worksheet)

      return new Worksheet(name, {
        rows: rows.map(row => row.cells.map(cell => cell.value))
      })
    } catch (error) {
      throw new ParseError(`解析工作表 ${name} 失败`, { error })
    }
  }

  /**
   * 解析行中的单元格
   */
  private parseRowCells(rowElement: any): Cell[] {
    if (!rowElement.c) return []

    const cellElements = Array.isArray(rowElement.c)
      ? rowElement.c
      : [rowElement.c]

    // 找出最大列号
    const maxCol = Math.max(
      ...cellElements.map(c => {
        const ref = c['@_r'] || 'A1'
        return this.columnLetterToIndex(ref.replace(/\d+$/, ''))
      })
    )

    // 创建空单元格数组
    const cells: Cell[] = []
    for (let i = 0; i <= maxCol; i++) {
      cells.push(new Cell(null))
    }

    // 填充数据
    for (const cellElement of cellElements) {
      const ref = cellElement['@_r'] || 'A1'
      const colIndex = this.columnLetterToIndex(ref.replace(/\d+$/, ''))

      const styleIndex = cellElement['@_s']
        ? parseInt(cellElement['@_s'])
        : undefined
      const value = this.parseCellValue(cellElement, styleIndex)
      const style = this.parseCellStyle(cellElement)

      cells[colIndex] = new Cell(value, style)
    }

    return cells
  }

  /**
   * 解析单元格值
   */
  private parseCellValue(cellElement: any, styleIndex?: number): CellValue {
    const type = cellElement['@_t']

    // 处理公式
    if (cellElement.f) {
      const formula =
        typeof cellElement.f === 'object'
          ? cellElement.f['#text']
          : cellElement.f

      const formulaCell: CellFormula = {
        type: 'formula',
        formula: formula || ''
      }

      // 读取缓存值
      if (cellElement.v) {
        const cachedValue =
          typeof cellElement.v === 'object'
            ? cellElement.v['#text']
            : cellElement.v

        if (type === 's') {
          const index = parseInt(cachedValue)
          formulaCell.value = this.sharedStrings[index] || ''
        } else if (type === 'b') {
          formulaCell.value = cachedValue === '1' || cachedValue === 'true'
        } else if (!type || type === 'n') {
          formulaCell.value = parseFloat(cachedValue)
        } else {
          formulaCell.value = String(cachedValue)
        }
      }

      return formulaCell
    }

    // 处理错误值
    if (type === 'e') {
      const errorValue = cellElement.v
      const errorText =
        typeof errorValue === 'object' ? errorValue['#text'] : errorValue

      const errorCell: CellError = {
        type: 'error',
        error: errorText || '#N/A'
      }
      return errorCell
    }

    const value = cellElement.v
    if (!value && value !== 0) return null

    const valueText = typeof value === 'object' ? value['#text'] : value

    // 字符串类型（SharedStrings）
    if (type === 's') {
      const index = parseInt(valueText)
      return this.sharedStrings[index] || ''
    }

    // 布尔类型
    if (type === 'b') {
      return valueText === '1' || valueText === 'true'
    }

    // 数字类型（可能是日期）
    if (!type || type === 'n') {
      const numValue = parseFloat(valueText)

      // 检查是否是日期
      if (styleIndex !== undefined) {
        const style = this.styles[styleIndex]
        const numFmtId = style?.numberFormat
          ? parseInt(style.numberFormat)
          : undefined

        if (isDateFormat(numFmtId, style?.numberFormat)) {
          // 转换为日期
          return excelNumberToDate(numValue)
        }
      }

      return numValue
    }

    // 其他类型，返回字符串
    return String(valueText)
  }

  /**
   * 解析单元格样式
   */
  private parseCellStyle(cellElement: any): CellStyle | undefined {
    const styleIndex = cellElement['@_s']
    if (!styleIndex) return undefined

    const index = parseInt(styleIndex)
    return this.styles[index]
  }

  /**
   * 解析合并单元格
   */
  private parseMergedCells(worksheet: any): Array<{
    start: { row: number; column: number }
    end: { row: number; column: number }
  }> {
    if (!worksheet.mergeCells?.mergeCell) return []

    const mergeCellElements = Array.isArray(worksheet.mergeCells.mergeCell)
      ? worksheet.mergeCells.mergeCell
      : [worksheet.mergeCells.mergeCell]

    return mergeCellElements.map(merge => {
      const ref = merge['@_ref']
      const [start, end] = ref.split(':')

      return {
        start: this.parseAddress(start),
        end: this.parseAddress(end || start)
      }
    })
  }

  /**
   * 解析单元格地址（如 "A1"）
   */
  private parseAddress(address: string): { row: number; column: number } {
    const match = address.match(XLSXReader.ADDRESS_REGEX)
    if (!match) {
      throw new ParseError(`无效的单元格地址: ${address}`)
    }

    return {
      column: this.columnLetterToIndex(match[1]!),
      row: parseInt(match[2]!) - 1
    }
  }

  /**
   * 列字母转索引（A -> 0, Z -> 25, AA -> 26）
   */
  private columnLetterToIndex(letters: string): number {
    let index = 0
    for (let i = 0; i < letters.length; i++) {
      index = index * 26 + (letters.charCodeAt(i) - 64)
    }
    return index - 1
  }

  /**
   * 解析元数据
   */
  private parseMetadata(): any {
    const metadata: any = {}

    // 解析核心属性（docProps/core.xml）
    const coreFile = this.getFile('docProps/core.xml')
    if (coreFile) {
      try {
        const xml = strFromU8(coreFile)
        const data = this.parser.parse(xml)
        const coreProps = data['cp:coreProperties'] || data.coreProperties

        if (coreProps) {
          // 创建者
          if (coreProps['dc:creator']) {
            metadata.creator =
              typeof coreProps['dc:creator'] === 'object'
                ? coreProps['dc:creator']['#text']
                : coreProps['dc:creator']
          }

          // 最后修改者
          if (coreProps['cp:lastModifiedBy']) {
            metadata.lastModifiedBy =
              typeof coreProps['cp:lastModifiedBy'] === 'object'
                ? coreProps['cp:lastModifiedBy']['#text']
                : coreProps['cp:lastModifiedBy']
          }

          // 创建时间
          if (coreProps['dcterms:created']) {
            const created =
              typeof coreProps['dcterms:created'] === 'object'
                ? coreProps['dcterms:created']['#text']
                : coreProps['dcterms:created']
            metadata.created = new Date(created)
          }

          // 修改时间
          if (coreProps['dcterms:modified']) {
            const modified =
              typeof coreProps['dcterms:modified'] === 'object'
                ? coreProps['dcterms:modified']['#text']
                : coreProps['dcterms:modified']
            metadata.modified = new Date(modified)
          }
        }
      } catch (error) {
        console.warn('解析核心属性失败:', error)
      }
    }

    // 解析应用程序属性（docProps/app.xml）
    const appFile = this.getFile('docProps/app.xml')
    if (appFile) {
      try {
        const xml = strFromU8(appFile)
        const data = this.parser.parse(xml)
        const appProps = data.Properties

        if (appProps) {
          // 可以在这里解析应用程序特定的属性
          // 如 Application, DocSecurity, ScaleCrop 等
        }
      } catch (error) {
        console.warn('解析应用程序属性失败:', error)
      }
    }

    // 解析自定义属性（docProps/custom.xml）
    const customFile = this.getFile('docProps/custom.xml')
    if (customFile) {
      try {
        const xml = strFromU8(customFile)
        const data = this.parser.parse(xml)
        const customProps = data.Properties

        if (customProps?.property) {
          metadata.customProperties = {}
          const properties = Array.isArray(customProps.property)
            ? customProps.property
            : [customProps.property]

          for (const prop of properties) {
            const name = prop['@_name']
            const value = prop['vt:lpwstr'] || prop['vt:i4'] || prop['vt:bool']
            if (name && value !== undefined) {
              const val = typeof value === 'object' ? value['#text'] : value
              metadata.customProperties[name] = val
            }
          }
        }
      } catch (error) {
        console.warn('解析自定义属性失败:', error)
      }
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined
  }

  /**
   * 获取文件
   */
  private getFile(path: string): Uint8Array | undefined {
    return this.files[path]
  }
}
