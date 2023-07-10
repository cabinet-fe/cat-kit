<template>
<div>
  <div>person: {{ person }}</div>
  <div>result: {{ result }}</div>
  <div>person和result是否相等: {{ person === result }}</div>
  <div>person.school === result.school: {{ person.school === result.school }}</div>
</div>
</template>

<script lang="ts" setup>
import { deepCopy } from '@cat-kit/fe'

const person = { name: '张三', school: { name: '清华大学' } }
const result = deepCopy(person)

</script>