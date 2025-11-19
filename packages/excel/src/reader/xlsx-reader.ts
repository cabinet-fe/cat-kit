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
import type { CellValue, CellStyle } from '../core/types'
import { FileFormatError, ParseError } from '../errors'
import { isBlob, isArrayBuffer, isUint8Array } from '@cat-kit/core'

/**
 * 读取 Workbook
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

    // 4. 读取所有工作表
    const sheets = workbookData.sheets.map(sheetInfo =>
      this.parseWorksheet(sheetInfo.name, sheetInfo.id)
    )

    return new Workbook(workbookData.name || '工作簿', { sheets })
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
   * 解析样式（简化版 - 仅读取基础样式）
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

      // 简化实现：目前只读取基础样式信息
      // 完整实现需要解析 fonts, fills, borders, cellXfs 等
      this.styles = []

      // TODO: 完整实现样式解析
      // const styleSheet = data.styleSheet
      // if (styleSheet?.cellXfs?.xf) {
      //   const xfs = Array.isArray(styleSheet.cellXfs.xf)
      //     ? styleSheet.cellXfs.xf
      //     : [styleSheet.cellXfs.xf]
      //   ...
      // }
    } catch (error) {
      // 样式解析失败不影响数据读取
      console.warn('解析样式失败:', error)
      this.styles = []
    }
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

      // 解析合并单元格
      const mergedCells = this.parseMergedCells(worksheet)

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

      const value = this.parseCellValue(cellElement)
      const style = this.parseCellStyle(cellElement)

      cells[colIndex] = new Cell(value, style)
    }

    return cells
  }

  /**
   * 解析单元格值
   */
  private parseCellValue(cellElement: any): CellValue {
    const type = cellElement['@_t']
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

      // 检查是否是日期（简化判断）
      // Excel 日期是从 1900-01-01 开始的天数
      // 如果数字在合理范围内且有日期样式，则转换为日期
      // 这里简化处理，直接返回数字
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
   * 获取文件
   */
  private getFile(path: string): Uint8Array | undefined {
    return this.files[path]
  }
}
