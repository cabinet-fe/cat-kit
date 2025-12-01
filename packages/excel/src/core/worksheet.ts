import { Cell } from './cell'
import { Row } from './row'
import type {
  CellValue,
  CellStyle,
  MergedCellRange,
  CellAddress,
  CellRange
} from './types'
import {
  parseAddress,
  parseRange,
  pixelsToExcelWidth
} from '../helpers/address'
import { DEFAULT_DATE_FORMAT } from '../helpers/date'
import { ValidationError } from '../errors'

/**
 * 表格列定义
 */
export interface TableColumn<T = any> {
  /** 表头名称 */
  name: string
  /** 值键 */
  key: keyof T
  /** 列宽（像素） */
  width?: number
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 数字格式 */
  format?: string
  /** 自定义样式 */
  style?: CellStyle
}

/**
 * 表格数据
 */
export interface TableData<T = any> {
  /** 列定义 */
  columns: TableColumn<T>[]
  /** 数据行 */
  data: T[]
  /** 表头样式 */
  headerStyle?: CellStyle
  /** 数据样式 */
  dataStyle?: CellStyle
}

/**
 * Worksheet 选项
 */
export interface WorksheetOptions {
  /** 直接提供行数据 */
  rows?: Array<Row | ReadonlyArray<CellValue | Cell>>
  /** 表格数据（语法糖） */
  table?: TableData
  /** 合并单元格 */
  mergedCells?: MergedCellRange[]
  /** 列宽设置（索引 => Excel 列宽单位） */
  columnWidths?: Record<number, number>
}

/**
 * 不可变的工作表类
 */
export class Worksheet {
  readonly name: string
  readonly rows: ReadonlyArray<Row>
  readonly mergedCells: ReadonlyArray<MergedCellRange>
  readonly columnWidths: Readonly<Record<number, number>>

  constructor(name: string, options?: WorksheetOptions) {
    this.name = name
    this.mergedCells = options?.mergedCells ?? []
    this.columnWidths = options?.columnWidths ?? {}

    if (options?.table) {
      // 从表格数据初始化
      const result = this.initFromTable(options.table)
      this.rows = result.rows
      this.columnWidths = result.columnWidths
    } else if (options?.rows) {
      // 从行数据初始化，支持 Row 或值数组
      this.rows = options.rows.map(rowData => this.normalizeRow(rowData))
    } else {
      this.rows = []
    }
  }

  /**
   * 将多种行输入形式规范化为 Row
   */
  private normalizeRow(row: Row | ReadonlyArray<CellValue | Cell>): Row {
    if (row instanceof Row) return row
    return new Row(row)
  }

  /**
   * 从表格数据初始化
   */
  private initFromTable<T>(tableData: TableData<T>): {
    rows: Row[]
    columnWidths: Record<number, number>
  } {
    const { columns, data, headerStyle, dataStyle } = tableData

    if (!columns || columns.length === 0) {
      throw new ValidationError('至少需要一列')
    }

    const rows: Row[] = []
    const columnWidths: Record<number, number> = {}

    // 创建表头行
    const headerCells = columns.map(col => {
      let cell = new Cell(col.name)

      // 应用表头样式
      if (headerStyle) {
        cell = cell.withStyle(headerStyle)
      }

      // 应用列对齐方式到表头
      if (col.align) {
        cell = cell.mergeStyle({
          alignment: { horizontal: col.align }
        })
      }

      return cell
    })
    rows.push(new Row(headerCells))

    // 创建数据行
    for (const rowData of data) {
      const cells = columns.map(col => {
        const value = rowData[col.key] as CellValue
        let cell = new Cell(value)

        // 应用数据样式（优先级最低）
        if (dataStyle) {
          cell = cell.withStyle(dataStyle)
        }

        // 应用列样式（优先级较高）
        if (col.style) {
          cell = cell.mergeStyle(col.style)
        }

        // 应用列对齐方式
        if (col.align) {
          cell = cell.mergeStyle({
            alignment: { horizontal: col.align }
          })
        }

        // 应用数字格式
        if (col.format && typeof value === 'number') {
          cell = cell.mergeStyle({
            numberFormat: col.format
          })
        }

        // 自动处理日期格式（如果列没有指定格式）
        if (value instanceof Date && !col.format) {
          cell = cell.mergeStyle({
            numberFormat: DEFAULT_DATE_FORMAT
          })
        }

        return cell
      })
      rows.push(new Row(cells))
    }

    // 应用列宽
    columns.forEach((col, index) => {
      if (col.width !== undefined && col.width > 0) {
        columnWidths[index] = pixelsToExcelWidth(col.width)
      }
    })

    return { rows, columnWidths }
  }

