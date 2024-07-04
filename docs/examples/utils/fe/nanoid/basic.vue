<template>
  <div>
    <div>默认：{{ nanoid() }}</div>

    <div>自定义： {{ customNanoId() }}</div>
  </div>
</template>

<script lang="ts" setup>
import { nanoid, customAlphabet } from '@cat-kit/fe'

const customNanoId = customAlphabet('ABCDabcd0123456789', 10)
</script>
