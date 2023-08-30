import { Graph } from './graph'

interface RectConfig {
  w: number
  h: number
  x?: number
  y?: number
  radius?: number | [number, number, number, number]
  fillStyle?: string
  strokeWidth?: number
  strokeStyle?: string
}

export class Rect implements Graph {
  private rendered = false

  private config: RectConfig

  constructor(conf: RectConfig) {
    this.config = conf
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.rendered) return

    let { x = 0, y = 0, w, h, fillStyle, strokeStyle, strokeWidth } = this.config
    x += 0.5
    y += 0.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + w, y)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.closePath()

    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle
    }
    if (strokeWidth) {
      ctx.lineWidth = strokeWidth
    }

    ctx.stroke()

    if (fillStyle) {
      ctx.fillStyle = fillStyle
      ctx.fill()
    }

    this.rendered = true
  }
}
