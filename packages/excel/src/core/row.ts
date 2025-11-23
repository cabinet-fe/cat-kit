import { Cell } from './cell'
import type { CellValue, CellStyle } from './types'

/**
 * 不可变的行类
 *
 * 表示 Excel 工作表中的一行，包含多个单元格。
 * 所有修改操作都返回新的 Row 实例而不修改原实例（不可变模式）。
 *
 * @example
 * ```typescript
 * // 从值数组创建行
 * const row = new Row(['Name', 'Age', 'Email'])
 *
 * // 从 Cell 数组创建行
 * const row = new Row([
 *   new Cell('Name', { font: { bold: true } }),
 *   new Cell(25),
 *   new Cell('user@example.com')
 * ])
 *
 * // 设置行高
 * const tallRow = new Row(['A', 'B', 'C'], { height: 30 })
 *
 * // 修改单元格
 * const updatedRow = row.withCell(1, new Cell(26))
 * ```
 */
export class Row {
  /**
   * 行中的单元格数组（只读）
   */
  readonly cells: ReadonlyArray<Cell>

  /**
   * 行高（Excel 单位）
   *
   * Excel 默认行高约为 15
   */
  readonly height?: number

  /**
   * 行是否隐藏
   */
  readonly hidden?: boolean

  /**
   * 创建行实例
   *
   * @param cells - 单元格数组，可以是 CellValue 数组或 Cell 数组
   * @param options - 可选配置
   * @param options.height - 行高（Excel 单位）
   * @param options.hidden - 是否隐藏此行
   */
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
   *
   * @param index - 单元格索引（0-based）
   * @returns Cell 实例，如果索引超出范围则返回 undefined
   *
   * @example
   * ```typescript
   * const row = new Row(['A', 'B', 'C'])
   * const cell = row.getCell(1) // 获取 'B'
   * ```
   */
  getCell(index: number): Cell | undefined {
    return this.cells[index]
  }

  /**
   * 获取单元格数量
   *
   * @example
   * ```typescript
   * const row = new Row(['A', 'B', 'C'])
   * console.log(row.length) // 3
   * ```
   */
  get length(): number {
    return this.cells.length
  }

  /**
   * 返回设置行高后的新 Row 实例
   *
   * @param height - 行高（Excel 单位）
   * @returns 新的 Row 实例
   *
   * @example
   * ```typescript
   * const row = new Row(['A', 'B'])
   * const tallRow = row.withHeight(30)
   * ```
   */
  withHeight(height: number): Row {
    return new Row([...this.cells], { height, hidden: this.hidden })
  }

  /**
   * 返回设置隐藏状态后的新 Row 实例
   *
   * @param hidden - 是否隐藏
   * @returns 新的 Row 实例
   *
   * @example
   * ```typescript
   * const row = new Row(['A', 'B'])
   * const hiddenRow = row.withHidden(true)
   * ```
   */
  withHidden(hidden: boolean): Row {
    return new Row([...this.cells], { height: this.height, hidden })
  }

  /**
   * 返回更新指定单元格后的新 Row 实例
   *
   * @param index - 单元格索引（0-based）
   * @param cell - 新的 Cell 实例
   * @returns 新的 Row 实例
   *
   * @example
   * ```typescript
   * const row = new Row(['A', 'B', 'C'])
   * const updatedRow = row.withCell(1, new Cell('X'))
   * // 结果: ['A', 'X', 'C']
   * ```
   */
  withCell(index: number, cell: Cell): Row {
    const newCells = [...this.cells]
    newCells[index] = cell
    return new Row(newCells, { height: this.height, hidden: this.hidden })
  }

  /**
   * 返回应用样式到所有单元格后的新 Row 实例
   *
   * @param style - 要应用的样式
   * @returns 新的 Row 实例
   *
   * @example
   * ```typescript
   * const row = new Row(['A', 'B', 'C'])
   * const boldRow = row.withStyle({ font: { bold: true } })
   * ```
   */
  withStyle(style: CellStyle): Row {
    const newCells = this.cells.map(cell => cell.withStyle(style))
    return new Row(newCells, { height: this.height, hidden: this.hidden })
  }

  /**
   * 获取所有单元格的值数组
   *
   * @returns 值数组
   *
   * @example
   * ```typescript
   * const row = new Row([
   *   new Cell('A', { font: { bold: true } }),
   *   new Cell(123),
   *   new Cell(null)
   * ])
   * console.log(row.getValues()) // ['A', 123, null]
   * ```
   */
  getValues(): CellValue[] {
    return this.cells.map(cell => cell.value)
  }

  /**
   * 检查行是否为空
   *
   * 如果所有单元格都为空（null 或 undefined），则返回 true
   *
   * @returns 是否为空行
   *
   * @example
   * ```typescript
   * const emptyRow = new Row([null, null, null])
   * console.log(emptyRow.isEmpty()) // true
   *
   * const nonEmptyRow = new Row(['', null, null])
   * console.log(nonEmptyRow.isEmpty()) // false（空字符串不是空值）
   * ```
   */
  isEmpty(): boolean {
    return this.cells.every(cell => cell.isEmpty())
  }

  /**
   * 迭代器支持
   *
   * 允许使用 for...of 循环遍历单元格
   *
   * @example
   * ```typescript
   * const row = new Row(['A', 'B', 'C'])
   * for (const cell of row) {
   *   console.log(cell.value)
   * }
   * ```
   */
  *[Symbol.iterator](): Iterator<Cell> {
    for (const cell of this.cells) {
      yield cell
    }
  }
}
