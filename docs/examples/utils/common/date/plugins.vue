<template>
  <div>
    今天是 {{date().format('ww')}}
  </div>
  <div>
    今天是 {{date().format('WW')}}
  </div>
</template>

<script lang="ts" setup>
import { date, Dater } from 'cat-kit'

const pluginMatcher = (dater: typeof Dater) => {
  dater.setMatcher('w+', (date: Date, len: number) => {
    return '周' + date.getDay()
  })
  dater.setMatcher('W+', (date: Date, len: number) => {
    return '星期' + date.getDay()
  })
}

date.use(pluginMatcher)
</script>
