<template>
  <div>
    <input type="text" placeholder="输入" style="border: 1px solid #ccc;" v-model="text" />
    <a style="cursor: pointer;" @click="copy">复制</a>
  </div>
</template>

<script lang="ts" setup>
import { clipboard } from 'cat-kit'
import { shallowRef } from 'vue'

const text = shallowRef('')

const copy = async () => {
  await clipboard.copy(text.value)
  alert('复制成功, 粘贴测试')
}
</script>
