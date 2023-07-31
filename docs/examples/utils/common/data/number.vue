<template>
<div>
  <div>保留小数位数, {{ n(3.1415926).fixed(2) }}</div>
  <div>格式化为中国货币, {{ n(-123456).currency('CNY') }}</div>
  <div>格式化为中国大写货币 {{ n(123456.12).currency('CNY_HAN') }}</div>
</div>
</template>

<script lang="ts" setup>
import { n } from '@cat-kit/fe'
</script>