/**
 * 流式读取 API
 *
 * 使用 Web Streams API 实现大文件的流式处理，避免一次性加载整个文件到内存
 */

import { strFromU8, Unzip, AsyncUnzipInflate } from 'fflate'
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

        // 创建流式读取器
        const reader = new StreamXLSXReader(bytes, options)

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
  private zipBytes: Uint8Array
  private parser: XMLParser
  private sharedStrings: string[] = []
  private styles: CellStyle[] = []
  private numFmts: Map<number, string> = new Map()
  private options: StreamReadOptions
  private workbookSheets: Array<{
    name: string
    path: string
    index: number
  }> | null = null

  constructor(zipBytes: Uint8Array, options: StreamReadOptions = {}) {
    this.zipBytes = zipBytes
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
    await this.parseSharedStrings()

    // 2. 读取样式（简化版，用于日期识别）
    await this.parseStylesForStreaming()

    // 3. 读取工作簿结构
    const sheets = await this.parseWorkbookStructure()

    // 4. 过滤要读取的工作表
    const sheetsToRead = this.filterSheets(sheets)

    // 5. 逐个处理工作表
    for (const sheetInfo of sheetsToRead) {
      yield* this.readSheetRows(sheetInfo.name, sheetInfo.path, sheetInfo.index)
    }
  }

  /**
   * 读取单个工作表的所有行
   */
  private async *readSheetRows(
    sheetName: string,
    sheetPath: string,
    sheetIndex: number
  ): AsyncGenerator<SheetRowData> {
    let counter = 0

    try {
      for await (const rowXml of this.streamSheetRowXml(sheetPath)) {
        const parsed = this.parser.parse(rowXml)
        const rowElement = parsed.row
        if (!rowElement) {
          continue
        }
        const rowIndex =
          parseInt(rowElement?.['@_r'] || String(counter + 1)) - 1
        const cells = this.parseRowCells(rowElement)
        const row = new Row(cells)

        counter++

        yield {
          sheetName,
          sheetIndex,
          rowIndex,
          row
        }

        if (this.options.batchSize && counter % this.options.batchSize === 0) {
          await Promise.resolve()
        }
      }
    } catch (error) {
      throw new ParseError(`解析工作表 ${sheetName} 失败`, { error })
    }
  }

  /**
   * 解析 SharedStrings
   */
  private async parseSharedStrings(): Promise<void> {
    const sst = await this.readZipEntry('xl/sharedStrings.xml')
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
  private async parseStylesForStreaming(): Promise<void> {
    const stylesFile = await this.readZipEntry('xl/styles.xml')
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
  private async parseWorkbookStructure(): Promise<
    Array<{
      name: string
      path: string
      index: number
    }>
  > {
    if (this.workbookSheets) return this.workbookSheets

    const workbookFile = await this.readZipEntry('xl/workbook.xml')
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

      const rels = await this.parseWorkbookRels()

      const result = sheetElements.map((sheet, index) => {
        const sheetId = parseInt(sheet['@_sheetId'] || String(index + 1))
        const relId = sheet['@_r:id'] as string | undefined
        const path = this.resolveSheetPath(relId, sheetId, rels)

        return {
          name: sheet['@_name'] || `Sheet${index + 1}`,
          path,
          index
        }
      })

      this.workbookSheets = result
      return result
    } catch (error) {
      throw new ParseError('解析工作簿结构失败', { error })
    }
  }

  /**
   * 过滤要读取的工作表
   */
  private filterSheets(
    sheets: Array<{ name: string; path: string; index: number }>
  ): Array<{ name: string; path: string; index: number }> {
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
   * 解析 workbook 关系，获取 r:id -> 路径映射
   */
  private async parseWorkbookRels(): Promise<Map<string, string>> {
    const relsFile = await this.readZipEntry('xl/_rels/workbook.xml.rels')
    const rels = new Map<string, string>()

    if (!relsFile) return rels

    try {
      const xml = strFromU8(relsFile)
      const data = this.parser.parse(xml)
      const relationships = data.Relationships?.Relationship
      if (!relationships) return rels

      const relArray = Array.isArray(relationships)
        ? relationships
        : [relationships]

      for (const rel of relArray) {
        const id = rel['@_Id']
        const target = rel['@_Target']
        if (id && target) {
          rels.set(id, target)
        }
      }
    } catch (error) {
      console.warn('解析 workbook 关系失败:', error)
    }

    return rels
  }

  /**
   * 根据关系或 sheetId 计算工作表路径
   */
  private resolveSheetPath(
    relId: string | undefined,
    sheetId: number,
    rels: Map<string, string>
  ): string {
    const target =
      (relId ? rels.get(relId) : undefined) || `worksheets/sheet${sheetId}.xml`

    const cleaned = target.startsWith('/') ? target.slice(1) : target
    return cleaned.startsWith('xl/') ? cleaned : `xl/${cleaned}`
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
   * 在 ZIP 中读取指定条目（完整解压）
   */
  private async readZipEntry(path: string): Promise<Uint8Array | undefined> {
    const normalized = this.normalizePath(path)

    return await new Promise<Uint8Array | undefined>((resolve, reject) => {
      let found = false

      const unzipper = new Unzip(stream => {
        const name = this.normalizePath(stream.name)
        if (name === normalized) {
          found = true
          const chunks: Uint8Array[] = []
          stream.ondata = (err, chunk, final) => {
            if (err) {
              reject(err)
              return
            }
            chunks.push(chunk)
            if (final) {
              resolve(this.concatChunks(chunks))
            }
          }
          stream.start()
        } else {
          stream.terminate()
        }
      })

      unzipper.register(AsyncUnzipInflate)
      unzipper.push(this.zipBytes, true)

      if (!found) {
        resolve(undefined)
      }
    })
  }

  /**
   * 流式读取工作表的 row XML 片段
   */
  private async *streamSheetRowXml(sheetPath: string): AsyncGenerator<string> {
    const normalized = this.normalizePath(sheetPath)
    const decoder = new TextDecoder()
    let buffer = ''
    let done = false

    const queue: Array<string | null> = []
    let resolver: ((value: IteratorResult<string>) => void) | null = null

    const enqueue = (value: string | null) => {
      if (resolver) {
        resolver({ value: value as string, done: value === null })
        resolver = null
      } else {
        queue.push(value)
      }
    }

    const next = async (): Promise<IteratorResult<string>> => {
      if (queue.length > 0) {
        const value = queue.shift()
        return { value: value as string, done: value === null }
      }
      if (done) return { value: undefined as any, done: true }
      return await new Promise(resolve => {
        resolver = resolve
      })
    }

    const processBuffer = () => {
      while (true) {
        const start = buffer.indexOf('<row')
        if (start === -1) {
          // 保留可能包含未闭合标签的结尾
          buffer = buffer.slice(Math.max(0, buffer.length - 100))
          return
        }
        const end = buffer.indexOf('</row>', start)
        if (end === -1) {
          // 保留从 <row 开始的尾部，等待更多数据
          buffer = buffer.slice(start)
          return
        }

        const rowXml = buffer.slice(start, end + '</row>'.length)
        buffer = buffer.slice(end + '</row>'.length)
        enqueue(rowXml)
      }
    }

    await new Promise<void>((resolve, reject) => {
      let hit = false
      const unzipper = new Unzip(stream => {
        const name = this.normalizePath(stream.name)
        if (name === normalized) {
          hit = true
          stream.ondata = (err, chunk, final) => {
            if (err) {
              reject(err)
              return
            }
            buffer += decoder.decode(chunk, { stream: !final })
            processBuffer()
            if (final) {
              done = true
              enqueue(null)
              resolve()
            }
          }
          stream.start()
        } else {
          stream.terminate()
        }
      })

      unzipper.register(AsyncUnzipInflate)
      unzipper.push(this.zipBytes, true)

      if (!hit) {
        done = true
        enqueue(null)
        resolve()
      }
    })

    while (true) {
      const item = await next()
      if (item.done || item.value === null) {
        return
      }
      yield item.value
    }
  }

  private concatChunks(chunks: Uint8Array[]): Uint8Array {
    if (chunks.length === 1) return chunks[0]
    const total = chunks.reduce((sum, c) => sum + c.length, 0)
    const out = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) {
      out.set(chunk, offset)
      offset += chunk.length
    }
    return out
  }

  private normalizePath(path: string): string {
    const normalized = path.startsWith('/') ? path.slice(1) : path
    if (normalized.startsWith('xl/')) return normalized
    if (normalized.startsWith('xl\\')) return normalized.replace(/\\/g, '/')
    if (normalized.startsWith('_rels') || normalized.startsWith('docProps')) {
      return normalized.replace(/\\/g, '/')
    }
    return `xl/${normalized.replace(/\\\\/g, '/').replace(/\\/g, '/')}`
  }
}
