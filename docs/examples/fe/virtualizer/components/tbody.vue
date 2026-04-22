<template>
  <tbody>
    <tr
      v-for="item in virtualList"
      :key="item.id"
      :class="{ 'row-stripe': item.index % 2 === 0 }"
      :ref="(el) => virtualizer.measureElement(item.index, el as Element)"
    >
      <td v-for="(column, idx) in columns" :key="idx">{{ item[column.key] }}</td>
    </tr>
  </tbody>
</template>

<script lang="ts" setup>
import type { Virtualizer } from '@cat-kit/fe'
import { inject, type Ref } from 'vue'

interface Column {
  key: string
  label: string
}

interface Row {
  id: number
  index: number
  [key: string]: unknown
}

defineProps<{
  columns: Column[]
}>()

const virtualizer = inject<Virtualizer>('virtualizer')!
const virtualList = inject<Ref<Row[]>>('virtualList')!
</script>
