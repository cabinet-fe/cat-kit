<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import InkBackground from './components/InkBackground.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #layout-bottom>
      <InkBackground />
    </template>
  </Layout>
</template>

