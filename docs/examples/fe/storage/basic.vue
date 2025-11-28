<template>
  <div>
    查看控制台
  </div>
  <div style="display: flex; gap: 4px">
    <var-button type="primary" @click="setInfo">设置信息</var-button>
    <var-button type="primary" @click="getInfo">获取信息</var-button>
    <var-button type="primary" @click="removeInfo">删除信息</var-button>
  </div>
</template>

<script lang="ts" setup>
import { storageKey, WebStorage } from '@cat-kit/fe'
import { onMounted } from 'vue'

// 类型安全
const INFO_KEY = storageKey<{
  name: string
  age: number
}>('info')

let storage: WebStorage

onMounted(() => {
  storage = new WebStorage(localStorage)
})


function setInfo() {
  storage.set(INFO_KEY, {
    name: 'admin',
    age: 18
  }, 3600)
}

function getInfo() {
  const info = storage.get(INFO_KEY)
  console.log(info)
}

function removeInfo() {
  storage.remove(INFO_KEY)
}
</script>