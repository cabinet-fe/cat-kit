<template>
  <canvas ref="canvasRef" />
</template>

<script lang="ts" setup>
import { Stage, Rect } from '@cat-kit/canvas'
import { onMounted, shallowRef } from 'vue'

const canvasRef = shallowRef<HTMLElement>()

const rect1 = new Rect({
  w: 100,
  h: 100,
  x: 0,
  y: 0,
  radius: 8,
  borderWidth: 8,
  borderColor: '#ccc',
  fill: '#f00',
})

const rect2 = new Rect({
  w: 150,
  h: 100,
  x: 120,
  y: 0,
  radius: [50, 0, 0, 50],
  borderColor: 'blue',
  borderWidth: 3,
  fill: 'green'
})

const stage = new Stage({
  height: 100,
  width: 600,
  graphs: [rect1, rect2]
})

onMounted(() => {
  canvasRef.value && stage.mount(canvasRef.value)
})
</script>
