export abstract class Graph {
  protected ctx!: CanvasRenderingContext2D

  /** 是否已渲染，防止重新绘制 */
  private rendered = false

  /** 图形名称 */
  abstract readonly name: string

  /**
   * 绘制方法，子类必须实现该方法
   */
  protected abstract draw(): void

  /**
   * 绑定2d上下文
   * @param ctx 2d上下文
   */
  bind(ctx: CanvasRenderingContext2D): Graph {
    if (this.ctx) {
      console.warn(`${this.name}已经绑定了ctx，无需重复绑定`)
      return this
    }
    this.ctx = ctx

    return this
  }

  /**
   * 渲染
   */
  render(): void {
    if (this.rendered) return

    this.draw()

    this.rendered = true
  }
}
