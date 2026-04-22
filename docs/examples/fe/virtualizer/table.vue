<template>
  <div class="table-demo">
    <div class="intro">
      <strong>原生 &lt;table&gt; 虚拟滚动 (2000 × 20)</strong>
      <p>
        基于原生 <code>&lt;table&gt;</code> + <code>table-layout: fixed</code> + padding-row
        占位方案。示例在 <code>onMounted</code> 阶段一次性把数据层已知的行高批量
        <code>measureMany</code> 给 <code>Virtualizer</code>，然后由纯 JS 原生 API 直接管理
        <code>&lt;tbody&gt;</code> 下的行节点池：行节点创建一次即永久缓存，每次快照只做最小
        <code>insertBefore</code>/<code>removeChild</code>，前后 spacer 仅写 2 次
        <code>style.height</code>，Vue
        组件树几乎不参与滚动期间的任何重渲染。面板最大化测试建议点击右上角
        <strong>最大化</strong> 后再压测。
      </p>
    </div>

    <div ref="perfEl" class="perf-panel" role="status" aria-label="perf: waiting">
      <div class="perf-cell">
        <span class="perf-label">FPS</span><span data-k="fps" class="perf-value">—</span>
      </div>
      <div class="perf-cell">
        <span class="perf-label">min FPS</span><span data-k="minFps" class="perf-value">—</span>
      </div>
      <div class="perf-cell">
        <span class="perf-label">帧耗时</span><span data-k="frameMs" class="perf-value">—</span>
      </div>
      <div class="perf-cell">
        <span class="perf-label">渲染行</span><span data-k="rendered" class="perf-value">—</span>
      </div>
      <div class="perf-cell">
        <span class="perf-label">可见范围</span><span data-k="range" class="perf-value">—</span>
      </div>
      <div class="perf-cell">
        <span class="perf-label">已测/总数</span><span data-k="measured" class="perf-value">—</span>
      </div>
      <div class="perf-cell">
        <span class="perf-label">平均行高</span><span data-k="avg" class="perf-value">—</span>
      </div>
      <div class="perf-cell">
        <span class="perf-label">notify</span><span data-k="notify" class="perf-value">—</span>
      </div>
    </div>

    <div class="toolbar">
      <button type="button" @click="jumpTo(0)">Top</button>
      <button type="button" @click="jumpTo(500)">第 500</button>
      <button type="button" @click="jumpTo(1000)">第 1000</button>
      <button type="button" @click="jumpTo(ROW_COUNT - 1)">末行</button>

      <label class="target-control">
        <span>跳到</span>
        <input v-model.number="targetIndex" type="number" min="0" :max="ROW_COUNT - 1" />
      </label>
      <button type="button" @click="jumpToTarget">scrollToIndex</button>

      <button ref="stressButtonEl" type="button" class="stress" @click="toggleStress">
        暴力滚动 × 50
      </button>

      <span class="hint">Tip: 点右上 <kbd>最大化</kbd> 可拉高视口，更能逼出性能压力</span>
    </div>

    <div ref="viewportEl" class="viewport">
      <table class="grid">
        <colgroup>
          <col v-for="column in columns" :key="column.key" :style="column.style" />
        </colgroup>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
          </tr>
        </thead>
        <!--
          tbody 内容完全由 JS 原生 DOM API 管理：
          - 行节点创建一次即永久缓存，只做 insertBefore/removeChild；
          - 前后 spacer 仅写 style.height；
          - Vue 不参与滚动期间任何子节点 diff/patch。
          v-once 让 Vue 编译器生成常量 vnode，彻底避免父组件 rerender 时误 patch tbody 子树。
        -->
        <tbody ref="tbodyEl" v-once></tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Virtualizer } from '@cat-kit/fe'
import type { VirtualSnapshot } from '@cat-kit/fe'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const ROW_COUNT = 2000
const COLUMN_COUNT = 20
const STRESS_TOTAL = 50
const STRESS_DURATION = 5000

interface TableColumn {
  key: string
  label: string
  width: number
  style: { width: string }
}

interface TableRow {
  height: number
  cells: string[]
}

const columns: TableColumn[] = Array.from({ length: COLUMN_COUNT }, (_, i) => {
  if (i === 0) return { key: 'idx', label: '#', width: 72, style: { width: '72px' } }
  if (i === 1) return { key: 'name', label: '标题', width: 200, style: { width: '200px' } }
  return { key: `c${i}`, label: `列 ${i}`, width: 120, style: { width: '120px' } }
})

