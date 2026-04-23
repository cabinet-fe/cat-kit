<template>
  <div class="demo-box">
    <div class="demo-section">
      <h4>数字格式化演示</h4>
      <p class="demo-desc">输入数字并选择格式化方式，实时查看结果</p>
    </div>

    <div class="demo-controls">
      <div class="control-group">
        <label>输入数字</label>
        <input
          v-model="inputValue"
          type="text"
          class="demo-input number-input"
          placeholder="例如: 1234567.89"
        />
      </div>

      <div class="control-group">
        <label>格式化类型</label>
        <select v-model="formatType" class="demo-select">
          <option value="currency-cny">人民币 (CNY)</option>
          <option value="currency-han">中文大写 (CNY_HAN)</option>
          <option value="fixed">精确小数 (fixed)</option>
          <option value="formatter-decimal">千分位 (decimal)</option>
          <option value="formatter-percent">百分比 (percent)</option>
        </select>
      </div>

      <div v-if="showPrecision" class="control-group">
        <label>小数位数</label>
        <input
          v-model.number="precision"
          type="number"
          min="0"
          max="10"
          class="demo-input precision-input"
        />
      </div>
    </div>

    <div class="preset-section">
      <h5>示例数值</h5>
      <div class="preset-chips">
        <button
          v-for="preset in numberPresets"
          :key="preset"
          class="preset-chip"
          @click="inputValue = preset"
        >
          {{ preset }}
        </button>
      </div>
    </div>

    <div class="demo-result">
      <div class="result-row">
        <span class="result-label">格式化结果：</span>
        <code class="result-value">{{ formattedResult }}</code>
      </div>
      <div class="result-row code-preview">
        <span class="result-label">代码：</span>
        <code class="result-code">{{ codePreview }}</code>
      </div>
    </div>

    <div class="methods-section">
      <h5>可用方法速查</h5>
      <div class="methods-grid">
        <div class="method-item">
          <code>n(val).currency('CNY', 2)</code>
          <span>人民币千分位</span>
        </div>
        <div class="method-item">
          <code>n(val).currency('CNY_HAN', 2)</code>
          <span>中文大写金额</span>
        </div>
        <div class="method-item">
          <code>n(val).fixed(2)</code>
          <span>指定小数位数</span>
        </div>
        <div class="method-item">
          <code>$n.formatter({ style: 'percent' })</code>
          <span>百分比格式器</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { n, $n } from '@cat-kit/core'
import { ref, computed } from 'vue'

const inputValue = ref('1234567.89')
const formatType = ref('currency-cny')
const precision = ref(2)

const showPrecision = computed(() => {
  return [
    'currency-cny',
    'currency-han',
    'fixed',
    'formatter-decimal',
    'formatter-percent'
  ].includes(formatType.value)
})

const numberPresets = ['1234567.89', '0.1', '3.1415926', '-9999.99', '1000000', '0.005']

const numValue = computed(() => {
  const v = parseFloat(inputValue.value)
  return Number.isNaN(v) ? 0 : v
})

const formattedResult = computed(() => {
  try {
    switch (formatType.value) {
      case 'currency-cny':
        return n(numValue.value).currency('CNY', precision.value)
      case 'currency-han':
        return n(numValue.value).currency('CNY_HAN', precision.value)
      case 'fixed':
        return n(numValue.value).fixed(precision.value)
      case 'formatter-decimal': {
        const formatter = $n.formatter({ style: 'decimal', precision: precision.value })
        return formatter.format(numValue.value)
      }
      case 'formatter-percent': {
        const formatter = $n.formatter({ style: 'percent', precision: precision.value })
        return formatter.format(numValue.value)
      }
      default:
        return ''
    }
  } catch {
    return '格式化错误'
  }
})

const codePreview = computed(() => {
  switch (formatType.value) {
    case 'currency-cny':
      return `n(${numValue.value}).currency('CNY', ${precision.value})`
    case 'currency-han':
      return `n(${numValue.value}).currency('CNY_HAN', ${precision.value})`
    case 'fixed':
      return `n(${numValue.value}).fixed(${precision.value})`
    case 'formatter-decimal':
      return `$n.formatter({ style: 'decimal', precision: ${precision.value} }).format(${numValue.value})`
    case 'formatter-percent':
      return `$n.formatter({ style: 'percent', precision: ${precision.value} }).format(${numValue.value})`
    default:
      return ''
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
  align-items: flex-end;
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
}

.number-input {
  min-width: 140px;
  font-family: var(--vp-font-family-mono);
}

.precision-input {
  width: 80px;
  text-align: center;
}

.demo-input:focus,
.demo-select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
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

.preset-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
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
  font-family: var(--vp-font-family-mono);
}

.methods-section h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.method-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.method-item code {
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
}

.method-item span {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
</style>
