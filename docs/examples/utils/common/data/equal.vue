<template>
<div>
  <div>a和b结构是否相等: {{ equal(a, b) }}</div>
  <div>c和d结构是否相等: {{ equal(c, d) }}</div>
  <div>c和d的id是否相等: {{ equal(c, d, 'id') }}</div>
</div>
</template>

<script lang="ts" setup>
import {  equal } from '@cat-kit/fe'
let a = { name: '张三' }
let b = { name: '张三' }

let c = { name: '张三', id: '1' }
let d = { name: '张三', id: '1', age: 20 }
</script>