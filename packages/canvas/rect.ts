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
  /** 填充色 */
  fillStyle?: string
  /** 边宽度 */
  strokeWidth?: number
  /** 边颜色 */
  strokeStyle?: string
}

export class Rect extends Graph {
  private config: RectConfig

  readonly name = 'Rect'

  constructor(conf: RectConfig) {
    super()
    this.config = conf
  }

  protected draw(): void {
    const { config, ctx } = this
    let { x = 0, y = 0, w, h, radius = 0 } = config
    x += (config.strokeWidth ?? 0) / 2
    y += (config.strokeWidth ?? 0) / 2

    ctx.beginPath()

    if (typeof radius === 'number') {
      ctx.moveTo(x + radius, y)
      ctx.arcTo(x + w, y, x + w, y + h, radius)
      ctx.arcTo(x + w, y + h, x, y + h, radius)
      ctx.arcTo(x, y + h, x, y, radius)
      ctx.arcTo(x, y, x + w, y, radius)
    } else {
      ctx.moveTo(x + radius[0], y)
      ctx.arcTo(x + w, y, x + w, y + h, radius[1])
      ctx.arcTo(x + w, y + h, x, y + h, radius[2])
      ctx.arcTo(x, y + h, x, y, radius[3])
      ctx.arcTo(x, y, x + w, y, radius[0])
    }

    ctx.lineWidth = config.strokeWidth ?? 0
    if (config.fillStyle) {
      ctx.fillStyle = config.fillStyle
      ctx.fill()
    }
    if (config.strokeStyle) {
      ctx.strokeStyle = config.strokeStyle
      ctx.stroke()
    }
    ctx.closePath()
  }
}