const rows: TableRow[] = (() => {
  // 确定性伪随机，便于验证结果可复现
  let seed = 0xc0ffee
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0x1_0000_0000
  }
  return Array.from({ length: ROW_COUNT }, (_, index) => {
    const height = 30 + Math.floor(rand() * 31)
    const cells = columns.map((_, colIndex) => {
      if (colIndex === 0) return `#${index + 1}`
      if (colIndex === 1) return `记录 ${index + 1} · ${height}px`
      return `c${colIndex}-${index}`
    })
    return { height, cells }
  })
})()

const viewportEl = ref<HTMLElement | null>(null)
const perfEl = ref<HTMLElement | null>(null)
const tbodyEl = ref<HTMLTableSectionElement | null>(null)
const stressButtonEl = ref<HTMLButtonElement | null>(null)
const targetIndex = ref(1000)

const virtualizer = new Virtualizer({
  count: ROW_COUNT,
  overscan: 4,
  // 所有行高会在 onMounted 阶段一次性 measureMany 上报，estimateSize 仅在
  // measureMany 之前兜底；useMeasuredAverage 保留以防未来改为增量测量。
  estimateSize: () => 45
})

/** DOM 直写 perf 面板：避免 Vue reactive 每帧调度 —— 正是原先抖动的主因之一。 */
const perfCells = new Map<string, HTMLElement>()
let notifyCount = 0

function writePerf(key: string, value: string): void {
  const el = perfCells.get(key)
  if (!el || el.textContent === value) return
  el.textContent = value
}

// 预先计算总行高、平均行高（数据确定，不依赖 DOM 测量）
const totalMeasuredSum = rows.reduce((sum, r) => sum + r.height, 0)
const averageRowHeight = Math.round(totalMeasuredSum / ROW_COUNT)

// ---------------------------------------------------------------------------
// tbody 纯 DOM 管理：行节点池 + 最小化 insert/remove
// ---------------------------------------------------------------------------

/** 行节点缓存：index → <tr>；节点创建一次即永久复用，滚动时只做 insert/remove。 */
const rowNodes = new Map<number, HTMLTableRowElement>()
let beforeSpacer: HTMLTableRowElement | null = null
let afterSpacer: HTMLTableRowElement | null = null
let beforeSpacerHeight = -1
let afterSpacerHeight = -1
/** 当前 tbody 中已插入的行 index 范围（闭区间）；-1 表示尚无行。 */
let renderedStart = -1
let renderedEnd = -1

function createSpacer(): HTMLTableRowElement {
  const tr = document.createElement('tr')
  tr.className = 'spacer'
  const td = document.createElement('td')
  td.colSpan = COLUMN_COUNT
  tr.appendChild(td)
  return tr
}

function ensureRow(index: number): HTMLTableRowElement {
  const cached = rowNodes.get(index)
  if (cached) return cached
  const row = rows[index]!
  const tr = document.createElement('tr')
  tr.dataset.index = String(index)
  tr.style.height = `${row.height}px`
  // 条纹类绑定到「数据索引奇偶」而不是 DOM 兄弟序号。否则 CSS `:nth-of-type`
  // 会在每次滚动 insert/remove 时因兄弟位序整体 ±1 而让所有可见行底色互换，
  // 把一次滚动放大成 N 行 × M 列的全量 paint —— 这是压测时掉帧的主因。
  if ((index & 1) === 0) tr.classList.add('row-stripe')
  const cells = row.cells
  for (let i = 0; i < cells.length; i++) {
    const td = document.createElement('td')
    td.textContent = cells[i]!
    tr.appendChild(td)
  }
  rowNodes.set(index, tr)
  return tr
}

function setSpacerHeight(spacer: HTMLTableRowElement, prevHeight: number, next: number): number {
  if (prevHeight === next) return prevHeight
  spacer.style.height = next > 0 ? `${next}px` : '0px'
  return next
}

