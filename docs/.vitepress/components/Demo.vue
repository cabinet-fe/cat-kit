<template>
  <!-- 显示示例 -->
  <ClientOnly>
    <div class="demo-box">
      <component v-if="demos" :is="_demos[path]" v-bind="$attrs" />
    </div>
  </ClientOnly>

  <!-- 源代码 -->
  <div class="source-container" v-html="decodedCode"></div>
</template>

<script lang="ts" setup>
import { PropType, computed, shallowRef } from 'vue'

const props = defineProps({
  /** demo列表 */
  demos: {
    type: Object as PropType<Record<string, any>>,
    required: true
  },

  /** 当前指定的渲染路径 */
  path: {
    type: String,
    required: true
  },

  /** 源代码 */
  source: {
    type: String
  }
})

const decodedCode = computed(() => {
  return decodeURIComponent(props.source || '')
})

const _demos = computed(() => {
  const { demos } = props
  if (!demos) return {}
  return Object.keys(demos).reduce(
    (acc, cur) => {
      const key = cur.match(/examples\/(.+)\.vue$/)?.[1] || 'default'
      acc[key] = demos[cur].default
      return acc
    },
    {} as Record<string, any>
  )
})
</script>

<script lang="ts">
export default {
  name: 'VDemo'
}
</script>

<style scoped>
.demo-box {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.menus {
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: flex-start;

  align-items: center;
  border-radius: 8px;
  margin-bottom: -12px;
}

.menu-item {
  list-style: none;
  display: inline;
  padding: 0;
  margin: 0;
  cursor: pointer;
  padding: 6px 0;
  margin-right: 12px;
  color: var(--vp-c-text-2);
}

.menu-item--active {
  color: var(--vp-c-brand);
}

.source-container {
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  position: relative;
  padding-left: 32px;
  background-color: var(--vp-code-block-bg);
}

.source-container :deep(.line-numbers) {
  position: absolute;
  top: 0;
  left: 0;
  color: var(--vp-code-line-number-color);
  font-size: 14px;
  width: 32px;
  font-family: var(--vp-font-family-mono);
  line-height: 24px;
  text-align: center;
  border-right: 1px solid #ccc;
  padding: 12px 0;
  box-sizing: border-box;
}

.source-container :deep(.line-number) {
  /* line-height: 18px; */
  display: block;
}

.source-container :deep(pre) {
  overflow-x: auto;
  margin: 0;
  padding: 12px 12px;
  background-color: transparent!important;
}

.source-container :deep(code) {
  min-width: 100%;
  display: block;
  white-space: pre;
}
</style>
