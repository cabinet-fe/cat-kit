import { ExcelValueError } from './errors'
import type { DateSystem } from './types'

const MS_PER_DAY = 86400000
const EXCEL_1900_EPOCH = Date.UTC(1899, 11, 31)
const EXCEL_1904_EPOCH = Date.UTC(1904, 0, 1)

function assertDate(value: Date): void {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new ExcelValueError('Invalid Date instance', 'INVALID_DATE')
  }
}

function assertSerial(value: number): void {
  if (!Number.isFinite(value)) {
    throw new ExcelValueError('Excel serial must be finite', 'INVALID_SERIAL')
  }
}

export function excelSerialToDate(serial: number, dateSystem: DateSystem = 1900): Date {
  assertSerial(serial)
  const whole = Math.trunc(serial)
  const fraction = serial - whole

  if (dateSystem === 1900) {
    // Excel 错误地将 1900 当作闰年，导致 serial >= 60 需要减一天。
    const adjustedWhole = whole >= 60 ? whole - 1 : whole
    const millis = EXCEL_1900_EPOCH + adjustedWhole * MS_PER_DAY + fraction * MS_PER_DAY
    return new Date(millis)
  }

  return new Date(EXCEL_1904_EPOCH + whole * MS_PER_DAY + fraction * MS_PER_DAY)
}

export function dateToExcelSerial(date: Date, dateSystem: DateSystem = 1900): number {
  assertDate(date)
  const time = date.getTime()

  if (dateSystem === 1900) {
    const days = (time - EXCEL_1900_EPOCH) / MS_PER_DAY
    return days >= 60 ? days + 1 : days
  }

  return (time - EXCEL_1904_EPOCH) / MS_PER_DAY
}
