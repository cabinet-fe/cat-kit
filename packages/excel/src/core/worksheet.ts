import { Cell } from './cell'
import { Row } from './row'
import type { CellValue, CellStyle, MergedCellRange } from './types'
import { parseAddress, pixelsToExcelWidth } from '../helpers/address'
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
  rows?: CellValue[][]
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
      // 从行数据初始化
      this.rows = options.rows.map(rowData => new Row(rowData))
    } else {
      this.rows = []
    }
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

        // 自动处理日期格式
        if (value instanceof Date && !col.format) {
          cell = cell.mergeStyle({
            numberFormat: 'yyyy-MM-dd'
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
      rows: this.rows.map(row => row.getValues()),
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 返回追加行后的新 Worksheet 实例
   */
  appendRow(row: Row): Worksheet {
    return new Worksheet(this.name, {
      rows: [...this.rows, row].map(r => r.getValues()),
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths }
    })
  }

  /**
   * 返回追加多行后的新 Worksheet 实例
   */
  appendRows(rows: Row[]): Worksheet {
    return new Worksheet(this.name, {
      rows: [...this.rows, ...rows].map(r => r.getValues()),
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
      rows: this.rows.map(row => row.getValues()),
      mergedCells: [...this.mergedCells],
      columnWidths: { ...this.columnWidths, [columnIndex]: width }
    })
  }

  /**
   * 添加合并单元格
   */
  withMergedCell(range: MergedCellRange): Worksheet {
    return new Worksheet(this.name, {
      rows: this.rows.map(row => row.getValues()),
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
   * 迭代器支持
   */
  *[Symbol.iterator](): Iterator<Row> {
    for (const row of this.rows) {
      yield row
    }
  }
}
