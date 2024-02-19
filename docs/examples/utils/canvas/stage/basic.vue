<template>
  <button @click="table.scale(x => ({ x: x - 0.1 <= 0.1 ? 0.1 : x - 0.1 }))">
    缩小
  </button>
  <button @click="table.scale(x => ({ x: x + 0.1 }))">放大</button>
  <canvas ref="canvasRef" />
</template>

<script lang="ts" setup>
import { Stage, Line, Graph } from '@cat-kit/canvas'
import { onMounted, shallowRef } from 'vue'

const canvasRef = shallowRef<HTMLElement>()

interface TableConfig {
  rows: number
  cols: number
  colWidth?: number
  rowHeight?: number
}
class Table extends Graph {
  name = 'Table'

  config: Required<TableConfig>

  scaleX = 1

  scaleY = 1

  constructor(config: TableConfig) {
    super()
    this.config = {
      rowHeight: 30,
      colWidth: 100,
      ...config
    }
  }

  protected draw(): void {
    const { ctx, scaleX, scaleY } = this
    const { rows, cols, rowHeight, colWidth } = this.config

    // 绘制横线
    for (let i = 0; i <= rows; i++) {
      const y = rowHeight * i * scaleY
      if (rows === i) {
        console.log(colWidth * cols * scaleX)
      }
      const line = new Line({
        x1: 0,
        y1: y,
        x2: Math.round(colWidth * cols * scaleX),
        y2: y ,
        strokeStyle: '#ccc'
      })
      line.bind(ctx)
      line.render()
    }

    // 绘制竖线
    for (let i = 0; i <= cols; i++) {
      const x = colWidth * i * scaleX
      const line = new Line({
        x1: x,
        y1: 0,
        x2: x,
        y2: rowHeight * rows * scaleY,
        strokeStyle: '#ccc'
      })
      line.bind(ctx)
      line.render()
    }
  }

  scale(op: (x: number, y: number) => { x?: number; y?: number }) {
    const { config, scaleX, scaleY } = this
    const { x, y } = op(scaleX, scaleY)
    this.scaleX = x ?? 1
    this.scaleY = y ?? 1

    this.ctx.clearRect(
      0,
      0,
      600,
      300
    )
    this.draw()
  }
}

const table = new Table({
  rows: 5,
  cols: 20
})

const stage = new Stage({
  height: 300,
  width: 600,
  graphs: [table]
})

onMounted(() => {
  canvasRef.value && stage.mount(canvasRef.value)
})
</script>
