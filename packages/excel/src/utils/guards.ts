import type { CellStyle, FormulaValue } from '../types'

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isFormulaValue(value: unknown): value is FormulaValue {
  return (
    isObject(value) &&
    typeof value.formula === 'string' &&
    value.formula.length > 0 &&
    (!('result' in value) ||
      value.result === null ||
      typeof value.result === 'string' ||
      typeof value.result === 'number' ||
      typeof value.result === 'boolean')
  )
}

export function isCellStyle(value: unknown): value is CellStyle {
  return isObject(value)
}

export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
