import type { Color } from './_type-helper'
import { Graph } from './graph'

interface LineConfig {
  /** 起始点坐标 */
  start: [number, number]
  /** 结束点坐标 */
  end: [number, number]
  /** 线宽 */
  width?: number
  /** 线的颜色 */
  color?: Color
}

export class Line extends Graph {
  name = 'Line'

  private config: LineConfig

  constructor(config: LineConfig) {
    super()
    this.config = config
  }

  draw(): void {
    const { ctx } = this
    const { start, end, width = 1, color } = this.config

    ctx.beginPath()

    ctx.lineWidth = width
    if (color) {
      ctx.strokeStyle = color
    }

    this.beforeDraw()

    let _start: [number, number] = [...start],
      _end: [number, number] = [...end]

    // 基数线优化
    if (width % 2 === 1) {
      _start[0] += 0.5
      _start[1] += 0.5
      _end[0] += 0.5
      _end[1] += 0.5
    }

    ctx.moveTo(..._start)
    ctx.lineTo(..._end)

    color && ctx.stroke()
  }
}
