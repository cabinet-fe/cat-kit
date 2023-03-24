<template>
  <div class="box">
    <div>origin: {{ origin }}</div>
    <div>arr: {{ arr }}</div>

    <VRunCode
      title="切割"
      :code="code1"
      :ctx="{
        arr
      }"
    />

    <VRunCode
      title="拼接"
      :code="code2"
      :ctx="{
        arr
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import { shallowReactive } from 'vue'

const origin = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const arr = shallowReactive([...origin])

const code1 = `
return arr.slice(2, 3)
`

const code2 = `
const result = arr.splice(1, 3)
console.log(arr)
return result
`
</script>

<style scoped>
.box > div {
  margin-bottom: 10px;
}
</style>
