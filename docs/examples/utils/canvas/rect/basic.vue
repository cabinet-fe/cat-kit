<template>
  <canvas ref="canvasRef" />
</template>

<script lang="ts" setup>
import { Stage, Rect } from '@cat-kit/canvas'
import { onMounted, shallowRef } from 'vue'

const canvasRef = shallowRef<HTMLElement>()

const rect = new Rect({
  w: 100,
  h: 100,
  x: 0,
  y: 0,
  borderColor: 'rgb(255, 0, 0)',
  borderWidth: 40
})

const stage = new Stage({
  height: 100,
  width: 600,
  graphs: [rect]
})

onMounted(() => {
  canvasRef.value && stage.mount(canvasRef.value)
})
</script>
