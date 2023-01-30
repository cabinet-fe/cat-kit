<template>
  <!-- 31 -->
  <div>2022-10这个月的最后一天是: {{ date('2022-10').toEndOfMonth().day }}</div>
  <div>2022-10-15这个月的最后一天是:{{ date('2022-10-15').toEndOfMonth().day }}</div>

  <div>本月最后一天是: {{ date().toEndOfMonth().day }}</div>
  <div>10个月后的最后一天是: {{ date().toEndOfMonth(10).day }}</div>

  <div>3个月前的最后一天是: {{ date().calc(-3, 'months').toEndOfMonth().day }}</div>
</template>

<script lang="ts" setup>
import { date } from '@cat-kit/fe'
</script>
