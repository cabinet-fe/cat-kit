/**
 * 流式读取 API
 *
 * 使用 Web Streams API 实现大文件的流式处理，避免一次性加载整个文件到内存
 */

import { unzipSync, strFromU8 } from 'fflate'
import { XMLParser } from 'fast-xml-parser'
import { Row } from '../core/row'
import { Cell } from '../core/cell'
import type { CellValue, CellStyle } from '../core/types'
import { excelNumberToDate, isDateFormat } from '../helpers/date'
import { FileFormatError, ParseError } from '../errors'
import { isBlob, isArrayBuffer, isUint8Array } from '@cat-kit/core'

/**
 * 工作表行数据
 */
export interface SheetRowData {
  /** 工作表名称 */
  sheetName: string
  /** 工作表索引 */
  sheetIndex: number
  /** 行索引（0-based） */
  rowIndex: number
  /** 行数据 */
  row: Row
}

/**
 * 流式读取选项
 */
export interface StreamReadOptions {
  /** 要读取的工作表索引列表，未指定则读取所有工作表 */
  sheetIndices?: number[]
  /** 要读取的工作表名称列表，未指定则读取所有工作表 */
  sheetNames?: string[]
  /** 批次大小（一次处理多少行） */
  batchSize?: number
}

/**
 * 流式读取工作簿
 *
 * 返回一个 ReadableStream，逐行读取工作表数据，适合处理大文件
 *
 * @param data - Excel 文件数据
 * @param options - 读取选项
 * @returns ReadableStream，输出 SheetRowData
 *
 * @example
 * ```typescript
 * const stream = readWorkbookStream(fileData)
 * const reader = stream.getReader()
 *
 * while (true) {
 *   const { done, value } = await reader.read()
 *   if (done) break
 *   console.log(`Sheet: ${value.sheetName}, Row: ${value.rowIndex}`)
 * }
 * ```
 */
