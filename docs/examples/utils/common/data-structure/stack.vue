<template>
  <div>
    <div>检查字符串中的括号是否匹配. 结果: {{ matched ? '匹配' : '不匹配' }}</div>
    <input
      style="border: 1px solid #ccc"
      type="text"
      v-model="str"
      placeholder="表达式"
    />

    <br/><br />

    <div>遍历树</div>
  </div>
</template>

<script lang="ts" setup>
import { Stack } from '@cat-kit/fe'
import { computed, shallowRef } from 'vue'

const str = shallowRef('10 / (4 - 2)')

const matched = computed(() => {
  const stack = new Stack()

  let i = 0

  while (i < str.value.length) {
    let char = str.value[i]
    i++
    if (char === '(') {
      stack.push(char)
      continue
    }

    if (char === ')') {
      let ret = stack.pop()
      if (!ret) return false
      continue
    }
  }

  return stack.isEmpty()
})
</script>
