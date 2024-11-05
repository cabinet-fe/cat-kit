<template>
  <input type="file" @change="handleChange" />
</template>

<script lang="ts" setup>
import { compressImageFile } from '@cat-kit/fe'

function handleChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    compressImageFile(file, 2 * 1024 * 1024).then(file => {
      const url = URL.createObjectURL(file)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
    })
  }
}
</script>
