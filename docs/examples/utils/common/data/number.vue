<template>
<div>
  <div>保留小数位数, {{ n(3.1415926).fixed(2) }}</div>
  <div>格式化为货币, {{ n(-123456).format('money') }}</div>
  <div>格式化为货币并加上货币符号, {{ formatter.format(-123456) }}</div>
  <div>精确计算, {{ n.calc('33 + (22 + 55) - (3 + 5 / (2 + 3))') }}</div>
</div>
</template>

<script lang="ts" setup>
import { n } from '@cat-kit/fe'

const formatter = n.formatter({
  precision: 2,
  style: 'currency',
  currency: 'CNY'
})
</script>