function applySnapshot(next: VirtualSnapshot): void {
  const tbody = tbodyEl.value
  if (!tbody || !beforeSpacer || !afterSpacer) return

  beforeSpacerHeight = setSpacerHeight(beforeSpacer, beforeSpacerHeight, next.beforeSize)
  afterSpacerHeight = setSpacerHeight(afterSpacer, afterSpacerHeight, next.afterSize)

  const items = next.items

  if (items.length === 0) {
    if (renderedStart !== -1) {
      for (let i = renderedStart; i <= renderedEnd; i++) {
        const tr = rowNodes.get(i)
        if (tr && tr.parentNode === tbody) tbody.removeChild(tr)
      }
      renderedStart = -1
      renderedEnd = -1
    }
    writePerf('notify', String(notifyCount))
    writePerf('range', '—')
    writePerf('rendered', `0 / ${ROW_COUNT}`)
    return
  }

  const nextStart = items[0]!.index
  const nextEnd = items[items.length - 1]!.index

  // 首次渲染 或 完全不重叠 → 清空重建
  if (renderedStart === -1 || nextEnd < renderedStart || nextStart > renderedEnd) {
    if (renderedStart !== -1) {
      for (let i = renderedStart; i <= renderedEnd; i++) {
        const tr = rowNodes.get(i)
        if (tr && tr.parentNode === tbody) tbody.removeChild(tr)
      }
    }
    for (let i = nextStart; i <= nextEnd; i++) {
      tbody.insertBefore(ensureRow(i), afterSpacer)
    }
  } else {
    // 有重叠：四段增量
    // 1. 移除旧 range 中落在新 range 之前的部分
    if (renderedStart < nextStart) {
      for (let i = renderedStart; i < nextStart; i++) {
        const tr = rowNodes.get(i)
        if (tr && tr.parentNode === tbody) tbody.removeChild(tr)
      }
    }
    // 2. 移除旧 range 中落在新 range 之后的部分
    if (renderedEnd > nextEnd) {
      for (let i = nextEnd + 1; i <= renderedEnd; i++) {
        const tr = rowNodes.get(i)
        if (tr && tr.parentNode === tbody) tbody.removeChild(tr)
      }
    }
    // 3. 在头部补齐新增行（anchor 为当前保留的第一个行节点）
    if (nextStart < renderedStart) {
      const anchor = rowNodes.get(Math.max(renderedStart, nextStart))!
      // anchor 就是仍在 tbody 里的第一个旧节点；
      // 注意 Math.max 的场景：若 nextStart < renderedStart 且 nextEnd >= renderedStart，anchor=rowNodes.get(renderedStart)
      for (let i = nextStart; i < renderedStart; i++) {
        tbody.insertBefore(ensureRow(i), anchor)
      }
    }
    // 4. 在尾部追加新增行
    if (nextEnd > renderedEnd) {
      for (let i = renderedEnd + 1; i <= nextEnd; i++) {
        tbody.insertBefore(ensureRow(i), afterSpacer)
      }
    }
  }

  renderedStart = nextStart
  renderedEnd = nextEnd

  writePerf('notify', String(notifyCount))
  writePerf('range', `${next.range!.startIndex} – ${next.range!.endIndex}`)
  writePerf('rendered', `${items.length} / ${ROW_COUNT}`)
}

// ---------------------------------------------------------------------------
// snapshot 合帧：同一帧内多次订阅回调只落盘一次 DOM 更新
// ---------------------------------------------------------------------------
let snapshotRaf = 0
let queuedSnapshot: VirtualSnapshot | null = null

function flushSnapshot(): void {
  snapshotRaf = 0
  const next = queuedSnapshot
  if (!next) return
  queuedSnapshot = null
  applySnapshot(next)
}

function scheduleSnapshot(next: VirtualSnapshot): void {
  queuedSnapshot = next
  if (snapshotRaf !== 0) return
  snapshotRaf = requestAnimationFrame(flushSnapshot)
}

// ---------------------------------------------------------------------------
// perf 面板：FPS / minFPS / 帧耗时 以 rAF 驱动、按 120ms 窗口低频直写
// ---------------------------------------------------------------------------
let rafId = 0
let lastFrame = 0
const FPS_WINDOW = 30
const PERF_SAMPLE_INTERVAL = 120
const frames: number[] = []
let minFps = 999
let lastPerfPaint = 0

