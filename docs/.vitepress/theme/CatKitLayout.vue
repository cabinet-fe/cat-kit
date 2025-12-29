<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed, defineAsyncComponent } from 'vue'

const CloudPatterns = defineAsyncComponent(
  () => import('./components/CloudPatterns.vue')
)
const SealStamp = defineAsyncComponent(
  () => import('./components/SealStamp.vue')
)
const BrushStrokes = defineAsyncComponent(
  () => import('./components/BrushStrokes.vue')
)

const { Layout: DefaultLayout } = DefaultTheme
const { frontmatter } = useData()

// 只在首页显示首页专用装饰
const isHomePage = computed(() => frontmatter.value.layout === 'home')
</script>

<template>
  <DefaultLayout>
    <!-- 首页专用装饰 - 添加条件渲染 -->
    <template #home-hero-before>
      <template v-if="isHomePage">
        <CloudPatterns position="top" />
        <SealStamp />
      </template>
    </template>

    <template #home-features-before>
      <BrushStrokes v-if="isHomePage" />
    </template>
  </DefaultLayout>
</template>

<style>
/* 全局 prefers-reduced-motion 支持 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
