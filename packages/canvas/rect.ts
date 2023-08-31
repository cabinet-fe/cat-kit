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
    const { config } = this
    let { x = 0, y = 0, w, h, radius = 0 } = config
    x += (config.strokeWidth ?? 0) / 2
    y += (config.strokeWidth ?? 0) / 2

    ctx.beginPath()

    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + w, y, x + w, y + h, radius)
    ctx.arcTo(x + w, y + h, x, y + h, radius)
    ctx.arcTo(x, y + h, x, y, radius)
    ctx.arcTo(x, y, x + w, y, radius)

    if (config.strokeStyle) {
      ctx.strokeStyle = config.strokeStyle
    }

    ctx.lineWidth = 10
    ctx.closePath()
    ctx.stroke()

    this.rendered = true
  }
}
