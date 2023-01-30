<template>
  <div>2022-02-14 ~ 2022-03-14相差: {{date('2022-02-14').compare('2022-03-14')}}天</div>

  <div>到明年高考还有 {{date().compare(date(`${date().year + 1}-06-07`))}} 天</div>

  <div>2022-02-14 ~ 2025-03-10相差: {{dis}}</div>
</template>

<script lang="ts" setup>
import { date } from '@cat-kit/fe'

// 可以使用第二个参数来达到更加个性化的需求
const dis = date('2022-02-14').compare('2025-03-10', (y, m, d) => {
  return `${y}年${m}个月${d}天`
})
</script>