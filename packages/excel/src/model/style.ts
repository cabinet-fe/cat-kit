import type {
  CellAlignmentStyle,
  CellBorderEdgeStyle,
  CellBorderStyle,
  CellFillStyle,
  CellFontStyle,
  CellProtectionStyle,
  CellStyle
} from '../types'

interface FontModel {
  name?: string
  size?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  color?: string
}

interface FillModel {
  type: 'none' | 'solid'
  color?: string
}

interface BorderEdgeModel {
  style?: CellBorderEdgeStyle['style']
  color?: string
}

interface BorderModel {
  left: BorderEdgeModel
  right: BorderEdgeModel
  top: BorderEdgeModel
  bottom: BorderEdgeModel
  diagonal: BorderEdgeModel
}

interface CellXfModel {
  fontId: number
  fillId: number
  borderId: number
  numFmtId: number
  alignment?: CellAlignmentStyle
  protection?: CellProtectionStyle
}

export interface StyleSnapshot {
  fonts: FontModel[]
  fills: FillModel[]
  borders: BorderModel[]
  numFmts: Array<{ id: number; code: string }>
  xfs: CellXfModel[]
}

function stableStringify(value: unknown): string {
  if (value == null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(item => stableStringify(item)).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`
}

function normalizeColor(color: string | undefined): string | undefined {
  if (!color) return undefined
  const normalized = color.trim().replace(/^#/, '').toUpperCase()
  if (normalized.length === 6) return `FF${normalized}`
  if (normalized.length === 8) return normalized
  return undefined
}

function normalizeFont(font: CellFontStyle | undefined): FontModel {
  return {
    name: font?.name,
    size: font?.size,
    bold: font?.bold,
    italic: font?.italic,
    underline: font?.underline,
    strike: font?.strike,
    color: normalizeColor(font?.color)
  }
}

function normalizeFill(fill: CellFillStyle | undefined): FillModel {
  return {
    type: fill?.type ?? 'none',
    color: normalizeColor(fill?.color)
  }
}

function normalizeBorderEdge(edge: CellBorderEdgeStyle | undefined): BorderEdgeModel {
  return {
    style: edge?.style,
    color: normalizeColor(edge?.color)
  }
}

function normalizeBorder(border: CellBorderStyle | undefined): BorderModel {
  return {
    left: normalizeBorderEdge(border?.left),
    right: normalizeBorderEdge(border?.right),
    top: normalizeBorderEdge(border?.top),
    bottom: normalizeBorderEdge(border?.bottom),
    diagonal: normalizeBorderEdge(border?.diagonal)
  }
}

function normalizeStyle(style: CellStyle | undefined): Required<CellStyle> {
  return {
    font: normalizeFont(style?.font),
    fill: normalizeFill(style?.fill),
    border: normalizeBorder(style?.border),
    alignment: {
      horizontal: style?.alignment?.horizontal,
      vertical: style?.alignment?.vertical,
      wrapText: style?.alignment?.wrapText,
      textRotation: style?.alignment?.textRotation,
      indent: style?.alignment?.indent
    },
    numberFormat: style?.numberFormat ?? '',
    protection: {
      locked: style?.protection?.locked,
      hidden: style?.protection?.hidden
    }
  }
}

function toCellStyle(
  xf: CellXfModel,
  snapshot: StyleSnapshot
): CellStyle {
  const font = snapshot.fonts[xf.fontId]
  const fill = snapshot.fills[xf.fillId]
  const border = snapshot.borders[xf.borderId]
  const numFmt = snapshot.numFmts.find(item => item.id === xf.numFmtId)

  const style: CellStyle = {}
  if (font && Object.values(font).some(Boolean)) {
    style.font = {
      ...font,
      color: font.color ? `#${font.color.slice(-6)}` : undefined
    }
  }
  if (fill && (fill.type !== 'none' || fill.color)) {
    style.fill = {
      type: fill.type,
      color: fill.color ? `#${fill.color.slice(-6)}` : undefined
    }
  }
  if (border && Object.values(border).some(edge => Object.values(edge).some(Boolean))) {
    style.border = {
      left: border.left,
      right: border.right,
      top: border.top,
      bottom: border.bottom,
      diagonal: border.diagonal
    }
  }
  if (numFmt?.code) {
    style.numberFormat = numFmt.code
  }
  if (xf.alignment && Object.values(xf.alignment).some(v => v !== undefined)) {
    style.alignment = { ...xf.alignment }
  }
  if (xf.protection && Object.values(xf.protection).some(v => v !== undefined)) {
    style.protection = { ...xf.protection }
  }
  return style
}

export class StylePool {
  private readonly fontKeyToId = new Map<string, number>()
  private readonly fillKeyToId = new Map<string, number>()
  private readonly borderKeyToId = new Map<string, number>()
  private readonly numFmtToId = new Map<string, number>()
  private readonly xfKeyToId = new Map<string, number>()

  private readonly fonts: FontModel[] = []
  private readonly fills: FillModel[] = []
  private readonly borders: BorderModel[] = []
  private readonly numFmts: Array<{ id: number; code: string }> = []
  private readonly xfs: CellXfModel[] = []
  private nextNumFmtId = 164

  constructor() {
    this.registerDefaultStyles()
  }

  register(style?: CellStyle): number {
    if (!style) return 0
    const normalized = normalizeStyle(style)
    const fontId = this.intern(this.fonts, this.fontKeyToId, normalized.font)
    const fillId = this.intern(this.fills, this.fillKeyToId, normalized.fill)
    const borderId = this.intern(this.borders, this.borderKeyToId, normalized.border)
    const numFmtId = this.internNumberFormat(normalized.numberFormat)

    const xf: CellXfModel = {
      fontId,
      fillId,
      borderId,
      numFmtId,
      alignment: normalized.alignment,
      protection: normalized.protection
    }
    return this.intern(this.xfs, this.xfKeyToId, xf)
  }

  snapshot(): StyleSnapshot {
    return {
      fonts: [...this.fonts],
      fills: [...this.fills],
      borders: [...this.borders],
      numFmts: [...this.numFmts],
      xfs: [...this.xfs]
    }
  }

  styleById(styleId: number): CellStyle | undefined {
    const xf = this.xfs[styleId]
    if (!xf) return undefined
    return toCellStyle(xf, this.snapshot())
  }

  private registerDefaultStyles(): void {
    this.intern(this.fonts, this.fontKeyToId, {})
    this.intern(this.fills, this.fillKeyToId, { type: 'none' })
    // Excel 规范要求第二个 fill 为 gray125，保证兼容性。
    this.intern(this.fills, this.fillKeyToId, { type: 'solid', color: 'FFBFBFBF' })
    this.intern(
      this.borders,
      this.borderKeyToId,
      { left: {}, right: {}, top: {}, bottom: {}, diagonal: {} }
    )
    this.intern(
      this.xfs,
      this.xfKeyToId,
      { fontId: 0, fillId: 0, borderId: 0, numFmtId: 0 }
    )
  }

  private intern<T>(
    list: T[],
    keyMap: Map<string, number>,
    value: T
  ): number {
    const key = stableStringify(value)
    const existing = keyMap.get(key)
    if (existing != null) return existing
    const index = list.length
    list.push(value)
    keyMap.set(key, index)
    return index
  }

  private internNumberFormat(code: string): number {
    if (!code) return 0
    const existing = this.numFmtToId.get(code)
    if (existing != null) return existing
    const id = this.nextNumFmtId
    this.nextNumFmtId += 1
    this.numFmtToId.set(code, id)
    this.numFmts.push({ id, code })
    return id
  }
}
