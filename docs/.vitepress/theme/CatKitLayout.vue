<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import InkBackground from './components/InkBackground.vue'

// 将解构出的 Layout 重命名为 DefaultLayout，避免与当前组件名冲突
const { Layout: DefaultLayout } = DefaultTheme
</script>

<template>
  <DefaultLayout>
    <template #layout-bottom>
      <InkBackground />
    </template>
  </DefaultLayout>
</template>
