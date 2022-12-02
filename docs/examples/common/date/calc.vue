<template>
  <div>2022-02-14加上10天是: {{ d.calc(10, 'days').format() }}</div>

  <div>2022-02-14减去10天是: {{ d.calc(-10, 'days').format() }}</div>

  <div>2022-02-14加上1个月是: {{ d.calc(1, 'months').format() }}</div>

  <div>2022-02-14加上一个星期是: {{ d.calc(1, 'weeks').format() }}</div>
</template>

<script lang="ts" setup>
import { date } from 'cat-kit'

const d = date('2022-02-14')
</script>
