<template>
  <div class="demo-box">
    <div class="demo-section">
      <h4>🧮 日期计算演示</h4>
      <p class="demo-desc">选择日期并进行加减运算，观察不可变操作特性</p>
    </div>

    <div class="demo-controls">
      <div class="control-group">
        <label>基准日期</label>
        <input type="date" v-model="baseDate" class="demo-input" />
      </div>

      <div class="control-group">
        <label>偏移量</label>
        <input type="number" v-model.number="offset" class="demo-input number-input" />
      </div>

      <div class="control-group">
        <label>单位</label>
        <select v-model="unit" class="demo-select">
          <option value="days">天 (Days)</option>
          <option value="weeks">周 (Weeks)</option>
          <option value="months">月 (Months)</option>
          <option value="years">年 (Years)</option>
        </select>
      </div>
    </div>

    <div class="demo-result">
      <div class="result-comparison">
        <div class="result-item">
          <span class="result-tag original">原始日期</span>
          <code class="result-date">{{ formattedBase }}</code>
        </div>
        <div class="result-arrow">
          <span>{{ offset >= 0 ? '+' : '' }}{{ offset }} {{ unitLabels[unit] }}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
        <div class="result-item">
          <span class="result-tag calculated">计算结果</span>
          <code class="result-date highlight">{{ calculatedResult }}</code>
        </div>
      </div>

      <div class="result-row code-preview">
        <span class="result-label">代码：</span>
        <code class="result-code">date('{{ baseDate }}').{{ methodName }}({{ offset }})</code>
      </div>

      <div class="immutable-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
        </svg>
        <span><code>{{ methodName }}()</code> 返回新实例，原日期 <strong>不会</strong> 被修改</span>
      </div>
    </div>

    <div class="quick-actions">
      <h5>快捷操作</h5>
      <div class="action-chips">
        <button class="action-chip" @click="setQuickOffset(1, 'days')">+1 天</button>
        <button class="action-chip" @click="setQuickOffset(7, 'days')">+7 天</button>
        <button class="action-chip" @click="setQuickOffset(-7, 'days')">-7 天</button>
        <button class="action-chip" @click="setQuickOffset(1, 'months')">+1 月</button>
        <button class="action-chip" @click="setQuickOffset(-1, 'months')">-1 月</button>
        <button class="action-chip" @click="setQuickOffset(1, 'years')">+1 年</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { date } from '@cat-kit/core/src'

const baseDate = ref(new Date().toISOString().slice(0, 10))
const offset = ref(7)
const unit = ref<'days' | 'weeks' | 'months' | 'years'>('days')

const unitLabels: Record<string, string> = {
  days: '天',
  weeks: '周',
  months: '月',
  years: '年'
}

const methodName = computed(() => {
  const methods: Record<string, string> = {
    days: 'addDays',
    weeks: 'addWeeks',
    months: 'addMonths',
    years: 'addYears'
  }
  return methods[unit.value]
})

const formattedBase = computed(() => {
  try {
    return date(baseDate.value).format('yyyy-MM-dd')
  } catch {
    return '无效日期'
  }
})

const calculatedResult = computed(() => {
  try {
    const d = date(baseDate.value)
    let result: ReturnType<typeof date>

    switch (unit.value) {
      case 'days':
        result = d.addDays(offset.value)
        break
      case 'weeks':
        result = d.addWeeks(offset.value)
        break
      case 'months':
        result = d.addMonths(offset.value)
        break
      case 'years':
        result = d.addYears(offset.value)
        break
      default:
        result = d
    }

    return result.format('yyyy-MM-dd')
  } catch {
    return '计算错误'
  }
})

function setQuickOffset(value: number, unitType: 'days' | 'weeks' | 'months' | 'years') {
  offset.value = value
  unit.value = unitType
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
}

.number-input {
  width: 100px;
}

.demo-input:focus,
.demo-select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
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

.result-tag.original {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}

.result-tag.calculated {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.result-date {
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.result-date.highlight {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.result-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
}

.result-arrow svg {
  color: var(--vp-c-brand-1);
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
}

.result-code {
  font-size: 13px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}

.immutable-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  padding: 10px 12px;
  background: var(--vp-c-tip-soft);
  border-radius: 6px;
  border-left: 3px solid var(--vp-c-tip-1);
}

.immutable-note svg {
  flex-shrink: 0;
  color: var(--vp-c-tip-1);
}

.immutable-note code {
  background: var(--vp-c-bg);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
}

.quick-actions h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.action-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-chip {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-chip:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
</style>
