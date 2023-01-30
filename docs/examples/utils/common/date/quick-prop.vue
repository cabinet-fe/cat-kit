<template>
  <div>
    {{ d.year }} 年 {{ d.month }} 月 {{ d.day }} 日 {{ d.hour }} 时
    {{ d.minute }} 分 {{ d.second }} 秒
  </div>
</template>

<script lang="ts" setup>
import { date } from '@cat-kit/fe'
import { onBeforeUnmount, shallowRef } from 'vue'

let d = shallowRef(date())

let timer = setInterval(() => {
  d.value = date()
}, 1000)

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>
