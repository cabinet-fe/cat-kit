import { Worksheet } from './worksheet'
import type { WorkbookMetadata } from './types'
import { ValidationError } from '../errors'
import { writeWorkbook as writeWorkbookFflate } from '../writer/xlsx-writer'

/**
 * 不可变的工作簿类
 *
 * 表示一个完整的 Excel 工作簿，包含多个工作表和元数据。
 * 所有修改操作都返回新的 Workbook 实例而不修改原实例（不可变模式）。
 *
 * @example
 * ```typescript
 * // 创建空工作簿
 * const workbook = new Workbook('我的工作簿')
 *
 * // 创建带工作表的工作簿
 * const workbook = new Workbook('销售报表', {
 *   sheets: [sheet1, sheet2],
 *   metadata: {
 *     creator: 'John Doe',
 *     created: new Date()
 *   }
 * })
 *
 * // 添加工作表
 * const newWorkbook = workbook.addSheet(sheet3)
 *
 * // 导出为 Excel 文件
 * const blob = await workbook.write()
 * ```
 */
export class Workbook {
  /**
   * 工作簿名称
   */
  readonly name: string

  /**
   * 工作表数组（只读）
   */
  readonly sheets: ReadonlyArray<Worksheet>

  /**
   * 工作簿元数据（只读）
   *
   * 包括创建者、修改时间等信息
   */
  readonly metadata?: Readonly<WorkbookMetadata>

  /**
   * 创建工作簿实例
   *
   * @param name - 工作簿名称，默认为 '工作簿'
   * @param options - 可选配置
   * @param options.sheets - 初始工作表数组
   * @param options.metadata - 工作簿元数据
   */
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
   *
   * @param sheet - 要添加的工作表
   * @returns 新的 Workbook 实例
   * @throws {ValidationError} 如果工作表名称已存在
   *
   * @example
   * ```typescript
   * const workbook = new Workbook()
   * const sheet = new Worksheet('Sheet1', { rows: [[1, 2, 3]] })
   * const newWorkbook = workbook.addSheet(sheet)
   * ```
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
   *
   * @param sheets - 要添加的工作表数组
   * @returns 新的 Workbook 实例
   * @throws {ValidationError} 如果任何工作表名称已存在
   *
   * @example
   * ```typescript
   * const workbook = new Workbook()
   * const newWorkbook = workbook.addSheets([sheet1, sheet2, sheet3])
   * ```
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
   *
   * @param index - 工作表索引（0-based）
   * @returns Worksheet 实例，如果不存在则返回 undefined
   */
  getSheet(index: number): Worksheet | undefined
  /**
   * 通过名称获取工作表
   *
   * @param name - 工作表名称
   * @returns Worksheet 实例，如果不存在则返回 undefined
   *
   * @example
   * ```typescript
   * const workbook = new Workbook('Book', { sheets: [sheet1, sheet2] })
   *
   * // 通过索引获取
   * const first = workbook.getSheet(0)
   *
   * // 通过名称获取
   * const named = workbook.getSheet('Sheet1')
   * ```
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
   *
   * @param identifier - 工作表索引（0-based）或名称
   * @returns 新的 Workbook 实例
   * @throws {ValidationError} 如果工作表不存在
   *
   * @example
   * ```typescript
   * const workbook = new Workbook('Book', { sheets: [sheet1, sheet2] })
   *
   * // 通过索引删除
   * const updated1 = workbook.removeSheet(0)
   *
   * // 通过名称删除
   * const updated2 = workbook.removeSheet('Sheet1')
   * ```
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
   *
   * 新的元数据会与现有元数据合并
   *
   * @param metadata - 要设置的元数据
   * @returns 新的 Workbook 实例
   *
   * @example
   * ```typescript
   * const workbook = new Workbook()
   * const updated = workbook.withMetadata({
   *   creator: 'John Doe',
   *   created: new Date(),
   *   customProperties: { department: 'Sales' }
   * })
   * ```
   */
  withMetadata(metadata: WorkbookMetadata): Workbook {
    return new Workbook(this.name, {
      sheets: [...this.sheets],
      metadata: { ...this.metadata, ...metadata }
    })
  }

  /**
   * 返回重命名后的新 Workbook 实例
   *
   * @param newName - 新的工作簿名称
   * @returns 新的 Workbook 实例
   *
   * @example
   * ```typescript
   * const workbook = new Workbook('OldName')
   * const renamed = workbook.withName('NewName')
   * ```
   */
  withName(newName: string): Workbook {
    return new Workbook(newName, {
      sheets: [...this.sheets],
      metadata: this.metadata
    })
  }

  /**
   * 获取工作表数量
   *
   * @example
   * ```typescript
   * const workbook = new Workbook('Book', { sheets: [sheet1, sheet2] })
   * console.log(workbook.sheetCount) // 2
   * ```
   */
  get sheetCount(): number {
    return this.sheets.length
  }

  /**
   * 迭代器支持
   *
   * 允许使用 for...of 循环遍历工作表
   *
   * @example
   * ```typescript
   * const workbook = new Workbook('Book', { sheets: [sheet1, sheet2] })
   * for (const sheet of workbook) {
   *   console.log(sheet.name)
   * }
   * ```
   */
  *[Symbol.iterator](): Iterator<Worksheet> {
    for (const sheet of this.sheets) {
      yield sheet
    }
  }

  /**
   * 导出为 Excel 文件
   *
   * 生成符合 Office Open XML 标准的 .xlsx 文件
   *
   * @returns Promise<Blob> - Excel 文件的 Blob 对象
   *
   * @example
   * ```typescript
   * const workbook = new Workbook('Report', { sheets: [sheet1, sheet2] })
   * const blob = await workbook.write()
   *
   * // 在浏览器中下载
   * const url = URL.createObjectURL(blob)
   * const a = document.createElement('a')
   * a.href = url
   * a.download = 'report.xlsx'
   * a.click()
   * ```
   */
  async write(): Promise<Blob> {
    // 使用新的 fflate writer（轻量级）
    return await writeWorkbookFflate(this)
  }
}
