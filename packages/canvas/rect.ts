import type { Color } from './_type-helper'
import { Graph } from './graph'

interface RectConfig {
  /** 矩形宽度 */
  w: number
  /** 矩形高度 */
  h: number
  /** 矩形在画布中的x轴偏移量 */
  x?: number
  /** 矩形在画布中的y轴偏移量 */
  y?: number
  /** 圆角, 可以是单个值，也可以是四个值，分别对应左上，右上，右下，左下 */
  radius?: number | [number, number, number, number]
  /** 填充 */
  fill?: Color
  /** 边宽度 */
  borderWidth?: number
  /** 边颜色 */
  borderColor?: Color
}

export class Rect extends Graph {
  private config: RectConfig

  readonly name = 'Rect'

  constructor(conf: RectConfig) {
    super()
    this.config = conf
  }

  draw(): void {
    const { config, ctx } = this

    let { x = 0, y = 0, w, h, radius, borderWidth, borderColor, fill } = config

    if (borderColor) {
      if (borderWidth === undefined) {
        borderWidth = 1
      }
      const startOffset = borderWidth / 2
      x += startOffset
      y += startOffset
    } else {
      borderWidth = 0
    }

    ctx.beginPath()

    // 先填充再描边
    if (fill) {
      ctx.fillStyle = fill
    }
    if (borderColor) {
      ctx.lineWidth = borderWidth
      ctx.strokeStyle = borderColor
    }

    this.beforeDraw()

    // 矩形右边和底边的偏移量应该减去边宽度
    const rightX = x + w - borderWidth
    const bottomY = y + h - borderWidth

    // 使用简易API
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w - borderWidth, h - borderWidth, radius)
    } else {
      if (radius === undefined) {
        ctx.rect(x, y, w - borderWidth, h - borderWidth)
      } else if (typeof radius === 'number') {
        ctx.moveTo(x + radius, y)

        ctx.arcTo(rightX, y, rightX, bottomY, radius)
        ctx.arcTo(rightX, bottomY, x, bottomY, radius)
        ctx.arcTo(x, bottomY, x, y, radius)
        ctx.arcTo(x, y, rightX, y, radius)
      } else {
        ctx.moveTo(x + radius[0], y)

        ctx.arcTo(rightX, y, rightX, bottomY, radius[1])
        ctx.arcTo(rightX, bottomY, x, bottomY, radius[2])
        ctx.arcTo(x, bottomY, x, y, radius[3])
        ctx.arcTo(x, y, rightX, y, radius[0])
      }
    }

    // 先填充再描边
    fill && ctx.fill()
    borderColor && borderWidth && ctx.stroke()
  }
}