function tickFps(now: number): void {
  if (lastFrame !== 0) {
    const dt = now - lastFrame
    if (dt > 100) {
      lastFrame = now
      rafId = requestAnimationFrame(tickFps)
      return
    }
    frames.push(dt)
    if (frames.length > FPS_WINDOW) frames.shift()
    let sum = 0
    let maxDt = 0
    for (const v of frames) {
      sum += v
      if (v > maxDt) maxDt = v
    }
    const avg = sum / frames.length
    const fps = Math.round(1000 / avg)
    const instFps = Math.round(1000 / maxDt)
    if (frames.length === FPS_WINDOW && instFps < minFps) minFps = instFps

    if (now - lastPerfPaint >= PERF_SAMPLE_INTERVAL) {
      lastPerfPaint = now
      writePerf('fps', String(fps))
      writePerf('minFps', minFps === 999 ? '—' : String(minFps))
      writePerf('frameMs', (Math.round(avg * 10) / 10).toFixed(1))

      const panel = perfEl.value
      if (panel) {
        const tone = fps >= 55 ? 'good' : fps >= 30 ? 'warn' : 'bad'
        if (panel.dataset.tone !== tone) panel.dataset.tone = tone
      }
    }
  }
  lastFrame = now
  rafId = requestAnimationFrame(tickFps)
}

// ---------------------------------------------------------------------------
// 滚动操作 & 压测
// ---------------------------------------------------------------------------
function normalizeIndex(i: number): number {
  if (!Number.isFinite(i)) return 0
  return Math.min(ROW_COUNT - 1, Math.max(0, Math.trunc(i)))
}

function jumpTo(i: number): void {
  virtualizer.scrollToIndex(normalizeIndex(i), { align: 'start', behavior: 'smooth' })
}

function jumpToTarget(): void {
  targetIndex.value = normalizeIndex(targetIndex.value)
  jumpTo(targetIndex.value)
}

let stressing = false
let stressTick = 0
let stressRaf = 0
let stressStart = 0

function syncStressButton(): void {
  const el = stressButtonEl.value
  if (!el) return
  el.classList.toggle('active', stressing)
  el.textContent = stressing ? `停止 (${stressTick}/${STRESS_TOTAL})` : '暴力滚动 × 50'
  el.setAttribute('aria-pressed', stressing ? 'true' : 'false')
}

function toggleStress(): void {
  if (stressing) stopStress()
  else startStress()
}

function startStress(): void {
  stopStress()
  stressing = true
  stressTick = 0
  stressStart = 0
  syncStressButton()
  stressRaf = requestAnimationFrame(runStress)
}

function runStress(now: number): void {
  const viewport = viewportEl.value
  if (!viewport) {
    stopStress()
    return
  }

  if (stressStart === 0) stressStart = now

  const elapsed = now - stressStart
  const progress = Math.min(STRESS_TOTAL, (elapsed / STRESS_DURATION) * STRESS_TOTAL)
  const leg = Math.floor(progress)
  const local = progress - leg
  const snap = virtualizer.getSnapshot()
  const max = Math.max(0, snap.totalSize - snap.viewportSize)
  const ratio = leg % 2 === 0 ? local : 1 - local

  viewport.scrollTop = max * ratio
  const nextTick = Math.min(STRESS_TOTAL, leg)
  if (nextTick !== stressTick) {
    stressTick = nextTick
    syncStressButton()
  }

  if (progress >= STRESS_TOTAL) {
    stopStress()
    return
  }

  stressRaf = requestAnimationFrame(runStress)
}

function stopStress(): void {
  if (stressRaf !== 0) {
    cancelAnimationFrame(stressRaf)
    stressRaf = 0
  }
  if (!stressing && stressTick === 0) return
  stressing = false
  stressTick = 0
  syncStressButton()
}

// ---------------------------------------------------------------------------
// 生命周期
// ---------------------------------------------------------------------------
let unsubscribe: (() => void) | null = null

onMounted(() => {
  if (perfEl.value) {
    for (const el of perfEl.value.querySelectorAll<HTMLElement>('[data-k]')) {
      perfCells.set(el.dataset.k!, el)
    }
  }
  // 测量/平均行高是数据确定值，直接一次写入
  writePerf('measured', `${ROW_COUNT} / ${ROW_COUNT}`)
  writePerf('avg', `${averageRowHeight} px`)
  syncStressButton()

  // 初始化 tbody spacer：永远位于 tbody 首尾，避免每次快照都要创建销毁。
  const tbody = tbodyEl.value
  if (tbody) {
    beforeSpacer = createSpacer()
    afterSpacer = createSpacer()
    tbody.appendChild(beforeSpacer)
    tbody.appendChild(afterSpacer)
  }

  // 行高来自数据层已知值 → 一次性批量上报，跳过增量测量路径。
  virtualizer.measureMany(rows.map((row, index) => ({ index, size: row.height })))

  unsubscribe = virtualizer.subscribe((next) => {
    notifyCount += 1
    scheduleSnapshot(next)
  })

  virtualizer.mount(viewportEl.value)
  rafId = requestAnimationFrame(tickFps)
})

