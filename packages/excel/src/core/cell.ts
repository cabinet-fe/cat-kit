import type { CellValue, CellStyle } from './types'
import { isCellFormula, isCellError } from './types'
import { isString, isNumber, isDate } from '@cat-kit/core'

/**
 * 不可变的单元格类
 *
 * 单元格是 Excel 中的基本数据单元，包含值和样式信息。
 * 所有修改操作都返回新的 Cell 实例而不修改原实例（不可变模式）。
 *
 * @template T - 单元格值类型，默认为 CellValue
 *
 * @example
 * ```typescript
 * // 创建简单单元格
 * const cell = new Cell('Hello')
 *
 * // 创建带样式的单元格
 * const styledCell = new Cell(100, {
 *   font: { bold: true, color: '#FF0000' },
 *   numberFormat: '#,##0.00'
 * })
 *
 * // 修改值（返回新实例）
 * const newCell = cell.withValue('World')
 *
 * // 添加样式
 * const boldCell = cell.mergeStyle({ font: { bold: true } })
 * ```
 */
export class Cell<T extends CellValue = CellValue> {
  /**
   * 单元格值
   *
   * 可以是字符串、数字、日期、布尔值、null、公式或错误值
   */
  readonly value: T

  /**
   * 单元格样式
   *
   * 包括字体、边框、填充、对齐和数字格式等样式信息
   */
  readonly style?: CellStyle

  /**
   * 创建单元格实例
   *
   * @param value - 单元格值
   * @param style - 可选的样式信息
   */
  constructor(value: T, style?: CellStyle) {
    this.value = value
    this.style = style
  }

  /**
   * 返回包含新值的新 Cell 实例
   *
   * @template U - 新值的类型
   * @param newValue - 新的单元格值
   * @returns 包含新值的新 Cell 实例
   *
   * @example
   * ```typescript
   * const cell = new Cell('Hello')
   * const newCell = cell.withValue(123) // 类型会自动推断为 Cell<number>
   * ```
   */
  withValue<U extends CellValue>(newValue: U): Cell<U> {
    return new Cell(newValue, this.style)
  }

  /**
   * 返回包含新样式的新 Cell 实例
   *
   * 注意：此方法会完全替换现有样式
   *
   * @param newStyle - 新的样式
   * @returns 包含新样式的新 Cell 实例
   *
   * @example
   * ```typescript
   * const cell = new Cell('Hello')
   * const styledCell = cell.withStyle({
   *   font: { bold: true },
   *   fill: { fgColor: '#FFFF00', patternType: 'solid' }
   * })
   * ```
   */
  withStyle(newStyle: CellStyle): Cell<T> {
    return new Cell(this.value, { ...this.style, ...newStyle })
  }

  /**
   * 返回合并样式后的新 Cell 实例
   *
   * 此方法会深度合并样式属性，保留原有样式中未被覆盖的部分
   *
   * @param additionalStyle - 要合并的附加样式
   * @returns 合并样式后的新 Cell 实例
   *
   * @example
   * ```typescript
   * const cell = new Cell('Hello', { font: { size: 12, bold: true } })
   * // 只修改颜色，保留原有的 size 和 bold
   * const coloredCell = cell.mergeStyle({ font: { color: '#FF0000' } })
   * // 结果: { font: { size: 12, bold: true, color: '#FF0000' } }
   * ```
   */
  mergeStyle(additionalStyle: CellStyle): Cell<T> {
    const mergedStyle: CellStyle = {}

    if (this.style || additionalStyle) {
      // 合并字体
      if (this.style?.font || additionalStyle.font) {
        mergedStyle.font = { ...this.style?.font, ...additionalStyle.font }
      }

      // 合并边框
      if (this.style?.border || additionalStyle.border) {
        mergedStyle.border = {
          ...this.style?.border,
          ...additionalStyle.border
        }
      }

      // 合并填充
      if (this.style?.fill || additionalStyle.fill) {
        mergedStyle.fill = { ...this.style?.fill, ...additionalStyle.fill }
      }

      // 合并对齐
      if (this.style?.alignment || additionalStyle.alignment) {
        mergedStyle.alignment = {
          ...this.style?.alignment,
          ...additionalStyle.alignment
        }
      }

      // 数字格式
      if (additionalStyle.numberFormat !== undefined) {
        mergedStyle.numberFormat = additionalStyle.numberFormat
      } else if (this.style?.numberFormat !== undefined) {
        mergedStyle.numberFormat = this.style.numberFormat
      }
    }

    return new Cell(this.value, mergedStyle)
  }

  /**
   * 检查单元格是否为空
   *
   * @returns 如果值为 null 或 undefined，返回 true
   *
   * @example
   * ```typescript
   * const emptyCell = new Cell(null)
   * console.log(emptyCell.isEmpty()) // true
   *
   * const valueCell = new Cell('')
   * console.log(valueCell.isEmpty()) // false（空字符串不是空值）
   * ```
   */
  isEmpty(): boolean {
    return this.value === null || this.value === undefined
  }

  /**
   * 获取单元格值类型
   *
   * @returns 值类型字符串
   *
   * @example
   * ```typescript
   * new Cell('text').getValueType() // 'string'
   * new Cell(123).getValueType() // 'number'
   * new Cell(new Date()).getValueType() // 'date'
   * new Cell({ type: 'formula', formula: 'SUM(A1:A10)' }).getValueType() // 'formula'
   * ```
   */
  getValueType():
    | 'string'
    | 'number'
    | 'date'
    | 'boolean'
    | 'null'
    | 'formula'
    | 'error' {
    if (this.value === null || this.value === undefined) return 'null'
    if (isCellFormula(this.value)) return 'formula'
    if (isCellError(this.value)) return 'error'
    if (isDate(this.value)) return 'date'
    if (isString(this.value)) return 'string'
    if (isNumber(this.value)) return 'number'
    return 'boolean'
  }
}
