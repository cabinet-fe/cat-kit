<template>
  <div>
    <div>尝试解析为JSON: {{ safeRun(() => JSON.parse(origin)) }}</div>
    <div>
      尝试解析为JSON并提供一个默认值:
      {{ safeRun(() => JSON.parse(origin), origin) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { safeRun } from '@cat-kit/fe'

const origin = '['
</script>
