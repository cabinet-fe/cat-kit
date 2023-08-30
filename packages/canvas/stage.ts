import type { Graph } from './graph'

interface StageConfig {
  width?: number
  height?: number
}

export class Stage {
  config: StageConfig = {}

  graphs: Graph[] = []

  ctx!: CanvasRenderingContext2D

  constructor(conf: StageConfig) {
    this.config = conf
  }

  private render() {
    let i = 0
    while (i < this.graphs.length) {
      this.graphs[i]!.render(this.ctx)
      i++
    }
  }

  append(graph: Graph) {
    this.graphs.push(graph)
  }

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

    this.render()
  }
}
