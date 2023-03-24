<template>
  <div>
    <div>点击立即执行一次, 后续点击完2秒后执行一次</div>
    <v-button @click="increaseImmediate">点击了{{ count }}次</v-button>
    <br />

    <div>点击完2秒后执行一次</div>
    <v-button @click="increase">点击了{{ count }}次</v-button>
  </div>
</template>

<script lang="ts" setup>
import { debounce } from '@cat-kit/fe'
import { ref } from 'vue'

const count = ref(0)

const increaseImmediate = debounce(() => {
  count.value++
}, 2000)

const increase = debounce(
  () => {
    count.value++
  },
  2000,
  false
)
</script>
