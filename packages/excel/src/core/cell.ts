import type { CellValue, CellStyle } from './types'
import { isString, isNumber, isDate } from '@cat-kit/core'

/**
 * 不可变的单元格类
 *
 * 所有修改操作都返回新的 Cell 实例而不修改原实例
 */
export class Cell<T extends CellValue = CellValue> {
  /**
   * 单元格值
   */
  readonly value: T

  /**
   * 单元格样式
   */
  readonly style?: CellStyle

  constructor(value: T, style?: CellStyle) {
    this.value = value
    this.style = style
  }

  /**
   * 返回包含新值的新 Cell 实例
   */
  withValue<U extends CellValue>(newValue: U): Cell<U> {
    return new Cell(newValue, this.style)
  }

  /**
   * 返回包含新样式的新 Cell 实例
   */
  withStyle(newStyle: CellStyle): Cell<T> {
    return new Cell(this.value, { ...this.style, ...newStyle })
  }

  /**
   * 返回合并样式后的新 Cell 实例
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
   */
  isEmpty(): boolean {
    return this.value === null || this.value === undefined
  }

  /**
   * 获取单元格值类型
   */
  getValueType(): 'string' | 'number' | 'date' | 'boolean' | 'null' {
    if (this.value === null || this.value === undefined) return 'null'
    if (isDate(this.value)) return 'date'
    if (isString(this.value)) return 'string'
    if (isNumber(this.value)) return 'number'
    return 'boolean'
  }
}
