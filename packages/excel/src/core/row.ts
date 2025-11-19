import { Cell } from './cell'
import type { CellValue, CellStyle } from './types'

/**
 * 不可变的行类
 */
export class Row {
  /**
   * 行中的单元格
   */
  readonly cells: ReadonlyArray<Cell>

  /**
   * 行高（Excel 单位）
   */
  readonly height?: number

  /**
   * 行是否隐藏
   */
  readonly hidden?: boolean

  constructor(
    cells: CellValue[] | Cell[],
    options?: { height?: number; hidden?: boolean }
  ) {
    // 如果传入的是值数组，转换为 Cell 数组
    this.cells = cells.map(cell =>
      cell instanceof Cell ? cell : new Cell(cell)
    )
    this.height = options?.height
    this.hidden = options?.hidden
  }

  /**
   * 获取指定索引的单元格
   */
  getCell(index: number): Cell | undefined {
    return this.cells[index]
  }

  /**
   * 获取单元格数量
   */
  get length(): number {
    return this.cells.length
  }

  /**
   * 返回设置行高后的新 Row 实例
   */
  withHeight(height: number): Row {
    return new Row(this.cells, { height, hidden: this.hidden })
  }

  /**
   * 返回设置隐藏状态后的新 Row 实例
   */
  withHidden(hidden: boolean): Row {
    return new Row(this.cells, { height: this.height, hidden })
  }

  /**
   * 返回更新指定单元格后的新 Row 实例
   */
  withCell(index: number, cell: Cell): Row {
    const newCells = [...this.cells]
    newCells[index] = cell
    return new Row(newCells, { height: this.height, hidden: this.hidden })
  }

  /**
   * 返回应用样式到所有单元格后的新 Row 实例
   */
  withStyle(style: CellStyle): Row {
    const newCells = this.cells.map(cell => cell.withStyle(style))
    return new Row(newCells, { height: this.height, hidden: this.hidden })
  }

  /**
   * 获取所有单元格的值
   */
  getValues(): CellValue[] {
    return this.cells.map(cell => cell.value)
  }

  /**
   * 检查行是否为空
   */
  isEmpty(): boolean {
    return this.cells.every(cell => cell.isEmpty())
  }

  /**
   * 迭代器支持
   */
  *[Symbol.iterator](): Iterator<Cell> {
    for (const cell of this.cells) {
      yield cell
    }
  }
}

