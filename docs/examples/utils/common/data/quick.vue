<template>
  <div>
    <div>原始数据: {{ rawData }}</div>
    <div>omit数据: {{ data }}</div>
  </div>

</template>

<script lang="ts" setup>
import { omit } from '@cat-kit/fe'

const rawData = { id: 1, name: '张三', age: 20 }
const data = omit(rawData, ['id'])
</script>