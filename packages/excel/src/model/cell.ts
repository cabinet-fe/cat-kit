import { ExcelValueError } from '../errors'
import type { CellStyle, CellValue } from '../types'
import { isFormulaValue } from '../utils/guards'

export class Cell {
  public value: CellValue = null
  public style?: CellStyle

  constructor(value: CellValue = null, style?: CellStyle) {
    this.setValue(value)
    if (style) {
      this.style = style
    }
  }

  setValue(value: CellValue): this {
    if (value instanceof Date && Number.isNaN(value.getTime())) {
      throw new ExcelValueError('Invalid Date cell value', 'INVALID_DATE_VALUE')
    }
    if (
      value !== null &&
      !(value instanceof Date) &&
      !isFormulaValue(value) &&
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'boolean'
    ) {
      throw new ExcelValueError('Unsupported cell value type', 'UNSUPPORTED_VALUE_TYPE')
    }
    this.value = value
    return this
  }

  setStyle(style?: CellStyle): this {
    this.style = style
    return this
  }

  clone(): Cell {
    return new Cell(this.value instanceof Date ? new Date(this.value) : this.value, this.style)
  }
}
