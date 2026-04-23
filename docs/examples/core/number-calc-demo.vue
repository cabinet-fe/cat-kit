<template>
  <div class="demo-box">
    <div class="demo-section">
      <h4>高精度表达式计算</h4>
      <p class="demo-desc">输入数学表达式，对比 JS 原生计算与 $n.calc 的精度差异</p>
    </div>

    <div class="demo-controls">
      <div class="control-group expression-group">
        <label>表达式</label>
        <input
          v-model="expression"
          type="text"
          class="demo-input expression-input"
          placeholder="例如: 0.1 + 0.2 或 1 + 2 * (3 + 4)"
        />
      </div>
      <button class="calc-btn" @click="calculate">计算</button>
    </div>

    <div class="preset-section">
      <h5>常用示例</h5>
      <div class="preset-chips">
        <button
          v-for="preset in presets"
          :key="preset"
          class="preset-chip"
          @click="expression = preset"
        >
          {{ preset }}
        </button>
      </div>
    </div>

    <div class="demo-result">
      <div class="result-comparison">
        <div class="result-item">
          <span class="result-tag native">JS 原生 Number</span>
          <code :class="['result-value', { error: hasPrecisionIssue }]">{{ nativeResult }}</code>
        </div>
        <div class="result-arrow">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
        <div class="result-item">
          <span class="result-tag precise">$n.calc</span>
          <code class="result-value highlight">{{ calcResult }}</code>
        </div>
      </div>

      <div v-if="calcSteps.length > 0" class="calc-steps">
        <h5>计算过程</h5>
        <div class="steps-list">
          <div v-for="(step, i) in calcSteps" :key="i" class="step-item">
            <span class="step-index">{{ i + 1 }}</span>
            <code class="step-code">{{ step }}</code>
          </div>
        </div>
      </div>

      <div class="code-preview">
        <span class="code-label">代码：</span>
        <code class="code-value">$n.calc('{{ expression }}')</code>
      </div>
    </div>

    <div class="tips-section">
      <h5>常见问题</h5>
      <ul class="tips-list">
        <li>
          <code>0.1 + 0.2</code> → JS 原生结果为 <code>0.30000000000000004</code>，$n.calc 为
          <code>0.3</code>
        </li>
        <li>
          <code>19.9 * 100</code> → JS 原生结果为 <code>1989.9999999999998</code>，$n.calc 为
          <code>1990</code>
        </li>
        <li>支持括号、加减乘除四则运算</li>
        <li>支持负数与科学计数法</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { $n } from '@cat-kit/core'
import { ref, computed } from 'vue'

const expression = ref('0.1 + 0.2')
const calcError = ref('')
const calcSteps = ref<string[]>([])

const presets = [
  '0.1 + 0.2',
  '1.0 - 0.9',
  '19.9 * 100',
  '0.3 / 0.1',
  '1 + 2 * (3 + 4)',
  '1234567890123456.1 + 0.1',
  '(0.1 + 0.2) * 10',
  '10 - 2.5 * 3 + 1.5'
]

function safeNativeCalc(expr: string): number | null {
  const s = expr.replace(/\s+/g, '')
  let i = 0

  function parseExpression(): number | null {
    let left = parseTerm()
    if (left === null) return null
    while (i < s.length && (s[i] === '+' || s[i] === '-')) {
      const op = s[i++]!
      const right = parseTerm()
      if (right === null) return null
      left = op === '+' ? left + right : left - right
    }
    return left
  }

  function parseTerm(): number | null {
    let left = parseFactor()
    if (left === null) return null
    while (i < s.length && (s[i] === '*' || s[i] === '/')) {
      const op = s[i++]!
      const right = parseFactor()
      if (right === null) return null
      left = op === '*' ? left * right : left / right
    }
    return left
  }

  function parseFactor(): number | null {
    if (i >= s.length) return null
    if (s[i] === '+' || s[i] === '-') {
      const sign = s[i] === '-' ? -1 : 1
      i++
      const val = parseFactor()
      return val === null ? null : sign * val
    }
    if (s[i] === '(') {
      i++
      const val = parseExpression()
      if (val === null || i >= s.length || s[i] !== ')') return null
      i++
      return val
    }
    let numStr = ''
    while (i < s.length && /[0-9.]/.test(s[i]!)) {
      numStr += s[i++]!
    }
    if (numStr === '' || numStr === '.') return null
    const val = Number(numStr)
    if (Number.isNaN(val)) return null
    return val
  }

  const result = parseExpression()
  return result !== null && i === s.length ? result : null
}

const nativeResult = computed(() => {
  const result = safeNativeCalc(expression.value)
  if (result !== null) {
    return String(result)
  }
  return '无效表达式'
})

const calcResult = computed(() => {
  try {
    calcError.value = ''
    return String($n.calc(expression.value))
  } catch (e: any) {
    calcError.value = e.message || '计算错误'
    return calcError.value
  }
})

const hasPrecisionIssue = computed(() => {
  return nativeResult.value !== calcResult.value && !calcError.value
})

function calculate() {
  // 触发表达式重新计算（computed 会自动更新）
  // 同时生成步骤说明
  calcSteps.value = []
  try {
    const expr = expression.value.trim()
    if (!expr) return

    // 简单步骤拆解：按运算符分割
    const tokens = expr.match(/(\d+\.?\d*|\+|-|\*|\/|\(|\))/g) || []
    if (tokens.length > 0) {
      calcSteps.value.push(`解析表达式: ${tokens.join(' ')}`)
      calcSteps.value.push(`使用 Decimal 高精度计算`)
      calcSteps.value.push(`最终结果: ${$n.calc(expr)}`)
    }
  } catch {
    calcSteps.value = []
  }
}
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
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
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

.expression-group {
  flex: 1;
  min-width: 200px;
}

.expression-input {
  width: 100%;
  min-width: 280px;
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

.demo-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.calc-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.calc-btn:hover {
  opacity: 0.9;
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
  gap: 16px;
}

.result-comparison {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.result-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.result-tag.native {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}

.result-tag.precise {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.result-value {
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
}

.result-value.highlight {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.result-value.error {
  border-color: var(--vp-c-warning-1);
  color: var(--vp-c-warning-1);
}

.result-arrow {
  display: flex;
  align-items: center;
  color: var(--vp-c-text-2);
}

.result-arrow svg {
  color: var(--vp-c-brand-1);
}

.calc-steps h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--vp-c-bg);
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}

.step-index {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 1px 6px;
  border-radius: 10px;
}

.step-code {
  font-size: 13px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
}

.code-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.code-label {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.code-value {
  font-size: 13px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
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
