<template>
  <div class="mermaid-container" v-html="svg" v-if="svg"></div>
  <div v-else class="mermaid-loading">图表加载中...</div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{ code: string }>()
const svg = ref('')
const { isDark } = useData()

const render = async () => {
  if (!props.code || typeof window === 'undefined') return

  try {
    const mermaid = (await import('mermaid')).default

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark.value ? 'dark' : 'default'
    })

    const decodedCode = decodeURIComponent(props.code)
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`

    const { svg: renderSvg } = await mermaid.render(id, decodedCode)
    svg.value = renderSvg
  } catch (e) {
    console.error('Mermaid render error', e)
    svg.value = `<pre class="mermaid-error">${e instanceof Error ? e.message : '渲染图表时发生错误'}</pre>`
  }
}

onMounted(() => {
  render()
})

watch(isDark, () => {
  render()
})
</script>

<style scoped>
.mermaid-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  overflow-x: auto;
  min-height: 100px;
}
.mermaid-loading,
.mermaid-error {
  margin: 1rem 0;
  padding: 1rem;
  text-align: center;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
}
.mermaid-error {
  color: var(--vp-c-danger-1);
}
</style>
