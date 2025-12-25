<script setup lang="ts">
import { ref, computed, type DefineComponent, onUnmounted } from 'vue'
import { clipboard } from '@cat-kit/fe'

const props = defineProps<{
  is?: DefineComponent
  path: string
  highlightCode?: string
  code?: string
  lineCount?: number
}>()

const containerRef = ref<HTMLElement | null>(null)
const viewMode = ref<'preview' | 'code'>('preview')
const isFullscreen = ref(false)
const copied = ref(false)

const decodedCode = computed(() =>
  props.code ? decodeURIComponent(props.code) : ''
)
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

const toggleView = () => {
  viewMode.value = viewMode.value === 'preview' ? 'code' : 'preview'
}

// 记录原始样式，用于恢复
let originalRect: DOMRect | null = null

const enterFullscreen = async () => {
  if (!containerRef.value) return

  // 1. 记录当前位置
  const el = containerRef.value
  originalRect = el.getBoundingClientRect()

  // 2. 创建占位元素（保持文档流高度）
  const placeholder = document.createElement('div')
  placeholder.style.width = `${originalRect.width}px`
  placeholder.style.height = `${originalRect.height}px`
  placeholder.style.margin = getComputedStyle(el).margin
  placeholder.id = 'demo-placeholder'
  el.parentElement?.insertBefore(placeholder, el)

  // 3. 设置初始 fixed 状态（在原位置）
  el.style.position = 'fixed'
  el.style.top = `${originalRect.top}px`
  el.style.left = `${originalRect.left}px`
  el.style.width = `${originalRect.width}px`
  el.style.height = `${originalRect.height}px`
  el.style.margin = '0'
  el.style.zIndex = '1000'
  el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'

  // 4. 强制重排
  el.getBoundingClientRect()

  // 5. 切换到全屏状态
  isFullscreen.value = true
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)

  // 6. 动画到全屏位置
  requestAnimationFrame(() => {
    el.style.top = '0'
    el.style.left = '0'
    el.style.width = '100vw'
    el.style.height = '100vh'
    el.style.borderRadius = '0'
  })
}

const exitFullscreen = () => {
  if (!containerRef.value || !originalRect) return

  const el = containerRef.value

  // 1. 动画回到原位置
  el.style.top = `${originalRect.top}px`
  el.style.left = `${originalRect.left}px`
  el.style.width = `${originalRect.width}px`
  el.style.height = `${originalRect.height}px`
  el.style.borderRadius = '6px'

  isFullscreen.value = false

  const onTransitionEnd = () => {
    // 移除事件监听
    el.removeEventListener('transitionend', onTransitionEnd)

    // 恢复样式
    el.style.position = ''
    el.style.top = ''
    el.style.left = ''
    el.style.width = ''
    el.style.height = ''
    el.style.margin = ''
    el.style.zIndex = ''
    el.style.transition = ''
    el.style.borderRadius = ''

    // 移除占位符
    const placeholder = document.getElementById('demo-placeholder')
    if (placeholder) {
      placeholder.remove()
    }

    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
    originalRect = null
  }

  el.addEventListener('transitionend', onTransitionEnd)
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    exitFullscreen()
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>
<route lang="ts">
export default [{ path: 'fe/storage/basic.vue', name: '存储示例' }]
</route>

<template>
  <div
    ref="containerRef"
    class="demo-container"
    :class="{ fullscreen: isFullscreen }"
  >
    <!-- 全屏关闭按钮 -->
    <button
      v-if="isFullscreen"
      class="fullscreen-close"
      @click="exitFullscreen"
      title="退出全屏 (ESC)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <!-- 操作栏 (调整到顶部) -->
    <div class="demo-actions">
      <span class="demo-lang">vue</span>
      <div class="demo-btns">
        <button
          class="demo-btn"
          :class="{ copied }"
          @click="copyCode"
          :title="copied ? '已复制' : '复制代码'"
        >
          <svg
            v-if="copied"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            ></path>
          </svg>
        </button>
        <button
          class="demo-btn"
          :class="{ active: viewMode === 'code' }"
          @click="toggleView"
          :title="viewMode === 'preview' ? '查看源码' : '查看示例'"
        >
          <!-- 查看源码图标 -->
          <svg
            v-if="viewMode === 'preview'"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <!-- 查看示例图标 -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <!-- 最大化按钮 -->
        <button class="demo-btn" @click="enterFullscreen" title="全屏查看">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 3h6v6"></path>
            <path d="M9 21H3v-6"></path>
            <path d="M21 3l-7 7"></path>
            <path d="M3 21l7-7"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="demo-content">
      <!-- 预览区域 -->
      <div
        class="demo-preview-panel"
        v-show="isFullscreen || viewMode === 'preview'"
      >
        <div v-if="!is" class="demo-error">
          <span class="error-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </span>
          <span
            >Demo 文件不存在: <code>examples/{{ path }}</code></span
          >
        </div>
        <component v-else :is="is" />
      </div>

      <!-- 代码区域 -->
      <div
        class="demo-source-panel"
        v-show="isFullscreen || viewMode === 'code'"
      >
        <div class="demo-source">
          <div class="line-numbers-wrapper" aria-hidden="true">
            <span v-for="n in lineNumbers" :key="n" class="line-number">{{
              n
            }}</span>
          </div>
          <div class="code-content" v-html="decodedHighlightCode"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  border: 1px solid var(--ink-trace);
  border-radius: 6px;
  margin: 24px 0;
  background-color: var(--vp-c-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.demo-container:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--ink-light);
}

