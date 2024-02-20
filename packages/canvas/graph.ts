import type { Stage } from './stage'

export abstract class Graph {
  /** canvas上下文 */
  protected ctx!: CanvasRenderingContext2D

  /** 舞台 */
  protected stage!: Stage

  /** 图形名称 */
  abstract readonly name: string

  /**
   * 绘制方法
   */
  abstract draw(): void

  /**
   * 用于在绘制前改变画笔的属性等，通常用于继承一个现有的图形时重写该方法
   * @example
   * ```ts
   * class MyRect extends Rect {
   *   beforeDraw() {
   *     const { ctx } = this
   *     ctx.lineCap = 'square'
   *   }
   * }
   * ```
   */
  beforeDraw(): void {}

  /**
   * 绑定舞台
   * @param stage 舞台对象
   */
  bind(stage: Stage): Graph {
    if (this.stage) {
      console.warn(`${this.name}已经绑定了舞台对象，无需重复绑定`)
      return this
    }

    this.stage = stage
    this.ctx = stage.ctx!

    return this
  }

  on(type: 'drag'): void
  on(type: 'click'): void
  on(type: string) {}
}
