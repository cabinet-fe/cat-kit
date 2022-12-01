<template>
  <!-- 对此刻的日期默认使用yyyy-MM-dd格式化 -->
  <div>{{ date().format() }}</div>

  <!-- 可以传入一个日期， 日期对象， 时间戳或者由date()生成的对象 -->
  <div>{{ date('2022-02-14').format('yyyy/MM/dd')}}</div>
  <div>{{ date(1644796800000).format('yyyy/MM/dd')}}</div>
  <div>{{ date(1644796800000).format('yyyy-MM-dd hh:mm:ss')}}</div>
</template>

<script lang="ts" setup>
import { date } from 'cat-kit'
</script>
