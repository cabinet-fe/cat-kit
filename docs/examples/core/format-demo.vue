<template>
  <div class="demo-box">
    <div class="demo-section">
      <h4>📅 日期格式化演示</h4>
      <p class="demo-desc">选择日期和格式模板，实时查看格式化结果</p>
    </div>

    <div class="demo-controls">
      <div class="control-group">
        <label>选择日期</label>
        <input type="datetime-local" v-model="dateInput" class="demo-input" />
      </div>

      <div class="control-group">
        <label>格式模板</label>
        <select v-model="formatTemplate" class="demo-select">
          <option v-for="fmt in formats" :key="fmt.value" :value="fmt.value">
            {{ fmt.label }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="useUTC" />
          <span>使用 UTC 时间</span>
        </label>
      </div>
    </div>

    <div class="demo-result">
      <div class="result-row">
        <span class="result-label">格式化结果：</span>
        <code class="result-value">{{ formattedResult }}</code>
      </div>
      <div class="result-row code-preview">
        <span class="result-label">代码：</span>
        <code class="result-code">date('{{ dateInput }}').format('{{ formatTemplate }}'{{ useUTC ? ", { utc: true }" : "" }})</code>
      </div>
    </div>

    <div class="demo-formats">
      <h5>常用格式模板</h5>
      <div class="format-chips">
        <button
          v-for="fmt in formats"
          :key="fmt.value"
          :class="['format-chip', { active: formatTemplate === fmt.value }]"
          @click="formatTemplate = fmt.value"
        >
          {{ fmt.value }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { date } from '@cat-kit/core/src'

const dateInput = ref(new Date().toISOString().slice(0, 16))
const formatTemplate = ref('yyyy-MM-dd HH:mm:ss')
const useUTC = ref(false)

const formats = [
  { label: '完整日期时间', value: 'yyyy-MM-dd HH:mm:ss' },
  { label: '日期 (斜杠)', value: 'yyyy/MM/dd' },
  { label: '日期 (中文)', value: 'yyyy年M月d日' },
  { label: '时间 (24小时)', value: 'HH:mm:ss' },
  { label: '时间 (12小时)', value: 'hh:mm:ss' },
  { label: '年月', value: 'yyyy-MM' },
  { label: '月日', value: 'MM-dd' },
]

const formattedResult = computed(() => {
  try {
    const d = date(dateInput.value)
    return d.format(formatTemplate.value, { utc: useUTC.value })
  } catch {
    return '无效日期'
  }
})
</script>

<style scoped>
.demo-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-section h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.demo-desc {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.demo-input,
.demo-select {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  min-width: 200px;
}

.demo-input:focus,
.demo-select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-direction: row !important;
  padding-top: 8px;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  accent-color: var(--vp-c-brand-1);
}

.demo-result {
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.result-label {
  font-size: 13px;
  color: var(--vp-c-text-2);
  min-width: 80px;
}

.result-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 4px 12px;
  border-radius: 4px;
}

.result-code {
  font-size: 13px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}

.demo-formats h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.format-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.format-chip {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  cursor: pointer;
  transition: all 0.2s;
}

.format-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.format-chip.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
</style>
