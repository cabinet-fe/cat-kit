<template>
  <div>{{date('2022-02-14').compare('2022-03-14')}}</div>

  <div>到明年高考还有 {{date().compare(date(`${date().year + 1}-06-07`))}} 天</div>
</template>

<script lang="ts" setup>
import { date } from 'cat-kit'
</script>