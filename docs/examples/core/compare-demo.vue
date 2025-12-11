<template>
  <div class="demo-box">
    <div class="demo-section">
      <h4>⚖️ 日期比较演示</h4>
      <p class="demo-desc">选择两个日期，查看差值计算和范围判断结果</p>
    </div>

    <div class="demo-controls">
      <div class="control-group">
        <label>日期 A</label>
        <input type="date" v-model="dateA" class="demo-input" />
      </div>

      <div class="control-group">
        <label>日期 B</label>
        <input type="date" v-model="dateB" class="demo-input" />
      </div>
    </div>

    <div class="demo-result">
      <h5>📊 差值计算</h5>
      <div class="diff-grid">
        <div class="diff-item">
          <span class="diff-label">compare()</span>
          <code class="diff-value">{{ compareResult }} 天</code>
        </div>
        <div class="diff-item">
          <span class="diff-label">diff('days')</span>
          <code class="diff-value">{{ diffDays }} 天</code>
        </div>
        <div class="diff-item">
          <span class="diff-label">diff('weeks')</span>
          <code class="diff-value">{{ diffWeeks }} 周</code>
        </div>
        <div class="diff-item">
          <span class="diff-label">diff('months')</span>
          <code class="diff-value">{{ diffMonths }} 月</code>
        </div>
        <div class="diff-item">
          <span class="diff-label">diff('hours')</span>
          <code class="diff-value">{{ diffHours }} 小时</code>
        </div>
        <div class="diff-item">
          <span class="diff-label">diff('years')</span>
          <code class="diff-value">{{ diffYears }} 年</code>
        </div>
      </div>
    </div>

    <div class="demo-result">
      <h5>🔍 判断方法</h5>
      <div class="check-grid">
        <div :class="['check-item', { success: isSameDay }]">
          <span class="check-icon">{{ isSameDay ? '✅' : '❌' }}</span>
          <span class="check-label">isSameDay()</span>
        </div>
        <div :class="['check-item', { success: isSameMonth }]">
          <span class="check-icon">{{ isSameMonth ? '✅' : '❌' }}</span>
          <span class="check-label">isSameMonth()</span>
        </div>
        <div :class="['check-item', { success: isSameYear }]">
          <span class="check-icon">{{ isSameYear ? '✅' : '❌' }}</span>
          <span class="check-label">isSameYear()</span>
        </div>
        <div :class="['check-item', { success: isWeekend }]">
          <span class="check-icon">{{ isWeekend ? '✅' : '❌' }}</span>
          <span class="check-label">A.isWeekend()</span>
        </div>
        <div :class="['check-item', { success: isLeapYear }]">
          <span class="check-icon">{{ isLeapYear ? '✅' : '❌' }}</span>
          <span class="check-label">A.isLeapYear()</span>
        </div>
      </div>
    </div>

    <div class="demo-result">
      <h5>📏 范围判断 (isBetween)</h5>
      <div class="range-section">
        <div class="range-controls">
          <div class="control-group">
            <label>测试日期</label>
            <input type="date" v-model="testDate" class="demo-input" />
          </div>
          <div class="control-group">
            <label>区间类型</label>
            <select v-model="rangeType" class="demo-select">
              <option value="[]">[] 闭区间</option>
              <option value="()">(()) 开区间</option>
              <option value="[)">[) 左闭右开</option>
              <option value="(]">(] 左开右闭</option>
            </select>
          </div>
        </div>
        <div class="range-result">
          <div class="range-visual">
            <span class="range-date">{{ dateA }}</span>
            <span class="range-bracket">{{ rangeType[0] }}</span>
            <div class="range-line">
              <div
                class="range-point"
                :class="{ inside: isBetweenResult }"
                :style="{ left: pointPosition + '%' }"
              >
                <span class="point-date">{{ testDate }}</span>
              </div>
            </div>
            <span class="range-bracket">{{ rangeType[1] }}</span>
            <span class="range-date">{{ dateB }}</span>
          </div>
          <div :class="['range-verdict', { success: isBetweenResult }]">
            {{ isBetweenResult ? '✅ 在区间内' : '❌ 不在区间内' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { date } from '@cat-kit/core/src'

const today = new Date()
const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

const dateA = ref(today.toISOString().slice(0, 10))
const dateB = ref(nextWeek.toISOString().slice(0, 10))
const testDate = ref(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
const rangeType = ref<'[]' | '()' | '[)' | '(]'>('[]')

const daterA = computed(() => date(dateA.value))
const daterB = computed(() => date(dateB.value))
const daterTest = computed(() => date(testDate.value))

const compareResult = computed(() => {
  try {
    return daterA.value.compare(daterB.value)
  } catch {
    return 'N/A'
  }
})

const diffDays = computed(() => {
  try {
    return daterA.value.diff(daterB.value, 'days')
  } catch {
    return 'N/A'
  }
})

const diffWeeks = computed(() => {
  try {
    return daterA.value.diff(daterB.value, 'weeks')
  } catch {
    return 'N/A'
  }
})

const diffMonths = computed(() => {
  try {
    return daterA.value.diff(daterB.value, 'months')
  } catch {
    return 'N/A'
  }
})

const diffHours = computed(() => {
  try {
    return daterA.value.diff(daterB.value, 'hours')
  } catch {
    return 'N/A'
  }
})

const diffYears = computed(() => {
  try {
    return daterA.value.diff(daterB.value, 'years')
  } catch {
    return 'N/A'
  }
})

const isSameDay = computed(() => {
  try {
    return daterA.value.isSameDay(daterB.value)
  } catch {
    return false
  }
})

const isSameMonth = computed(() => {
  try {
    return daterA.value.isSameMonth(daterB.value)
  } catch {
    return false
  }
})

const isSameYear = computed(() => {
  try {
    return daterA.value.isSameYear(daterB.value)
  } catch {
    return false
  }
})

const isWeekend = computed(() => {
  try {
    return daterA.value.isWeekend()
  } catch {
    return false
  }
})

const isLeapYear = computed(() => {
  try {
    return daterA.value.isLeapYear()
  } catch {
    return false
  }
})

const isBetweenResult = computed(() => {
  try {
    return daterTest.value.isBetween(dateA.value, dateB.value, { inclusive: rangeType.value })
  } catch {
    return false
  }
})

const pointPosition = computed(() => {
  try {
    const a = daterA.value.timestamp
    const b = daterB.value.timestamp
    const t = daterTest.value.timestamp
    const range = b - a
    if (range === 0) return 50
    const pos = ((t - a) / range) * 100
    return Math.max(0, Math.min(100, pos))
  } catch {
    return 50
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
}

.demo-result h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.diff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.diff-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.diff-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}

.diff-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.check-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  font-size: 13px;
}

.check-item.success {
  border-color: var(--vp-c-green-1);
  background: var(--vp-c-green-soft);
}

.check-label {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
}

.range-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.range-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.range-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.range-visual {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--vp-c-bg);
  border-radius: 6px;
}

.range-date {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}

.range-bracket {
  font-size: 20px;
  font-weight: bold;
  color: var(--vp-c-brand-1);
}

.range-line {
  flex: 1;
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  position: relative;
  min-width: 100px;
}

.range-point {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: var(--vp-c-danger-1);
  border-radius: 50%;
  border: 2px solid var(--vp-c-bg);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.range-point.inside {
  background: var(--vp-c-green-1);
}

.point-date {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  white-space: nowrap;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}

.range-verdict {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  text-align: center;
}

.range-verdict.success {
  background: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
}
</style>
