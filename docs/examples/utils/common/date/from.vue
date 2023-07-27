<template>
  <div>
    <div>{{ date.from('20230727', 'yyyyMMdd').format('yyyy-MM-dd') }}</div>
    <div>{{ date.from('2023^07^27', 'YYYY^MM^dd').format('yyyy-MM-dd') }}</div>
  </div>
</template>

<script lang="ts" setup>
import { date } from '@cat-kit/fe'
</script>
