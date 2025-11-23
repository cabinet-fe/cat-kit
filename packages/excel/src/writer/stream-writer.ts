/**
 * 流式写入 API
 *
 * 使用 Web Streams API 实现大文件的流式写入，避免一次性在内存中构建整个文件
 */

import type { Worksheet } from '../core/worksheet'
import type { WorkbookMetadata } from '../core/types'
import { StreamError } from '../errors'

/**
 * 流式写入器配置
 */
export interface StreamWriterOptions {
  /** 工作簿名称 */
  workbookName?: string
  /** 工作簿元数据 */
  metadata?: WorkbookMetadata
}

/**
 * 流式工作簿写入器
 *
 * 适合处理大量数据的场景，可以逐个添加工作表，避免一次性加载所有数据到内存
 *
 * @example
 * ```typescript
 * const writer = new StreamWorkbookWriter({ workbookName: '大数据报表' })
 *
 * // 添加工作表
 * writer.addSheet(sheet1)
 * writer.addSheet(sheet2)
 *
 * // 生成并下载
 * const blob = await writer.write()
 * ```
 */
export class StreamWorkbookWriter {
  private sheets: Worksheet[] = []
  private workbookName: string
  private metadata?: WorkbookMetadata

  constructor(options: StreamWriterOptions = {}) {
    this.workbookName = options.workbookName || '工作簿'
    this.metadata = options.metadata
  }

  /**
   * 添加工作表
   *
   * @param sheet - 要添加的工作表
   */
  addSheet(sheet: Worksheet): void {
    this.sheets.push(sheet)
  }

  /**
   * 添加多个工作表
   *
   * @param sheets - 要添加的工作表数组
   */
  addSheets(sheets: Worksheet[]): void {
    this.sheets.push(...sheets)
  }

  /**
   * 获取已添加的工作表数量
   */
  get sheetCount(): number {
    return this.sheets.length
  }

  /**
   * 写入为 Blob
   *
   * 注意：虽然这是"流式"写入器，但最终的压缩步骤仍需要在内存中完成
   * 主要优势在于可以逐步构建工作表，而不是一次性创建完整的 Workbook 对象
   *
   * @returns Promise<Blob>
   */
  async write(): Promise<Blob> {
    if (this.sheets.length === 0) {
      throw new StreamError('至少需要添加一个工作表')
    }

    // 导入 writer（延迟导入以避免循环依赖）
    const { writeWorkbook } = await import('./xlsx-writer')
    const { Workbook } = await import('../core/workbook')

    // 创建临时 Workbook 对象
    const workbook = new Workbook(this.workbookName, {
      sheets: this.sheets,
      metadata: this.metadata
    })

    // 使用现有的写入器
    return await writeWorkbook(workbook)
  }

  /**
   * 清空所有工作表
   *
   * 可用于释放内存后重新使用同一个写入器
   */
  clear(): void {
    this.sheets = []
  }

  /**
   * 创建一个 WritableStream 用于逐个写入工作表
   *
   * @returns WritableStream<Worksheet>
   *
   * @example
   * ```typescript
   * const writer = new StreamWorkbookWriter()
   * const stream = writer.createWritableStream()
   * const streamWriter = stream.getWriter()
   *
   * await streamWriter.write(sheet1)
   * await streamWriter.write(sheet2)
   * await streamWriter.close()
   *
   * const blob = await writer.write()
   * ```
   */
  createWritableStream(): WritableStream<Worksheet> {
    return new WritableStream({
      write: async (sheet: Worksheet) => {
        this.addSheet(sheet)
      },
      close: async () => {
        // 流关闭时不自动写入，需要手动调用 write()
      },
      abort: reason => {
        throw new StreamError(`写入流中止: ${reason}`)
      }
    })
  }
}

/**
 * 创建流式工作簿写入器的便捷函数
 *
 * @param options - 写入器配置
 * @returns StreamWorkbookWriter 实例
 */
export function createStreamWriter(
  options?: StreamWriterOptions
): StreamWorkbookWriter {
  return new StreamWorkbookWriter(options)
}