onBeforeUnmount(() => {
  stopStress()
  if (snapshotRaf !== 0) {
    cancelAnimationFrame(snapshotRaf)
    snapshotRaf = 0
  }
  queuedSnapshot = null
  if (rafId !== 0) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  unsubscribe?.()
  virtualizer.destroy()
  // 清空节点池，帮助 GC 快速回收（组件销毁时 tbody 整体会被 Vue 移除）。
  rowNodes.clear()
  beforeSpacer = null
  afterSpacer = null
})
</script>

<style scoped>
.table-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.intro {
  padding: 14px 16px;
  border: 1px solid rgba(13, 148, 136, 0.16);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(204, 251, 241, 0.72), rgba(255, 255, 255, 0.95));
}

.intro strong {
  display: block;
  margin-bottom: 6px;
  color: #115e59;
}

.intro p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.intro code {
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(15, 118, 110, 0.1);
  color: #0f766e;
  font-size: 12px;
}

.perf-panel {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  font-size: 12px;
}

.perf-panel[data-tone='good'] .perf-value {
  color: #0f766e;
}
.perf-panel[data-tone='warn'] .perf-value {
  color: #c2410c;
}
.perf-panel[data-tone='bad'] .perf-value {
  color: #b91c1c;
}

.perf-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-right: 1px solid var(--vp-c-divider);
}

.perf-cell:last-child {
  border-right: 0;
}

.perf-label {
  color: var(--vp-c-text-3);
  font-size: 11px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.perf-value {
  color: var(--vp-c-text-1);
  font-weight: 600;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  font-family: var(--vp-font-family-mono);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.toolbar button {
  padding: 8px 14px;
  border: 0;
  border-radius: 999px;
  background: #0f766e;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.toolbar button:hover {
  background: #115e59;
}
.toolbar button.stress {
  background: #c2410c;
}
.toolbar button.stress:hover {
  background: #9a3412;
}
.toolbar button.stress.active {
  background: #b91c1c;
  animation: stress-pulse 0.8s ease-in-out infinite alternate;
}

@keyframes stress-pulse {
  from {
    box-shadow: 0 0 0 0 rgba(185, 28, 28, 0.4);
  }
  to {
    box-shadow: 0 0 0 8px rgba(185, 28, 28, 0);
  }
}

.target-control {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.target-control input {
  width: 88px;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
}

.hint {
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.hint kbd {
  padding: 1px 5px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 3px;
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
}

/* 视口：用 min(800px, viewport-高度) 让"最大化"面板时可以拉到更高，触发更多行渲染压力 */
.viewport {
  height: min(800px, calc(100vh - 240px));
  min-height: 360px;
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  contain: strict;
}

.grid {
  /* table-layout: fixed 让浏览器跳过 content-based 列宽计算，这是原生 table 虚拟化的关键优化 */
  table-layout: fixed;
  border-collapse: collapse;
  width: auto;
  min-width: 100%;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.grid thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px 12px;
  border-right: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.02em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

/* tbody 内部节点由 JS 创建，不带 scoped 属性，统一用 :deep() 穿透。 */
.grid :deep(tbody tr:not(.spacer)) {
  background: var(--vp-c-bg);
}
/*
 * 条纹改用 index 维度的稳定类 `.row-stripe`。之前用 `:nth-of-type(even)` 统计 DOM
 * 兄弟序号，每次虚拟滚动 insert/remove 都会让所有可见数据行的奇偶翻转 → 全量
 * 重绘 ~N×M 个 td。改成稳定类后，滚动只有新增/移除那几行会 paint，其余行样式
 * 完全不动，Paint 预算立刻给回 120Hz。
 */
.grid :deep(tbody tr.row-stripe) {
  background: var(--vp-c-bg-soft);
}

.grid :deep(tbody td) {
  padding: 6px 12px;
  border-right: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid :deep(tbody tr td:first-child) {
  color: #0f766e;
  text-align: center;
  font-family: var(--vp-font-family-mono);
}

.grid :deep(tbody tr.spacer td) {
  padding: 0;
  border: 0;
}

@media (max-width: 960px) {
  .perf-panel {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .perf-cell:nth-child(4n) {
    border-right: 0;
  }
  .perf-cell:nth-child(n + 5) {
    border-top: 1px solid var(--vp-c-divider);
  }
}

@media (max-width: 640px) {
  .viewport {
    height: 480px;
  }
  .perf-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
