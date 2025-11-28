<template>
  <div>
    <button @click="setInfo">设置信息</button>
    <button @click="getInfo">获取信息</button>
    <button @click="removeInfo">删除信息</button>
  </div>
</template>

<script lang="ts" setup>
import { storage, storageKey } from '@cat-kit/fe'

// 类型安全
const INFO_KEY = storageKey<{
  name: string
  age: number
}>('info')

function setInfo() {
  storage.local.set(INFO_KEY, {
    name: 'admin',
    age: 18
  }, 3600)
}

function getInfo() {
  const info = storage.local.get(INFO_KEY)
  console.log(info)
}

function removeInfo() {
  storage.local.remove(INFO_KEY)
}
</script>