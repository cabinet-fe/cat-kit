<template>
  <div class="table-demo">
    <div class="intro">
      <strong>原生 table 虚拟滚动 (2000 × 20)</strong>
    </div>

    <div ref="scroller" class="viewport">
      <table class="grid">
        <colgroup>
          <col v-for="(_, idx) in columns" :key="idx" />
        </colgroup>
        <thead>
          <tr>
            <th v-for="(column, idx) in columns" :key="idx">{{ column.label }}</th>
          </tr>
        </thead>

        <tbody aria-hidden="true">
          <tr ref="topSpacerRow" class="spacer">
            <td :colspan="columns.length"></td>
          </tr>
        </tbody>

        <TBody :columns />

        <tbody aria-hidden="true">
          <tr ref="bottomSpacerRow" class="spacer">
            <td :colspan="columns.length"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Virtualizer } from '@cat-kit/fe'
import { onBeforeUnmount, provide, shallowRef, useTemplateRef, watch } from 'vue'

import TBody from './components/tbody.vue'

const ROW_COUNT = 2000
const COLUMN_COUNT = 20

const scrollerRef = useTemplateRef<HTMLDivElement>('scroller')
const topSpacerRowRef = useTemplateRef<HTMLTableRowElement>('topSpacerRow')
const bottomSpacerRowRef = useTemplateRef<HTMLTableRowElement>('bottomSpacerRow')

const allList: Record<string, any>[] = Array.from({ length: ROW_COUNT }, (_, index) => ({
  id: index,
  name: `Row ${index}`,
  age: Math.floor(Math.random() * 100)
}))

const columns = Array.from({ length: COLUMN_COUNT }, (_, index) => ({
  key: index % 2 === 0 ? 'name' : 'age',
  label: `Column ${index}`
}))

const virtualList = shallowRef<
  (Record<string, any> & { index: number; start: number; end: number; size: number })[]
>([])
const measured = new Set<number>()

provide('virtualList', virtualList)
provide('measured', measured)

const virtualizer = new Virtualizer({
  count: ROW_COUNT,
  estimateSize: () => 45,
  getItemKey: (index) => allList[index]!.id
})

provide('virtualizer', virtualizer)

function writeSpacer(el: HTMLTableRowElement | null, height: number): void {
  if (el) el.style.height = `${height}px`
}

watch(scrollerRef, (el) => {
  if (el) virtualizer.connect(el)
})

const unsubscribe = virtualizer.subscribe((snapshot) => {
  writeSpacer(topSpacerRowRef.value, snapshot.beforeSize)
  writeSpacer(bottomSpacerRowRef.value, snapshot.afterSize)

  virtualList.value = snapshot.items.map((item) => ({
    ...item,
    ...allList[item.index]!
  }))
})

onBeforeUnmount(() => {
  unsubscribe()
  virtualizer.destroy()
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
  display: table;
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
</style>
