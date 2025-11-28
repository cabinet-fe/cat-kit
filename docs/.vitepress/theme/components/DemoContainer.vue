<script setup lang="ts">
import { ref, computed, type DefineComponent } from 'vue'
import { clipboard } from '@cat-kit/fe'

const props = defineProps<{
  is?: DefineComponent
  path: string
  highlightCode?: string
  code?: string
  lineCount?: number
}>()

const showSource = ref(false)
const copied = ref(false)

const decodedCode = computed(() => (props.code ? decodeURIComponent(props.code) : ''))
const decodedHighlightCode = computed(() =>
  props.highlightCode ? decodeURIComponent(props.highlightCode) : ''
)

const lineNumbers = computed(() => {
  const count = props.lineCount || 1
  return Array.from({ length: count }, (_, i) => i + 1)
})

const copyCode = async () => {
  try {
    await clipboard.copy(decodedCode.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (e) {
    console.error(e)
  }
}

const toggleSource = () => {
  showSource.value = !showSource.value
}
</script>

<template>
  <div class="demo-container">
    <!-- 预览区域 -->
    <div class="demo-preview">
      <div v-if="!is" class="demo-error">
        <span class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </span>
        <span>Demo 文件不存在: <code>examples/{{ path }}</code></span>
      </div>
      <component :is="is" v-else />
    </div>

    <!-- 代码区域 -->
    <div v-show="showSource" class="demo-source-wrapper">
      <div class="demo-source">
        <div class="line-numbers-wrapper" aria-hidden="true">
          <span v-for="n in lineNumbers" :key="n" class="line-number">{{ n }}</span>
        </div>
        <div class="code-content" v-html="decodedHighlightCode"></div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="demo-actions">
      <span class="demo-lang">vue</span>
      <div class="demo-btns">
        <button class="demo-btn" :class="{ copied }" @click="copyCode" :title="copied ? '已复制' : '复制代码'">
          <svg v-if="copied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="demo-btn" :class="{ active: showSource }" @click="toggleSource"
          :title="showSource ? '收起源码' : '查看源码'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin: 16px 0;
  background-color: var(--vp-c-bg);
}

/* 预览区域 */
.demo-preview {
  padding: 24px;
  border-radius: 8px 8px 0 0;
}

.demo-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: var(--vp-c-danger-soft);
  border-radius: 6px;
  color: var(--vp-c-danger-1);
  font-size: 14px;
}

.demo-error code {
  padding: 2px 6px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.error-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* 代码区域 */
.demo-source-wrapper {
  background-color: var(--vp-code-block-bg);
}

.demo-source {
  position: relative;
  /* max-height: 400px; */
  overflow: auto;
  padding-left: 32px;
  background-color: var(--vp-code-block-bg);
}

.line-numbers-wrapper {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 3;
  width: 32px;
  padding-top: 20px;
  text-align: center;
  font-family: var(--vp-font-family-mono);
  line-height: var(--vp-code-line-height);
  font-size: var(--vp-code-font-size);
  color: var(--vp-code-line-number-color);
  border-right: 1px solid var(--vp-code-block-divider-color);
  user-select: none;
}

.line-number {
  display: block;
  line-height: var(--vp-code-line-height);
}

.code-content :deep(pre) {
  position: relative;
  z-index: 1;
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
  color: var(--vp-code-block-color);
}

.code-content :deep(.shiki) {
  background: transparent !important;
}

/* 操作栏 - 添加粘性定位 */
.demo-actions {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--vp-code-block-bg);
  border-top: 1px solid var(--vp-c-divider);
  border-radius: 0 0 8px 8px;
  z-index: 10;
}

.demo-lang {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-code-lang-color);
  text-transform: uppercase;
  user-select: none;
}

.demo-btns {
  display: flex;
  align-items: center;
  gap: 4px;
}

.demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--vp-c-text-2);
  background-color: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

.demo-btn.active {
  color: var(--vp-c-brand-1);
}

.demo-btn.copied {
  color: var(--vp-c-green-1);
}

/* 响应式 */
@media (max-width: 640px) {
  .demo-preview {
    padding: 16px;
  }

  .demo-source {
    max-height: 300px;
    padding-left: 28px;
  }

  .line-numbers-wrapper {
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
