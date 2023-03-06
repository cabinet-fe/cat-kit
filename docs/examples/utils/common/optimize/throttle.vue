<template>
  <div>
    <div>2秒钟内可以点击成功一次</div>
    <v-button @click="increase">点击了{{ count }}次</v-button>
    <br />

    <div>2秒钟内可以点击成功一次并回调</div>
    <v-button @click="increaseWithCallback">点击了{{ count }}次</v-button>
  </div>
</template>

<script lang="ts" setup>
import { throttle } from '@cat-kit/fe'
import { ref } from 'vue'

const count = ref(0)

const increase = throttle(
  () => {
    count.value++
  },
  2000,
  () => {}
)

const increaseWithCallback = throttle(
  () => {
    return count.value + 1
  },
  2000,
  ret => {
    console.log('回调触发了, 结果是: ' + ret)
    count.value = ret
  }
)
</script>
