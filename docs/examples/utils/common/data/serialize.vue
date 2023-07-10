<template>
  <div>
    <div>序列化data1: {{ serialize(data1) }}</div>
    <div>序列化data2: {{ serialize(data2) }}</div>

    <div>反序列化a=1: {{ deserialize('a=1') }}</div>
    <div>反序列化a="1": {{ deserialize('a="1"') }}</div>
  </div>
</template>

<script lang="ts" setup>
import { serialize, deserialize } from '@cat-kit/fe'

const data1 = { a: 1 }
const data2 = { a: '1' }
</script>
