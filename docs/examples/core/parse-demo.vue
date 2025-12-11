<template>
  <div class="demo-box">
    <div class="demo-section">
      <h4>🔍 日期解析演示</h4>
      <p class="demo-desc">输入日期字符串和格式模板，查看 Dater.parse() 的解析结果</p>
    </div>

    <div class="demo-controls">
      <div class="control-group">
        <label>日期字符串</label>
        <input type="text" v-model="dateString" class="demo-input wide" placeholder="例如: 2024-03-15 14:30:00" />
      </div>

      <div class="control-group">
        <label>格式模板</label>
        <input type="text" v-model="formatTemplate" class="demo-input wide" placeholder="例如: yyyy-MM-dd HH:mm:ss" />
      </div>

      <div class="control-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="useUTC" />
          <span>按 UTC 解析</span>
        </label>
      </div>
    </div>

    <div class="preset-section">
      <h5>示例预设</h5>
      <div class="preset-chips">
        <button
          v-for="preset in presets"
          :key="preset.label"
          class="preset-chip"
          @click="applyPreset(preset)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <div :class="['demo-result', { error: !isValid }]">
      <div v-if="isValid" class="parse-success">
        <h5>✅ 解析成功</h5>
        <div class="parsed-grid">
          <div class="parsed-item">
            <span class="parsed-label">年份</span>
            <code class="parsed-value">{{ parsedDate?.year }}</code>
          </div>
          <div class="parsed-item">
            <span class="parsed-label">月份</span>
            <code class="parsed-value">{{ parsedDate?.month }}</code>
          </div>
          <div class="parsed-item">
            <span class="parsed-label">日期</span>
            <code class="parsed-value">{{ parsedDate?.day }}</code>
          </div>
          <div class="parsed-item">
            <span class="parsed-label">小时</span>
            <code class="parsed-value">{{ parsedDate?.hours }}</code>
          </div>
          <div class="parsed-item">
            <span class="parsed-label">分钟</span>
            <code class="parsed-value">{{ parsedDate?.minutes }}</code>
          </div>
          <div class="parsed-item">
            <span class="parsed-label">秒</span>
            <code class="parsed-value">{{ parsedDate?.seconds }}</code>
          </div>
        </div>
        <div class="parsed-extra">
          <div class="extra-item">
            <span class="extra-label">时间戳:</span>
            <code class="extra-value">{{ parsedDate?.timestamp }}</code>
          </div>
          <div class="extra-item">
            <span class="extra-label">格式化输出:</span>
            <code class="extra-value">{{ formattedOutput }}</code>
          </div>
        </div>
      </div>

      <div v-else class="parse-error">
        <h5>❌ 解析失败</h5>
        <p class="error-message">输入的字符串无法按照指定格式解析为有效日期</p>
        <div class="error-details">
          <div class="detail-item">
            <span class="detail-label">timestamp:</span>
            <code class="detail-value error">NaN</code>
          </div>
          <div class="detail-item">
            <span class="detail-label">检测方法:</span>
            <code class="detail-value">Number.isNaN(parsed.timestamp)</code>
          </div>
        </div>
      </div>
    </div>

    <div class="code-preview">
      <span class="code-label">代码：</span>
      <code class="code-value">Dater.parse('{{ dateString }}', '{{ formatTemplate }}'{{ useUTC ? ", { utc: true }" : "" }})</code>
    </div>

    <div class="tips-section">
      <h5>💡 常见问题</h5>
      <ul class="tips-list">
        <li><code>2024-02-30</code> → 无效日期（2月没有30日）</li>
        <li><code>2024-13-01</code> → 无效日期（没有13月）</li>
        <li>格式模板与字符串不匹配 → 无效日期</li>
        <li>无效日期不会抛错，需检查 <code>timestamp</code> 是否为 <code>NaN</code></li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Dater } from '@cat-kit/core/src'

const dateString = ref('2024-03-15 14:30:00')
const formatTemplate = ref('yyyy-MM-dd HH:mm:ss')
const useUTC = ref(false)

interface Preset {
  label: string
  date: string
  format: string
}

const presets: Preset[] = [
  { label: '标准日期时间', date: '2024-03-15 14:30:00', format: 'yyyy-MM-dd HH:mm:ss' },
  { label: '仅日期', date: '2024-03-15', format: 'yyyy-MM-dd' },
  { label: '中文格式', date: '2024年3月15日', format: 'yyyy年M月d日' },
  { label: '斜杠分隔', date: '2024/03/15', format: 'yyyy/MM/dd' },
  { label: '无效日期 (2月30日)', date: '2024-02-30', format: 'yyyy-MM-dd' },
  { label: '无效日期 (13月)', date: '2024-13-01', format: 'yyyy-MM-dd' },
]

function applyPreset(preset: Preset) {
  dateString.value = preset.date
  formatTemplate.value = preset.format
}

const parsedDater = computed(() => {
  try {
    return Dater.parse(dateString.value, formatTemplate.value, { utc: useUTC.value })
  } catch {
    return null
  }
})

const isValid = computed(() => {
  if (!parsedDater.value) return false
  return !Number.isNaN(parsedDater.value.timestamp)
})

const parsedDate = computed(() => {
  if (!parsedDater.value || !isValid.value) return null
  const d = parsedDater.value
  return {
    year: d.year,
    month: d.month,
    day: d.day,
    hours: d.hours,
    minutes: d.minutes,
    seconds: d.seconds,
    timestamp: d.timestamp,
  }
})

const formattedOutput = computed(() => {
  if (!parsedDater.value || !isValid.value) return ''
  return parsedDater.value.format('yyyy-MM-dd HH:mm:ss')
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

.demo-input {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-family: var(--vp-font-family-mono);
}

.demo-input.wide {
  min-width: 250px;
}

.demo-input:focus {
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

.preset-section h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-chip {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-chip:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.demo-result {
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 16px;
}

.demo-result.error {
  background: var(--vp-c-danger-soft);
}

.parse-success h5,
.parse-error h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

.parse-success h5 {
  color: var(--vp-c-green-1);
}

.parse-error h5 {
  color: var(--vp-c-danger-1);
}

.parsed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.parsed-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  text-align: center;
}

.parsed-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.parsed-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.parsed-extra {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.extra-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.extra-label {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.extra-value {
  font-size: 13px;
  background: var(--vp-c-bg);
  padding: 4px 8px;
  border-radius: 4px;
}

.error-message {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--vp-c-danger-1);
}

.error-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.detail-value {
  font-size: 13px;
  background: var(--vp-c-bg);
  padding: 4px 8px;
  border-radius: 4px;
}

.detail-value.error {
  color: var(--vp-c-danger-1);
  font-weight: 600;
}

.code-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
}

.code-label {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.code-value {
  font-size: 13px;
  background: var(--vp-c-bg);
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}

.tips-section {
  padding: 12px 16px;
  background: var(--vp-c-tip-soft);
  border-radius: 8px;
  border-left: 3px solid var(--vp-c-tip-1);
}

.tips-section h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-tip-1);
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tips-list code {
  font-size: 12px;
  background: var(--vp-c-bg);
  padding: 1px 4px;
  border-radius: 3px;
}
</style>
