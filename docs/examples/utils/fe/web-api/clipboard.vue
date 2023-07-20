<template>
  <div>
    <input type="text" placeholder="输入" style="border: 1px solid #ccc;" v-model="text" />
    <a style="cursor: pointer;" @click="copy">复制</a>

    <a @click="handleImport">从剪切板中导入</a>
  </div>
</template>

<script lang="ts" setup>
import { clipboard } from '@cat-kit/fe'
import { shallowRef } from 'vue'

const text = shallowRef('')

const copy = async () => {
  await clipboard.copy(text.value)
  alert('复制成功, 粘贴测试')
}

const handleImport = async () => {
  const data = await clipboard.readText()
  alert(`当前导入的内容为: ${data}`)
}
</script>
