<template>
  <canvas ref="canvasRef" />
</template>

<script lang="ts" setup>
import { Stage, Circle } from '@cat-kit/canvas'
import { onMounted, shallowRef } from 'vue'

const canvasRef = shallowRef<HTMLElement>()

const circle = new Circle({
  x: 50,
  y: 50,
  r: 25,
  startAngle: 90,
  endAngle: 360,
  fill: '#4dcb71'
})

const stage = new Stage({
  height: 100,
  width: 600,
  graphs: [circle]
})

onMounted(() => {
  canvasRef.value && stage.mount(canvasRef.value)
})
</script>
