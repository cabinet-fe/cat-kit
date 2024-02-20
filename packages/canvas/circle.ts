import type { Color } from './_type-helper'
import { Graph } from './graph'

interface CircleConfig {
  /** 圆心x轴坐标 */
  x: number
  /** 圆心y轴坐标 */
  y: number
  /** 圆的半径 */
  r: number
  /** 填充色 */
  fill?: Color
  /** 边宽 */
  borderWidth?: number
  /** 边颜色 */
  borderColor?: Color
}

export class Circle extends Graph {
  name = 'Circle'

  private config: CircleConfig

  constructor(config: CircleConfig) {
    super()
    this.config = config
  }

  draw(): void {
    const { ctx, config } = this
  }
}
