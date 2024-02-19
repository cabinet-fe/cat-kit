import { Graph } from './graph'

interface LineConfig {
  x1: number
  y1: number
  x2: number
  y2: number
  lineWidth?: number
  strokeStyle?: string
}

export class Line extends Graph {
  name = 'Line'

  private config: LineConfig

  constructor(config: LineConfig) {
    super()
    this.config = config
  }

  protected draw(): void {
    const { ctx } = this
    const { x1, y1, x2, y2, lineWidth = 1, strokeStyle } = this.config
    ctx.beginPath()

    ctx.lineWidth = lineWidth
    ctx.moveTo(x1 + 0.5, y1 + 0.5)
    ctx.lineTo(x2 + 0.5, y2 + 0.5)

    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle
      ctx.stroke()
    }
  }
}
