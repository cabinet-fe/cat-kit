<template></template>

<script lang="ts" setup>
import { Virtualizer } from '@cat-kit/fe'

const virtualizer = new Virtualizer({
  count: 100,
  estimateSize: () => 100,
  direction: 'vertical'
})
</script>
