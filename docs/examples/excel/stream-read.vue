<template>
  <div class="excel-card">
    <p class="excel-card__hint">
      选择 .xlsx 文件，使用
      <code>readWorkbookStream</code> 逐行解析（示例仅读取首个工作表）。
    </p>

    <div class="excel-card__actions">
      <input
        ref="fileInput"
        class="file-input"
        type="file"
        accept=".xlsx"
        @change="handleFile"
      />
      <var-button type="primary" :loading="reading" @click="triggerFile"
        >选择文件</var-button
      >
      <span v-if="summary" class="excel-card__summary">{{ summary }}</span>
    </div>

    <div v-if="rows.length" class="stream-list">
      <div v-for="item in rows" :key="item.id" class="stream-list__item">
        <div class="stream-list__title">
          {{ item.sheet }} · 第 {{ item.row }} 行
        </div>
        <div class="stream-list__cells">{{ item.cells }}</div>
      </div>
    </div>

    <p v-else class="placeholder">暂未读取数据，上传文件后展示前几行预览。</p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { readWorkbookStream } from '@cat-kit/excel'

interface PreviewRow {
  id: string
  sheet: string
  row: number
  cells: string
}

const MAX_PREVIEW = 12

const rows = ref<PreviewRow[]>([])
const summary = ref('')
const reading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerFile() {
  fileInput.value?.click()
}

function formatCells(values: any[]) {
  return values
    .slice(0, 6)
    .map(value => {
      if (value instanceof Date) return value.toISOString().slice(0, 10)
      if (value && typeof value === 'object' && 'type' in value) {
        return value.type === 'formula'
          ? `=${value.formula}`
          : value.error || ''
      }
      return value ?? ''
    })
    .join(' | ')
}

async function handleFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  rows.value = []
  summary.value = ''
  reading.value = true

  try {
    const stream = readWorkbookStream(file, { sheetIndices: [0] })
    const reader = stream.getReader()

    let total = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      total++
      if (rows.value.length < MAX_PREVIEW) {
        rows.value.push({
          id: `${value.sheetIndex}-${value.rowIndex}`,
          sheet: value.sheetName,
          row: value.rowIndex + 1,
          cells: formatCells(value.row.getValues())
        })
      }
    }

    summary.value = `已流式读取 ${total} 行，展示前 ${rows.value.length} 行`
  } catch (error: any) {
    summary.value = error?.message || String(error)
  } finally {
    reading.value = false
    input.value = ''
  }
}
</script>

<style scoped>
.excel-card {
  background: var(--vt-c-bg-soft);
  border: 1px solid var(--vt-c-divider);
  border-radius: 12px;
  padding: 16px;
}

.excel-card__hint {
  margin: 0 0 10px;
  color: var(--vt-c-text-2);
  font-size: 14px;
}

.excel-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.excel-card__summary {
  color: var(--vt-c-text-2);
  font-size: 13px;
}

.file-input {
  display: none;
}

.stream-list {
  display: grid;
  gap: 8px;
}

.stream-list__item {
  padding: 10px 12px;
  border: 1px solid var(--vt-c-divider);
  border-radius: 10px;
  background: var(--vt-c-bg);
}

.stream-list__title {
  font-weight: 600;
  margin-bottom: 6px;
}

.stream-list__cells {
  color: var(--vt-c-text-2);
  font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco,
    Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 13px;
}

.placeholder {
  color: var(--vt-c-text-2);
  font-size: 13px;
}
</style>
