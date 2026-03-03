<template>
  <div class="tools-card">
    <div class="tools-grid">
      <section class="panel">
        <h4>列号转换</h4>
        <label>
          列名
          <input v-model.trim="columnLabel" placeholder="例如 AA" />
        </label>
        <div class="result" :class="columnLabelResult.ok ? 'ok' : 'error'">
          {{ columnLabelResult.ok ? `索引: ${columnLabelResult.value}` : columnLabelResult.error }}
        </div>

        <label>
          列索引
          <input v-model.number="columnIndex" type="number" min="1" max="16384" />
        </label>
        <div class="result" :class="columnIndexResult.ok ? 'ok' : 'error'">
          {{ columnIndexResult.ok ? `列名: ${columnIndexResult.value}` : columnIndexResult.error }}
        </div>
      </section>

      <section class="panel">
        <h4>A1 地址转换</h4>
        <label>
          单元格地址
          <input v-model.trim="addressText" placeholder="例如 C12" />
        </label>
        <div class="result" :class="addressResult.ok ? 'ok' : 'error'">
          {{
            addressResult.ok
              ? `row=${addressResult.value.row}, col=${addressResult.value.col}`
              : addressResult.error
          }}
        </div>

        <div class="inline-inputs">
          <label>
            row
            <input v-model.number="rowIndex" type="number" min="1" max="1048576" />
          </label>
          <label>
            col
            <input v-model.number="colIndex" type="number" min="1" max="16384" />
          </label>
        </div>
        <div class="result" :class="formatResult.ok ? 'ok' : 'error'">
          {{ formatResult.ok ? `地址: ${formatResult.value}` : formatResult.error }}
        </div>
      </section>

      <section class="panel panel-wide">
        <h4>日期序列号转换</h4>
        <div class="inline-inputs">
          <label>
            日期时间
            <input v-model="dateInput" type="datetime-local" />
          </label>
          <label>
            dateSystem
            <select v-model.number="dateSystem">
              <option :value="1900">1900</option>
              <option :value="1904">1904</option>
            </select>
          </label>
        </div>

        <div class="result" :class="serialResult.ok ? 'ok' : 'error'">
          {{ serialResult.ok ? `序列号: ${serialResult.value}` : serialResult.error }}
        </div>

        <label>
          反向测试序列号
          <input v-model.number="serialInput" type="number" step="0.001" />
        </label>
        <div class="result" :class="dateResult.ok ? 'ok' : 'error'">
          {{ dateResult.ok ? `ISO: ${dateResult.value}` : dateResult.error }}
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import {
  columnToIndex,
  indexToColumn,
  parseCellAddress,
  formatCellAddress,
  dateToExcelSerial,
  excelSerialToDate,
  type DateSystem
} from '@cat-kit/excel'

type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

const columnLabel = ref('AA')
const columnIndex = ref(27)
const addressText = ref('C12')
const rowIndex = ref(12)
const colIndex = ref(3)

const now = new Date()
const defaultDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
const dateInput = ref(defaultDate.toISOString().slice(0, 16))
const dateSystem = ref<DateSystem>(1900)
const serialInput = ref(45000)

function capture<T>(fn: () => T): Result<T> {
  try {
    return { ok: true, value: fn() }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

const columnLabelResult = computed(() => capture(() => columnToIndex(columnLabel.value)))
const columnIndexResult = computed(() => capture(() => indexToColumn(columnIndex.value)))
const addressResult = computed(() => capture(() => parseCellAddress(addressText.value)))
const formatResult = computed(() => capture(() => formatCellAddress(rowIndex.value, colIndex.value)))

const serialResult = computed(() =>
  capture(() => {
    const date = new Date(dateInput.value)
    return dateToExcelSerial(date, dateSystem.value).toFixed(6)
  })
)

const dateResult = computed(() =>
  capture(() => excelSerialToDate(serialInput.value, dateSystem.value).toISOString())
)
</script>

<style scoped>
.tools-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
}

.tools-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.panel {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 12px;
  background: var(--vp-c-bg);
  display: grid;
  gap: 8px;
}

.panel-wide {
  grid-column: 1 / -1;
}

.panel h4 {
  margin: 0;
  font-size: 14px;
}

.panel label {
  display: grid;
  gap: 4px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.panel input,
.panel select {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 6px 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.inline-inputs {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.result {
  border-radius: 8px;
  padding: 8px;
  font-size: 12px;
  word-break: break-word;
}

.result.ok {
  background: #e8f5e9;
  color: #1b5e20;
}

.result.error {
  background: #ffebee;
  color: #b71c1c;
}
</style>
