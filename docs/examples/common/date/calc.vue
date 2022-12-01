<template>
  <!-- 加10天 -->
  <div>{{ date('2022-02-14').calc(10, 'days').format() }}</div>

  <!-- 减10天 -->
  <div>{{ date('2022-02-14').calc(-10, 'days').format() }}</div>

  <!-- 加1个月 -->
  <div>{{ date('2022-02-14').calc(1, 'months').format() }}</div>

  <!-- 加一个星期 -->
  <div>{{ date('2022-02-14').calc(1, 'weeks').format() }}</div>
</template>

<script lang="ts" setup>
import { date } from 'cat-kit'
</script>
