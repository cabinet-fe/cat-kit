import { Worksheet } from './worksheet'
import type { WorkbookMetadata } from './types'
import { ValidationError } from '../errors'
import { writeWorkbook as writeWorkbookFflate } from '../writer/xlsx-writer'

/**
 * 不可变的工作簿类
 */
export class Workbook {
  readonly name: string
  readonly sheets: ReadonlyArray<Worksheet>
  readonly metadata?: Readonly<WorkbookMetadata>

  constructor(
    name: string = '工作簿',
    options?: {
      sheets?: Worksheet[]
      metadata?: WorkbookMetadata
    }
  ) {
    this.name = name
    this.sheets = options?.sheets ?? []
    this.metadata = options?.metadata
  }

  /**
   * 返回添加工作表后的新 Workbook 实例
   */
  addSheet(sheet: Worksheet): Workbook {
    // 检查工作表名称是否重复
    if (this.sheets.some(s => s.name === sheet.name)) {
      throw new ValidationError(`工作表名称 "${sheet.name}" 已存在`)
    }

    return new Workbook(this.name, {
      sheets: [...this.sheets, sheet],
      metadata: this.metadata
    })
  }

  /**
   * 返回添加多个工作表后的新 Workbook 实例
   */
  addSheets(sheets: Worksheet[]): Workbook {
    let result: Workbook = this
    for (const sheet of sheets) {
      result = result.addSheet(sheet)
    }
    return result
  }

  /**
   * 通过索引获取工作表
   */
  getSheet(index: number): Worksheet | undefined
  /**
   * 通过名称获取工作表
   */
  getSheet(name: string): Worksheet | undefined
  getSheet(identifier: number | string): Worksheet | undefined {
    if (typeof identifier === 'number') {
      return this.sheets[identifier]
    } else {
      return this.sheets.find(sheet => sheet.name === identifier)
    }
  }

  /**
   * 返回删除工作表后的新 Workbook 实例
   */
  removeSheet(identifier: number | string): Workbook {
    let index: number

    if (typeof identifier === 'number') {
      index = identifier
    } else {
      index = this.sheets.findIndex(sheet => sheet.name === identifier)
      if (index === -1) {
        throw new ValidationError(`工作表 "${identifier}" 不存在`)
      }
    }

    const newSheets = [
      ...this.sheets.slice(0, index),
      ...this.sheets.slice(index + 1)
    ]

    return new Workbook(this.name, {
      sheets: newSheets,
      metadata: this.metadata
    })
  }

  /**
   * 返回设置元数据后的新 Workbook 实例
   */
  withMetadata(metadata: WorkbookMetadata): Workbook {
    return new Workbook(this.name, {
      sheets: [...this.sheets],
      metadata: { ...this.metadata, ...metadata }
    })
  }

  /**
   * 返回重命名后的新 Workbook 实例
   */
  withName(newName: string): Workbook {
    return new Workbook(newName, {
      sheets: [...this.sheets],
      metadata: this.metadata
    })
  }

  /**
   * 获取工作表数量
   */
  get sheetCount(): number {
    return this.sheets.length
  }

  /**
   * 迭代器支持
   */
  *[Symbol.iterator](): Iterator<Worksheet> {
    for (const sheet of this.sheets) {
      yield sheet
    }
  }

  /**
   * 导出为 Excel 文件
   * 使用轻量级的 fflate writer
   */
  async write(): Promise<Blob> {
    // 使用新的 fflate writer（轻量级）
    return await writeWorkbookFflate(this)
  }
}
