import type { Color } from './_type-helper'
import { Graph } from './graph'

interface CircleConfig {
  /** 圆心x轴坐标 */
  x: number
  /** 圆心y轴坐标 */
  y: number
  /** 圆的半径, 你也可以传入一个2个长度的元组表示椭圆 */
  r: number | [number, number]
  /** 圆环内环半径，如果大小比r大则会被忽略 */
  innerRadius?: number
  /** 旋转角度 */
  rotation?: number
  /** 填充色 */
  fill?: Color
  /** 开始角度, 默认为0 */
  startAngle?: number
  /** 结束角度， 默认为360 */
  endAngle?: number
}

export class Circle extends Graph {
  name = 'Circle'

  protected readonly config: Readonly<CircleConfig>

  constructor(config: CircleConfig) {
    super()
    this.config = config
  }

  draw(): void {
    const { ctx, config } = this
    let {
      x,
      y,
      r,
      innerRadius,
      startAngle = 0,
      endAngle = 360,
      fill,
      rotation = 0
    } = config
    ctx.beginPath()

    if (fill) {
      ctx.fillStyle = fill
    }

    // 角度转弧度
    // 开始弧度
    const startRadian = (startAngle * Math.PI) / 180
    // 结束弧度
    const endRadian = (endAngle * Math.PI) / 180

    if (typeof r === 'number') {
      // 绘制圆环
      if (innerRadius && innerRadius > 0 && innerRadius < r) {
        // 外弧
        ctx.arc(x, y, r, startRadian, endRadian)
        // 内弧
        ctx.arc(x, y, innerRadius, endRadian, startRadian, true)
        ctx.closePath()
      } else {
        ctx.moveTo(x, y)
        ctx.lineTo(x + r * Math.cos(startRadian), y + r * Math.sin(startRadian))
        ctx.arc(x, y, r, startRadian, endRadian)
        ctx.lineTo(x, y)
      }
    } else {
      const [rx, ry] = r

      ctx.ellipse(
        x,
        y,
        rx,
        ry,
        (rotation * Math.PI) / 180,
        startRadian,
        endRadian
      )
    }

    fill && ctx.fill()
  }
}
