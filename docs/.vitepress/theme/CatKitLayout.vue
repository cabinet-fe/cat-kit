<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import InkBackground from './components/InkBackground.vue'
import CloudPatterns from './components/CloudPatterns.vue'
import SealStamp from './components/SealStamp.vue'
import InkParticles from './components/InkParticles.vue'
import BrushStrokes from './components/BrushStrokes.vue'

// 将解构出的 Layout 重命名为 DefaultLayout，避免与当前组件名冲突
const { Layout: DefaultLayout } = DefaultTheme
const { frontmatter } = useData()
</script>

<template>
  <DefaultLayout>
    <!-- 全局装饰：动态墨滴粒子 -->
    <template #layout-top>
      <InkParticles />
    </template>

    <!-- 首页专用装饰 -->
    <template #home-hero-before>
      <CloudPatterns position="top" />
      <SealStamp />
    </template>

    <template #home-hero-after>
    </template>

    <template #home-features-before>
      <BrushStrokes />
    </template>

    <!-- 底部背景层 -->
    <template #layout-bottom>
      <InkBackground />
    </template>
  </DefaultLayout>
</template>
