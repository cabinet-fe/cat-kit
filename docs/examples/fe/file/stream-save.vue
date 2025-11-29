<template>
  <div class="stream-demo">
    <p class="desc">生成 5KB 文本并通过 WritableStream 触发下载。</p>
    <div class="bar">
      <div class="fill" :style="{ width: progress + '%' }" />
    </div>
    <div class="meta">
      <span>进度：{{ progress }}%</span>
      <span class="status">{{ status }}</span>
    </div>
    <var-button
      block
      type="primary"
      :loading="loading"
      @click="handleSave"
    >
      开始流式保存
    </var-button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { createWritableStream } from '@cat-kit/fe'

const progress = ref(0)
const status = ref('')
const loading = ref(false)

const chunk = new TextEncoder().encode('Cat-Kit Stream Save Demo\n')
const loops = 20
const totalSize = chunk.byteLength * loops

const handleSave = async () => {
  loading.value = true
  status.value = '写入中...'
  progress.value = 0

  const stream = createWritableStream({
    filename: 'cat-kit-stream-demo.txt',
    size: totalSize,
    onProgress: bytes => {
      progress.value = Math.min(100, Math.round((bytes / totalSize) * 100))
    }
  })

  const writer = stream.getWriter()
  for (let i = 0; i < loops; i++) {
    await writer.write(chunk)
  }
  await writer.close()

  status.value = '浏览器已触发下载'
  loading.value = false
}
</script>

<style scoped>
.stream-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: linear-gradient(120deg, #f5f7ff, #eef2ff);
}

.desc {
  margin: 0;
  color: #1f2d3d;
  font-weight: 600;
}

.bar {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #dfe3f0;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #5f67ee, #7c8bff);
  transition: width 0.2s ease;
}

.meta {
  display: flex;
  justify-content: space-between;
  color: #4a5568;
  font-size: 13px;
}

.status {
  color: #2f855a;
}
</style>