  /**
   * 返回修改名称后的新 Worksheet 实例
   */
  withName(newName: string): Worksheet {
    return new Worksheet(newName, {
      rows: [...this.rows],
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 返回追加行后的新 Worksheet 实例
   */
  appendRow(row: Row): Worksheet {
    return new Worksheet(this.name, {
      rows: [...this.rows, row],
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 返回追加多行后的新 Worksheet 实例
   */
  appendRows(rows: Row[]): Worksheet {
    return new Worksheet(this.name, {
      rows: [...this.rows, ...rows],
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 获取指定行
   */
  getRow(index: number): Row | undefined {
    return this.rows[index]
  }

  /**
   * 通过地址获取单元格
   */
  getCell(address: string): Cell | undefined
  getCell(row: number, column: number): Cell | undefined
  getCell(arg1: string | number, arg2?: number): Cell | undefined {
    let rowIndex: number
    let colIndex: number

    if (typeof arg1 === 'string') {
      const addr = parseAddress(arg1)
      rowIndex = addr.row
      colIndex = addr.column
    } else {
      if (arg2 === undefined) {
        throw new ValidationError('列索引是必需的')
      }
      rowIndex = arg1
      colIndex = arg2
    }

    const row = this.getRow(rowIndex)
    return row?.getCell(colIndex)
  }

  /**
   * 设置列宽
   */
  withColumnWidth(columnIndex: number, width: number): Worksheet {
    return new Worksheet(this.name, {
      rows: [...this.rows],
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths, [columnIndex]: width }
    })
  }

  /**
   * 添加合并单元格
   */
  withMergedCell(range: MergedCellRange): Worksheet {
    return new Worksheet(this.name, {
      rows: [...this.rows],
      mergedCells: [...this.mergedCells, range],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 获取工作表的行数
   */
  get rowCount(): number {
    return this.rows.length
  }

  /**
   * 获取工作表的列数（基于第一行）
   */
  get columnCount(): number {
    return this.rows[0]?.length ?? 0
  }

  /**
   * 在指定位置插入一行
   *
   * @param index - 插入位置索引（0-based）
   * @param row - 要插入的行，如果未提供则插入空行
   * @returns 插入后的新 Worksheet 实例
   */
  insertRow(index: number, row?: Row): Worksheet {
    if (index < 0 || index > this.rows.length) {
      throw new ValidationError(`无效的行索引: ${index}`)
    }

    const newRow = row || new Row([])
    const newRows = [
      ...this.rows.slice(0, index),
      newRow,
      ...this.rows.slice(index)
    ]

    return new Worksheet(this.name, {
      rows: newRows,
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 在指定位置插入多行
   *
   * @param index - 插入位置索引（0-based）
   * @param rows - 要插入的行数组
   * @returns 插入后的新 Worksheet 实例
   */
  insertRows(index: number, rows: Row[]): Worksheet {
    if (index < 0 || index > this.rows.length) {
      throw new ValidationError(`无效的行索引: ${index}`)
    }

    const newRows = [
      ...this.rows.slice(0, index),
      ...rows,
      ...this.rows.slice(index)
    ]

    return new Worksheet(this.name, {
      rows: newRows,
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 删除指定行
   *
   * @param index - 要删除的行索引（0-based）
   * @returns 删除后的新 Worksheet 实例
   */
  deleteRow(index: number): Worksheet {
    if (index < 0 || index >= this.rows.length) {
      throw new ValidationError(`无效的行索引: ${index}`)
    }

    const newRows = [
      ...this.rows.slice(0, index),
      ...this.rows.slice(index + 1)
    ]

    return new Worksheet(this.name, {
      rows: newRows,
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 删除多行
   *
   * @param startIndex - 起始行索引（0-based）
   * @param count - 要删除的行数
   * @returns 删除后的新 Worksheet 实例
   */
  deleteRows(startIndex: number, count: number): Worksheet {
    if (startIndex < 0 || startIndex >= this.rows.length) {
      throw new ValidationError(`无效的起始行索引: ${startIndex}`)
    }
    if (count <= 0) {
      throw new ValidationError(`行数必须大于 0`)
    }

    const newRows = [
      ...this.rows.slice(0, startIndex),
      ...this.rows.slice(startIndex + count)
    ]

    return new Worksheet(this.name, {
      rows: newRows,
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 在指定位置插入一列
   *
   * @param index - 插入位置索引（0-based）
   * @returns 插入后的新 Worksheet 实例
   */
  insertColumn(index: number): Worksheet {
    if (index < 0) {
      throw new ValidationError(`无效的列索引: ${index}`)
    }

    const newRows = this.rows.map(row => {
      const cells = [...row.cells]
      cells.splice(index, 0, new Cell(null))
      const options: { height?: number; hidden?: boolean } = {}
      if (row.height !== undefined) options.height = row.height
      if (row.hidden !== undefined) options.hidden = row.hidden
      return new Row(cells, options)
    })

    // 调整列宽映射
    const newColumnWidths: Record<number, number> = {}
    for (const [colIndex, width] of Object.entries(this.columnWidths)) {
      const idx = parseInt(colIndex)
      if (idx >= index) {
        newColumnWidths[idx + 1] = width
      } else {
        newColumnWidths[idx] = width
      }
    }

    return new Worksheet(this.name, {
      rows: newRows,
      mergedCells: [...this.mergedCells],
      columnWidths: newColumnWidths
    })
  }

  /**
   * 在指定位置插入多列
   *
   * @param index - 插入位置索引（0-based）
   * @param count - 要插入的列数
   * @returns 插入后的新 Worksheet 实例
   */
  insertColumns(index: number, count: number): Worksheet {
    if (index < 0) {
      throw new ValidationError(`无效的列索引: ${index}`)
    }
    if (count <= 0) {
      throw new ValidationError(`列数必须大于 0`)
    }

    const newRows = this.rows.map(row => {
      const cells = [...row.cells]
      const emptyCells = Array(count)
        .fill(null)
        .map(() => new Cell(null))
      cells.splice(index, 0, ...emptyCells)
      const options: { height?: number; hidden?: boolean } = {}
      if (row.height !== undefined) options.height = row.height
      if (row.hidden !== undefined) options.hidden = row.hidden
      return new Row(cells, options)
    })

    // 调整列宽映射
    const newColumnWidths: Record<number, number> = {}
    for (const [colIndex, width] of Object.entries(this.columnWidths)) {
      const idx = parseInt(colIndex)
      if (idx >= index) {
        newColumnWidths[idx + count] = width
      } else {
        newColumnWidths[idx] = width
      }
    }

    return new Worksheet(this.name, {
      rows: newRows,
      mergedCells: [...this.mergedCells],
      columnWidths: newColumnWidths
    })
  }

  /**
   * 删除指定列
   *
   * @param index - 要删除的列索引（0-based）
   * @returns 删除后的新 Worksheet 实例
   */
  deleteColumn(index: number): Worksheet {
    if (index < 0) {
      throw new ValidationError(`无效的列索引: ${index}`)
    }

    const newRows = this.rows.map(row => {
      if (index >= row.cells.length) {
        return row
      }
      const cells = [
        ...row.cells.slice(0, index),
        ...row.cells.slice(index + 1)
      ]
      const options: { height?: number; hidden?: boolean } = {}
      if (row.height !== undefined) options.height = row.height
      if (row.hidden !== undefined) options.hidden = row.hidden
      return new Row(cells, options)
    })

    // 调整列宽映射
    const newColumnWidths: Record<number, number> = {}
    for (const [colIndex, width] of Object.entries(this.columnWidths)) {
      const idx = parseInt(colIndex)
      if (idx > index) {
        newColumnWidths[idx - 1] = width
      } else if (idx < index) {
        newColumnWidths[idx] = width
      }
    }

    return new Worksheet(this.name, {
      rows: newRows,
      mergedCells: [...this.mergedCells],
      columnWidths: newColumnWidths
    })
  }

  /**
   * 删除多列
   *
   * @param startIndex - 起始列索引（0-based）
   * @param count - 要删除的列数
   * @returns 删除后的新 Worksheet 实例
   */
  deleteColumns(startIndex: number, count: number): Worksheet {
    if (startIndex < 0) {
      throw new ValidationError(`无效的起始列索引: ${startIndex}`)
    }
    if (count <= 0) {
      throw new ValidationError(`列数必须大于 0`)
    }

    const newRows = this.rows.map(row => {
      if (startIndex >= row.cells.length) {
        return row
      }
      const cells = [
        ...row.cells.slice(0, startIndex),
        ...row.cells.slice(startIndex + count)
      ]
      const options: { height?: number; hidden?: boolean } = {}
      if (row.height !== undefined) options.height = row.height
      if (row.hidden !== undefined) options.hidden = row.hidden
      return new Row(cells, options)
    })

    // 调整列宽映射
    const newColumnWidths: Record<number, number> = {}
    for (const [colIndex, width] of Object.entries(this.columnWidths)) {
      const idx = parseInt(colIndex)
      if (idx >= startIndex + count) {
        newColumnWidths[idx - count] = width
      } else if (idx < startIndex) {
        newColumnWidths[idx] = width
      }
    }

    return new Worksheet(this.name, {
      rows: newRows,
      mergedCells: [...this.mergedCells],
      columnWidths: newColumnWidths
    })
  }

  /**
   * 更新指定单元格
   *
   * @param address - 单元格地址（字符串如 "A1" 或 CellAddress 对象）
   * @param cellOrValue - Cell 对象或单元格值
   * @param style - 可选的样式（当第二个参数为值时使用）
   * @returns 更新后的新 Worksheet 实例
   */
  updateCell(
    address: string | CellAddress,
    cellOrValue: Cell | CellValue,
    style?: CellStyle
  ): Worksheet {
    let rowIndex: number
    let colIndex: number

    if (typeof address === 'string') {
      const addr = parseAddress(address)
      rowIndex = addr.row
      colIndex = addr.column
    } else {
      rowIndex = address.row
      colIndex = address.column
    }

    if (rowIndex < 0 || rowIndex >= this.rows.length) {
      throw new ValidationError(`无效的行索引: ${rowIndex}`)
    }

    const row = this.rows[rowIndex]
    if (!row) {
      throw new ValidationError(`无效的行索引: ${rowIndex}`)
    }

    const cell =
      cellOrValue instanceof Cell ? cellOrValue : new Cell(cellOrValue, style)

    // 确保行有足够的单元格
    const newCells = [...row.cells]
    while (newCells.length <= colIndex) {
      newCells.push(new Cell(null))
    }
    newCells[colIndex] = cell

    const options: { height?: number; hidden?: boolean } = {}
    if (row.height !== undefined) options.height = row.height
    if (row.hidden !== undefined) options.hidden = row.hidden
    const newRow = new Row(newCells, options)
    const newRows = [...this.rows]
    newRows[rowIndex] = newRow

    return new Worksheet(this.name, {
      rows: newRows,
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 批量更新单元格
   *
   * @param updates - 更新数组，每项包含地址和单元格或值
   * @returns 更新后的新 Worksheet 实例
   */
  updateCells(
    updates: Array<{
      address: string | CellAddress
      cell?: Cell
      value?: CellValue
      style?: CellStyle
    }>
  ): Worksheet {
    let result: Worksheet = this

    for (const update of updates) {
      const cell = update.cell || new Cell(update.value ?? null, update.style)
      result = result.updateCell(update.address, cell)
    }

    return result
  }

  /**
   * 为指定范围内的所有单元格设置样式
   *
   * @param range - 单元格范围（字符串如 "A1:C3" 或 CellRange 对象）
   * @param style - 要应用的样式
   * @returns 设置样式后的新 Worksheet 实例
   */
  setCellStyles(range: CellRange | string, style: CellStyle): Worksheet {
    const cellRange = typeof range === 'string' ? parseRange(range) : range

    const updates: Array<{
      address: CellAddress
      cell: Cell
    }> = []

    for (let row = cellRange.start.row; row <= cellRange.end.row; row++) {
      for (
        let col = cellRange.start.column;
        col <= cellRange.end.column;
        col++
      ) {
        const existingCell = this.getCell(row, col) || new Cell(null)
        const newCell = existingCell.mergeStyle(style)
        updates.push({
          address: { row, column: col },
          cell: newCell
        })
      }
    }

    return this.updateCells(updates)
  }

  /**
   * 为指定行的所有单元格设置样式
   *
   * @param rowIndex - 行索引（0-based）
   * @param style - 要应用的样式
   * @returns 设置样式后的新 Worksheet 实例
   */
  setRowStyles(rowIndex: number, style: CellStyle): Worksheet {
    if (rowIndex < 0 || rowIndex >= this.rows.length) {
      throw new ValidationError(`无效的行索引: ${rowIndex}`)
    }

    const row = this.rows[rowIndex]
    if (!row) {
      throw new ValidationError(`无效的行索引: ${rowIndex}`)
    }

    const newRow = row.withStyle(style)

    const newRows = [...this.rows]
    newRows[rowIndex] = newRow

    return new Worksheet(this.name, {
      rows: newRows,
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 为指定列的所有单元格设置样式
   *
   * @param columnIndex - 列索引（0-based）
   * @param style - 要应用的样式
   * @returns 设置样式后的新 Worksheet 实例
   */
  setColumnStyles(columnIndex: number, style: CellStyle): Worksheet {
    if (columnIndex < 0) {
      throw new ValidationError(`无效的列索引: ${columnIndex}`)
    }

    const newRows = this.rows.map(row => {
      if (columnIndex >= row.cells.length) {
        return row
      }

      const cell = row.cells[columnIndex]
      if (!cell) {
        return row
      }

      const newCell = cell.mergeStyle(style)
      return row.withCell(columnIndex, newCell)
    })

    return new Worksheet(this.name, {
      rows: newRows,
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 迭代器支持
   */
  *[Symbol.iterator](): Iterator<Row> {
    for (const row of this.rows) {
      yield row
    }
  }
}
