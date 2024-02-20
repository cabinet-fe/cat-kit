<template>
  <canvas ref="canvasRef" />
</template>

<script lang="ts" setup>
import { Stage, Rect, Line } from '@cat-kit/canvas'
import { onMounted, shallowRef } from 'vue'

const canvasRef = shallowRef<HTMLElement>()

const line1 = new Line({
  start: [10, 15],
  end: [200, 15],
  color: '#f00',
  width: 30
})

const line2 = new Line({
  start: [100, 20],
  end: [100, 80],
  width: 11,
  color: '#f00'
})
const line3 = new Line({
  start: [240, 20],
  end: [300, 80],
  width: 10,
  color: '#f00'
})

const stage = new Stage({
  height: 100,
  width: 600,
  graphs: [line1, line2, line3]
})

onMounted(() => {
  canvasRef.value && stage.mount(canvasRef.value)
})
</script>

<style lang="scss" scoped></style>