export function readWorkbookStream(
  data: Blob | ArrayBuffer | Uint8Array,
  options: StreamReadOptions = {}
): ReadableStream<SheetRowData> {
  return new ReadableStream({
    async start(controller) {
      try {
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

        // 解压 ZIP（目前仍需要完整解压，因为 fflate 不支持流式解压）
        let files: Record<string, Uint8Array>
        try {
          files = unzipSync(bytes)
        } catch (error) {
          throw new FileFormatError('无法解压 XLSX 文件', { error })
        }

        // 创建流式读取器
        const reader = new StreamXLSXReader(files, options)

        // 逐行读取并推送到流中
        for await (const rowData of reader.readRows()) {
          controller.enqueue(rowData)
        }

        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}

/**
 * 流式 XLSX 读取器
 */
class StreamXLSXReader {
  private files: Record<string, Uint8Array>
  private parser: XMLParser
  private sharedStrings: string[] = []
  private styles: CellStyle[] = []
  private numFmts: Map<number, string> = new Map()
  private options: StreamReadOptions

  constructor(
    files: Record<string, Uint8Array>,
    options: StreamReadOptions = {}
  ) {
    this.files = files
    this.options = options
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: false
    })
  }

  /**
   * 异步迭代器：逐行读取所有工作表
   */
  async *readRows(): AsyncGenerator<SheetRowData> {
    // 1. 读取 SharedStrings
    this.parseSharedStrings()

    // 2. 读取样式（简化版，用于日期识别）
    this.parseStylesForStreaming()

    // 3. 读取工作簿结构
    const sheets = this.parseWorkbookStructure()

    // 4. 过滤要读取的工作表
    const sheetsToRead = this.filterSheets(sheets)

    // 5. 逐个处理工作表
    for (const sheetInfo of sheetsToRead) {
      yield* this.readSheetRows(sheetInfo.name, sheetInfo.id, sheetInfo.index)
    }
  }

  /**
   * 读取单个工作表的所有行
   */
  private async *readSheetRows(
    sheetName: string,
    sheetId: number,
    sheetIndex: number
  ): AsyncGenerator<SheetRowData> {
    const sheetFile = this.getFile(`xl/worksheets/sheet${sheetId}.xml`)
    if (!sheetFile) {
      throw new FileFormatError(`未找到 sheet${sheetId}.xml`)
    }

    try {
      const xml = strFromU8(sheetFile)
      const data = this.parser.parse(xml)
      const worksheet = data.worksheet

      if (!worksheet?.sheetData?.row) {
        return // 空工作表
      }

      const rowElements = Array.isArray(worksheet.sheetData.row)
        ? worksheet.sheetData.row
        : [worksheet.sheetData.row]

      // 逐行处理
      for (let i = 0; i < rowElements.length; i++) {
        const rowElement = rowElements[i]
        const rowIndex = parseInt(rowElement['@_r'] || String(i + 1)) - 1
        const cells = this.parseRowCells(rowElement)
        const row = new Row(cells)

        yield {
          sheetName,
          sheetIndex,
          rowIndex,
          row
        }
      }
    } catch (error) {
      throw new ParseError(`解析工作表 ${sheetName} 失败`, { error })
    }
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

      if (!data.sst?.si) {
        this.sharedStrings = []
        return
      }

      const items = Array.isArray(data.sst.si) ? data.sst.si : [data.sst.si]
      this.sharedStrings = items.map(item => {
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
   * 解析样式（简化版，仅用于日期识别）
   */
  private parseStylesForStreaming(): void {
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

      // 解析 cellXfs（仅保存数字格式信息）
      this.styles = []
      if (styleSheet.cellXfs?.xf) {
        const xfs = Array.isArray(styleSheet.cellXfs.xf)
          ? styleSheet.cellXfs.xf
          : [styleSheet.cellXfs.xf]

        for (const xf of xfs) {
          const style: CellStyle = {}
          const numFmtId = parseInt(xf['@_numFmtId'] || '0')
          if (numFmtId > 0) {
            style.numberFormat = this.numFmts.get(numFmtId) || String(numFmtId)
          }
          this.styles.push(style)
        }
      }
    } catch (error) {
      console.warn('解析样式失败:', error)
      this.styles = []
    }
  }

  /**
   * 解析工作簿结构
   */
  private parseWorkbookStructure(): Array<{
    name: string
    id: number
    index: number
  }> {
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

      return sheetElements.map((sheet, index) => ({
        name: sheet['@_name'] || `Sheet${index + 1}`,
        id: index + 1,
        index
      }))
    } catch (error) {
      throw new ParseError('解析工作簿结构失败', { error })
    }
  }

  /**
   * 过滤要读取的工作表
   */
  private filterSheets(
    sheets: Array<{ name: string; id: number; index: number }>
  ): Array<{ name: string; id: number; index: number }> {
    const { sheetIndices, sheetNames } = this.options

    if (!sheetIndices && !sheetNames) {
      return sheets
    }

    return sheets.filter(sheet => {
      if (sheetIndices && sheetIndices.includes(sheet.index)) {
        return true
      }
      if (sheetNames && sheetNames.includes(sheet.name)) {
        return true
      }
      return false
    })
  }

  /**
   * 解析行中的单元格
   */
  private parseRowCells(rowElement: any): Cell[] {
    if (!rowElement.c) return []

    const cellElements = Array.isArray(rowElement.c)
      ? rowElement.c
      : [rowElement.c]

    const maxCol = Math.max(
      ...cellElements.map(c => {
        const ref = c['@_r'] || 'A1'
        return this.columnLetterToIndex(ref.replace(/\d+$/, ''))
      })
    )

    const cells: Cell[] = []
    for (let i = 0; i <= maxCol; i++) {
      cells.push(new Cell(null))
    }

    for (const cellElement of cellElements) {
      const ref = cellElement['@_r'] || 'A1'
      const colIndex = this.columnLetterToIndex(ref.replace(/\d+$/, ''))
      const styleIndex = cellElement['@_s']
        ? parseInt(cellElement['@_s'])
        : undefined
      const value = this.parseCellValue(cellElement, styleIndex)
      cells[colIndex] = new Cell(value)
    }

    return cells
  }

  /**
   * 解析单元格值（简化版）
   */
  private parseCellValue(cellElement: any, styleIndex?: number): CellValue {
    const type = cellElement['@_t']
    const value = cellElement.v

    if (!value && value !== 0) return null

    const valueText = typeof value === 'object' ? value['#text'] : value

    // 字符串类型
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
          return excelNumberToDate(numValue)
        }
      }

      return numValue
    }

    return String(valueText)
  }

  /**
   * 列字母转索引
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
