<template>
  <div>
    <textarea class="input" placeholder="输入" v-model="input" />

    <span style="display: inline-block; width: 100px; text-align: center">
      <v-button class="button" @click="handleEncode">编码</v-button>
      <br />
      <v-button class="button" @click="handleDecode">解码</v-button>
    </span>

    <textarea class="input" placeholder="输出" readonly :value="output" />
  </div>
</template>

<script lang="ts" setup>
import { base64 } from '@cat-kit/fe'
import { shallowRef } from 'vue'

const input = shallowRef('')
const output = shallowRef('')

const handleEncode = () => {
  output.value = base64.encode(input.value)
}
const handleDecode = () => {
  output.value = base64.decode(input.value)
}
</script>

<style scoped>
textarea {
  border: 1px solid #ccc;
  vertical-align: top;
}
</style>
