<template>
 <!-- 对此刻的日期默认使用yyyy-MM-dd格式化 -->
 <div>{{ date().format() }}</div>
</template>

<script lang="ts" setup>
import { date } from '@cat-kit/fe'
</script>