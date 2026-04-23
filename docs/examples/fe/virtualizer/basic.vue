<template>
  <div class="virtualizer-demo">
    <div class="intro">
      <strong>异高 item 演示</strong>
      <p>
        这里会先按卡片档位给出一个预估高度，再由 `measureElement` 用真实 DOM
        尺寸继续校正。这样既能保留异高 item 的演示效果，也不会让远距离 `scrollToIndex`
        因估算偏差而明显跳偏。
      </p>
    </div>

    <div class="toolbar">
      <button type="button" @click="scrollToIndex(0)">开头</button>
      <button type="button" @click="scrollToIndex(120)">第 120 项</button>
      <button type="button" @click="scrollToIndex(360)">第 360 项</button>

      <label class="target-control">
        <span>跳到</span>
        <input v-model.number="targetIndex" type="number" min="0" :max="rows.length - 1" />
      </label>

      <button type="button" @click="scrollToTarget">scrollToIndex</button>
    </div>

    <div class="stats">
      <span>可见范围：{{ rangeLabel }}</span>
      <span>渲染项：{{ snapshot.items.length }} / {{ rows.length }}</span>
      <span>beforeSize：{{ snapshot.beforeSize }}px</span>
      <span>afterSize：{{ snapshot.afterSize }}px</span>
    </div>

    <div ref="viewportEl" class="viewport">
      <div class="spacer" :style="{ height: `${snapshot.totalSize}px` }">
        <div
          v-for="item in snapshot.items"
          :key="getRow(item.index).id"
          :ref="(el) => bindItem(item.index, el as Element | null)"
          class="row-card"
          :data-tier="getRow(item.index).tier"
          :style="{
            transform: `translateY(${item.start}px)`,
            minHeight: `${getRow(item.index).minHeight}px`
          }"
        >
          <div class="row-header">
            <strong>{{ getRow(item.index).title }}</strong>
            <span>{{ getRow(item.index).tier }} / #{{ item.index }}</span>
          </div>

          <p class="row-body">{{ getRow(item.index).summary }}</p>

          <ul class="row-details">
            <li v-for="detail in getRow(item.index).details" :key="detail">
              {{ detail }}
            </li>
          </ul>

          <div class="row-tags">
            <span v-for="tag in getRow(item.index).tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Virtualizer } from '@cat-kit/fe'
import type { VirtualSnapshot } from '@cat-kit/fe'
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'

interface DemoRow {
  id: string
  title: string
  summary: string
  details: string[]
  tags: string[]
  estimatedSize: number
  minHeight: number
  tier: 'S' | 'M' | 'L' | 'XL'
}

const tiers = ['S', 'M', 'L', 'XL'] as const
const minHeights = [60, 88, 120, 156] as const
const estimatedSizes = {
  S: 132,
  M: 156,
  L: 188,
  XL: 224
} as const

const rows: DemoRow[] = Array.from({ length: 500 }, (_, index) => {
  const detailCount = (index % 4) + 1
  const tier = tiers[index % tiers.length]!
  const minHeight = minHeights[index % minHeights.length]!
  const estimatedSize = estimatedSizes[tier]

  return {
    id: `row-${index}`,
    title: `消息队列 ${index + 1}`,
    summary: `这是一个 ${tier} 档位卡片，用来模拟虚拟列表里常见的短消息、摘要块和富内容卡片混排。`,
    details: Array.from(
      { length: detailCount },
      (_, line) => `额外内容行 ${line + 1}，用于拉开实际高度差异`
    ),
    tags: [`estimate≈${estimatedSize}px`, `actual>=${minHeight}px`, tier],
    estimatedSize,
    minHeight,
    tier
  }
})

const viewportEl = ref<HTMLElement | null>(null)
const targetIndex = ref(180)

const virtualizer = new Virtualizer({
  count: rows.length,
  estimateSize: (index) => getRow(index).estimatedSize
})

const snapshot = shallowRef<VirtualSnapshot>(virtualizer.getSnapshot())
let pendingAlignIndex: number | null = null
let alignFrameId: number | null = null

const rangeLabel = computed(() => {
  if (!snapshot.value.range) {
    return '等待挂载'
  }

  return `${snapshot.value.range.startIndex} - ${snapshot.value.range.endIndex}`
})

let unsubscribe: (() => void) | null = null

function getRow(index: number): DemoRow {
  return rows[index]!
}

function bindItem(index: number, element: Element | null) {
  virtualizer.measureElement(index, element)

  if (element && pendingAlignIndex === index) {
    pendingAlignIndex = null
    if (alignFrameId !== null) {
      cancelAnimationFrame(alignFrameId)
    }
    alignFrameId = requestAnimationFrame(() => {
      alignFrameId = null
      virtualizer.scrollToIndex(index, { align: 'center' })
    })
  }
}

function normalizeIndex(index: number): number {
  if (!Number.isFinite(index)) {
    return 0
  }

  return Math.min(rows.length - 1, Math.max(0, Math.trunc(index)))
}

function scrollToIndex(index: number) {
  const nextIndex = normalizeIndex(index)
  pendingAlignIndex = nextIndex
  virtualizer.scrollToIndex(nextIndex, { align: 'center', behavior: 'smooth' })
}

function scrollToTarget() {
  targetIndex.value = normalizeIndex(targetIndex.value)
  scrollToIndex(targetIndex.value)
}

onMounted(() => {
  unsubscribe = virtualizer.subscribe((next) => {
    snapshot.value = next
  })
  virtualizer.connect(viewportEl.value)
})

onUnmounted(() => {
  if (alignFrameId !== null) {
    cancelAnimationFrame(alignFrameId)
  }
  unsubscribe?.()
  virtualizer.destroy()
})
</script>

<style scoped>
.virtualizer-demo {
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.viewport {
  height: 520px;
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(236, 253, 245, 0.95), rgba(255, 255, 255, 0.98)),
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.18), transparent 34%);
}

.spacer {
  position: relative;
  width: 100%;
}

.row-card {
  position: absolute;
  left: 12px;
  right: 12px;
  box-sizing: border-box;
  padding: 14px 16px;
  border: 1px solid rgba(15, 118, 110, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 24px rgba(15, 118, 110, 0.08);
}

.row-card:not(:last-child) {
  margin-bottom: 8px;
}

.row-card[data-tier='M'] {
  border-color: rgba(14, 165, 233, 0.2);
}

.row-card[data-tier='L'] {
  border-color: rgba(249, 115, 22, 0.18);
}

.row-card[data-tier='XL'] {
  border-color: rgba(220, 38, 38, 0.16);
}

.row-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.row-header span {
  color: #0f766e;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
}

.row-body {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.row-details {
  margin: 10px 0 0;
  padding-left: 18px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.7;
}

.row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.row-tags span {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(20, 184, 166, 0.12);
  color: #0f766e;
  font-size: 12px;
}

@media (max-width: 640px) {
  .stats {
    grid-template-columns: minmax(0, 1fr);
  }

  .viewport {
    height: 420px;
  }
}
</style>
