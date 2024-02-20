import type { Graph } from './graph'

export interface StageConfig {
  /** 舞台宽度 */
  width: number
  /** 舞台高度 */
  height: number
  /** 图形 */
  graphs?: Graph[]
}

export class Stage {
  private config: Omit<StageConfig, 'graphs'>

  private rendered = false

  graphs: Graph[] = []

  ctx: CanvasRenderingContext2D | null = null

  /** 挂载时执行的任务 */
  private tasksWhenMounted: Array<(state: Stage) => void> = []

  constructor(conf: StageConfig) {
    const { graphs, ...restConfig } = conf
    this.config = restConfig

    if (graphs) {
      this.tasksWhenMounted.push((stage: Stage) => {
        graphs.forEach(graph => graph.bind(stage))
      })

      this.graphs = graphs
    }
  }

  /** 渲染舞台 */
  render() {
    const { ctx, config } = this
    if (!ctx) return
    this.rendered && ctx.clearRect(0, 0, config.width, config.height)
    this.graphs.forEach(graph => graph.draw())
    this.rendered = true
  }

  /**
   * 添加图形
   * @param graph 图形
   */
  append(graph: Graph) {
    this.ctx && graph.bind(this)
    this.graphs.push(graph)
  }

  /**
   * 挂载画布
   * @param el 容器地址，如果它是一个画布元素则直接使用它作为2d上下文，否则创建一个新的
   */
  mount(el: HTMLElement | string) {
    const { width, height } = this.config

    if (typeof el === 'string') {
      const element = document.querySelector<HTMLElement>(el)
      if (!element) {
        console.error(`元素${el}不存在, 画布将自动挂载到body元素下`)
        el = document.body
      } else {
        el = element
      }
    }

    if (!(el instanceof HTMLCanvasElement)) {
      const canvas = document.createElement('canvas')
      canvas.width = width || el.offsetWidth
      canvas.height = height || el.offsetHeight
      el.appendChild(canvas)
      this.ctx = canvas.getContext('2d')!
    } else {
      if (width) {
        el.width = width
      }
      if (height) {
        el.height = height
      }

      this.ctx = el.getContext('2d')!
    }

    // 执行任务队列
    while (this.tasksWhenMounted.length) {
      this.tasksWhenMounted.shift()!(this)
    }

    this.render()
  }
}
