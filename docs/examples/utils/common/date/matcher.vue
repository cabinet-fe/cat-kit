<template>
  <div>今天是周{{ date('2022-02-14').format('w')}}</div>
  <div>WeekDay:{{ date('2022-02-14').format('ww')}}</div>
</template>

<script lang="ts" setup>
import { date } from 'cat-kit'

// 这是一个增加了周几替换的匹配器
date.setMatcher('w+', (date: Date, len: number) => {
  if (len === 1) {
    return '' + date.getDay()
  } else {
    return '0' + date.getDay()
  }
})
</script>
