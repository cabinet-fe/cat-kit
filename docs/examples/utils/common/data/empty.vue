<template>
  <div>
    <div v-for="value of values">
      值 {{ value }} <template v-if="!isEmpty(value)">不</template>为空
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isEmpty } from '@cat-kit/fe'

const values = [
  {}, { name: '张三' }, [], 0, 1, false, true
]
</script>