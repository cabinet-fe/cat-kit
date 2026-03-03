<template>
  <div class="stream-card">
    <div class="stream-card__toolbar">
      <button type="button" class="btn btn-primary" :disabled="reading" @click="pickFile">
        {{ reading ? '解析中...' : '选择 .xlsx 文件' }}
      </button>
      <label class="inline-field">
        <input v-model="includeEmptyRows" type="checkbox" />
        包含空行事件
      </label>
      <label class="inline-field">
        工作表过滤
        <input
          v-model.trim="sheetFilter"
          type="text"
          placeholder="留空表示全部；例如 Sales"
          :disabled="reading"
        />
      </label>
      <input
        ref="fileInput"
        class="file-input"
        type="file"
        accept=".xlsx"
        @change="handleFileChange"
      />
    </div>

    <div class="stream-card__stats">
      <span>工作表: {{ stats.sheetCount }}</span>
      <span>行事件: {{ stats.rowCount }}</span>
      <span>空行: {{ stats.emptyRowCount }}</span>
      <span v-if="message">{{ message }}</span>
    </div>

    <var-table v-if="rows.length" class="stream-table" :scroller-height="320" :elevation="0">
      <thead>
        <tr>
          <th>Sheet</th>
          <th>Row</th>
          <th v-for="column in displayColumns" :key="column">C{{ column }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td>{{ row.sheetName }}</td>
          <td>{{ row.rowIndex }}</td>
          <td
            v-for="column in displayColumns"
            :key="`${row.id}-${column}`"
            class="cell-mono"
          >
            {{ row.values[column - 1] || '' }}
          </td>
        </tr>
      </tbody>
    </var-table>
    <p v-else class="placeholder">上传文件后，这里会用表格展示读取结果（最多 30 行）。</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { readWorkbookStream, type CellValue, type ReadStreamOptions } from '@cat-kit/excel'

interface RowPreview {
  id: string
  sheetName: string
  rowIndex: number
  values: string[]
}

const PREVIEW_LIMIT = 30
const MAX_COLUMNS = 8

const fileInput = ref<HTMLInputElement | null>(null)
const includeEmptyRows = ref(false)
const sheetFilter = ref('')
const reading = ref(false)
const message = ref('')
const rows = ref<RowPreview[]>([])

const stats = reactive({
  sheetCount: 0,
  rowCount: 0,
  emptyRowCount: 0
})

function pickFile() {
  fileInput.value?.click()
}

function resetState() {
  rows.value = []
  message.value = ''
  stats.sheetCount = 0
  stats.rowCount = 0
  stats.emptyRowCount = 0
}

function formatCell(value: CellValue): string {
  if (value === null) return 'null'
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && value && 'formula' in value) {
    return value.result === undefined
      ? `=${value.formula}`
      : `=${value.formula} (result: ${String(value.result)})`
  }
  return String(value)
}

function buildOptions(): ReadStreamOptions {
  const options: ReadStreamOptions = {
    includeEmptyRows: includeEmptyRows.value
  }

  const name = sheetFilter.value.trim()
  if (name) {
    options.sheets = [name]
  }

  return options
}

const displayColumns = computed(() => {
  let max = 1
  for (const row of rows.value) {
    if (row.values.length > max) max = row.values.length
  }
  const limit = Math.min(max, MAX_COLUMNS)
  return Array.from({ length: limit }, (_, index) => index + 1)
})

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  resetState()
  reading.value = true

  try {
    for await (const item of readWorkbookStream(file, buildOptions())) {
      if (item.type === 'sheetStart') {
        stats.sheetCount += 1
        continue
      }

      if (item.type === 'sheetEnd') {
        continue
      }

      stats.rowCount += 1
      if (item.values.length === 0) {
        stats.emptyRowCount += 1
      }

      if (rows.value.length < PREVIEW_LIMIT) {
        rows.value.push({
          id: `${item.sheetIndex}-${item.rowIndex}`,
          sheetName: item.sheetName,
          rowIndex: item.rowIndex,
          values: item.values.slice(0, MAX_COLUMNS).map(formatCell)
        })
      }
    }

    message.value = `解析完成，已预览 ${rows.value.length} 行`
  } catch (error) {
    message.value = error instanceof Error ? error.message : String(error)
  } finally {
    reading.value = false
    input.value = ''
  }
}
</script>

<style scoped>
.stream-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
}

.stream-card__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.inline-field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.inline-field input[type='text'] {
  min-width: 220px;
}

.stream-card input[type='text'] {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 6px 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.file-input {
  display: none;
}

.btn {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  border-color: #16a34a;
  background: #16a34a;
  color: #fff;
}

.stream-card__stats {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.stream-table {
  margin-top: 12px;
}

.cell-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 12px;
  word-break: break-word;
}

.placeholder {
  margin-top: 12px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