/* 全屏样式 */
.demo-container.fullscreen {
  /* position: fixed; 由 JS 控制过渡期间的样式，这里只作为状态标记 */
  z-index: 1000; /* 确保优先级 */
}

.fullscreen-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1010;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--ink-trace);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fullscreen-close:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
  transform: scale(1.1);
}

.demo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fullscreen .demo-content {
  flex-direction: row;
}

/* 预览区域 */
.demo-preview-panel {
  flex: 1;
  padding: 20px;
  background-image: radial-gradient(var(--ink-trace) 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: var(--vp-c-bg);
  overflow: auto;
  max-height: 500px;
}

.fullscreen .demo-preview-panel {
  border-left: 1px solid var(--ink-trace);
  height: 100%;
  max-height: none;
}

.demo-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: var(--vp-c-danger-soft);
  border-radius: 4px;
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
.demo-source-panel {
  flex: 1;
  background-color: var(--vp-c-bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 500px;
}

.fullscreen .demo-source-panel {
  border-top: none;
  height: 100%;
  max-height: none;
}

.demo-source {
  position: relative;
  background-color: var(--vp-c-bg-alt);
  height: 100%;
  overflow: auto;
  display: flex;
  align-items: flex-start;
}

.line-numbers-wrapper {
  flex-shrink: 0;
  width: 32px;
  padding-top: 20px;
  position: relative;
  top: unset;
  bottom: unset;
  left: unset;
  text-align: center;
  font-family: var(--vp-font-family-mono);
  line-height: var(--vp-code-line-height);
  font-size: var(--vp-code-font-size);
  color: var(--ink-light);
  border-right: 1px solid var(--ink-trace);
  user-select: none;
  height: auto;
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
  color: var(--vp-c-text-2);
}

.code-content :deep(.shiki) {
  background: transparent !important;
}

/* 操作栏 */
.demo-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--vp-c-bg);
  border-bottom: 1px solid var(--ink-trace);
  border-radius: 6px 6px 0 0;
  z-index: 10;
  position: sticky;
  top: 0;
}

.fullscreen .demo-actions {
  display: none;
}

.demo-lang {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-light);
  text-transform: uppercase;
  user-select: none;
  font-family: var(--vp-font-family-mono);
  letter-spacing: 1px;
}

.demo-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--ink-light);
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  color: var(--ink-heavy);
  background-color: var(--vp-c-bg-soft);
  border-color: var(--ink-trace);
}

.demo-btn.active {
  color: var(--ink-heavy);
  background-color: var(--vp-c-bg-soft);
}

.demo-btn.copied {
  color: var(--vp-c-green-1);
}

/* 响应式 */
@media (max-width: 640px) {
  .demo-preview-panel {
    padding: 16px;
  }

  .demo-source {
    padding-left: 0;
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

  .fullscreen .demo-content {
    flex-direction: column;
  }

  .fullscreen .demo-source-panel {
    border-top: 1px solid var(--ink-trace);
    border-left: none;
  }
}
</style>
