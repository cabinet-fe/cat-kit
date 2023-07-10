<template>
  <div>
    {{ oneOf(1, [1, 2]) }}

    {{ oneOf(1, [2, 3]) }}
  </div>
</template>

<script lang="ts" setup>
import { oneOf } from '@cat-kit/fe'
</script>