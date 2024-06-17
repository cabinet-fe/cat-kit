<template>
  <input type="file" @change="handleChange" />
  <div>
    <div>文件处理</div>
    <div>进度： {{ progress }}</div>
    <div>md5: {{ md5 }}</div>
    <div>用时: {{ used }}</div>
  </div>
</template>

<script lang="ts" setup>
import { getFileMD5 } from '@cat-kit/fe'
import { shallowRef } from 'vue'

const md5 = shallowRef('')
const used = shallowRef()
const progress = shallowRef()

async function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  let start = Date.now()

  md5.value = await getFileMD5(file, {
    onProgress(p) {
      progress.value = p
    }
  })
  used.value = Date.now() - start
  target.value = ''
}
</script>
