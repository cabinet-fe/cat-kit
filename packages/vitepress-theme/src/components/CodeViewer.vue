<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** 高亮后的 HTML 代码 */
  highlightedCode: string
  /** 代码行数 */
  lineCount: number
}>()

const lineNumbers = computed(() =>
  Array.from({ length: props.lineCount }, (_, i) => i + 1)
)
</script>

<template>
  <div class="code-viewer">
    <div class="line-numbers" aria-hidden="true">
      <span v-for="n in lineNumbers" :key="n" class="line-number">{{ n }}</span>
    </div>
    <div class="code-content" v-html="highlightedCode"></div>
  </div>
</template>

<style scoped>
.code-viewer {
  background-color: var(--vp-c-bg-alt);
  height: 100%;
  overflow: auto;
  display: flex;
  align-items: flex-start;
}

.line-numbers {
  position: relative;
  flex-shrink: 0;
  width: 32px;
  padding: 20px 0;
  text-align: center;
  font-family: var(--vp-font-family-mono);
  line-height: var(--vp-code-line-height);
  font-size: var(--vp-code-font-size);
  color: var(--ink-light);
  border-right: 1px solid var(--ink-trace);
  user-select: none;
}

.line-number {
  display: block;
  line-height: var(--vp-code-line-height);
}

.code-content {
  flex: 1;
  min-width: 0;
}

.code-content :deep(pre) {
  margin: 0;
  padding: 20px 0;
  background: transparent;
  overflow-x: auto;
}

.code-content :deep(code) {
  display: block;
  padding: 0 24px;
  width: fit-content;
  min-width: 100%;
  line-height: var(--vp-code-line-height);
  font-size: var(--vp-code-font-size);
  color: var(--vp-c-text-2);
}

.code-content :deep(.shiki) {
  background: transparent !important;
}

/* 响应式 */
@media (max-width: 640px) {
  .line-numbers {
    width: 28px;
    padding-top: 16px;
  }

  .code-content :deep(pre) {
    padding: 16px 0;
  }

  .code-content :deep(code) {
    padding: 0 16px;
  }
}
</style>
