<template>
  <canvas ref="canvasRef" />
</template>

<script lang="ts" setup>
import { Stage, Rect } from '@cat-kit/canvas'
import { onMounted, shallowRef } from 'vue'

const canvasRef = shallowRef<HTMLElement>()
const stage = new Stage({
  height: 300,
  width: 600
})

const rect = new Rect({
  w: 100,
  h: 100,
  x: 0,
  y: 0,
  radius: 10,
  strokeWidth: 10,
  fillStyle: '#ccc',
  strokeStyle: '#f00'
})

stage.append(rect)

onMounted(() => {
  canvasRef.value && stage.mount(canvasRef.value)
})
</script>
