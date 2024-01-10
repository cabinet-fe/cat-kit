<template>
  <div>
    <div>字符串：</div>
    <textarea v-model="text" placeholder="原文"> </textarea>
    <div>
      <v-button @click="handleCalcStringMD5">计算</v-button>
      结果: {{ textMd5 }}
    </div>

    <div>字符串：</div>
  </div>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue'
import { MD5 } from '@cat-kit/crypto'

const text = shallowRef('')
const textMd5 = shallowRef('')

const handleCalcStringMD5 = async () => {
  textMd5.value = await MD5(text.value)
}
</script>

<style lang="scss" scoped></style>
