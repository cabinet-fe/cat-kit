<script setup lang="ts">
import { ref, computed, type DefineComponent, onUnmounted } from 'vue'
import { clipboard } from '@cat-kit/fe'
import {
  X,
  Check,
  Copy,
  Code,
  Eye,
  Maximize2,
  AlertCircle,
  Terminal,
  Ban
} from 'lucide-vue-next'
import Console from './Console.vue'

const props = defineProps<{
  is?: DefineComponent
  path: string
  highlightCode?: string
  code?: string
  lineCount?: number
}>()

const viewMode = ref<'preview' | 'code'>('preview')
const isFullscreen = ref(false)
const copied = ref(false)
const showConsoleInFullscreen = ref(false)
const consoleHeight = ref(280)
const fullscreenConsoleRef = ref<InstanceType<typeof Console>>()

// 拖拽相关
const isDragging = ref(false)
const startY = ref(0)
const startHeight = ref(0)

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

const consoleLogsCount = computed(() => {
  return fullscreenConsoleRef.value?.logs?.length ?? 0
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

const toggleFullscreenConsole = () => {
  showConsoleInFullscreen.value = !showConsoleInFullscreen.value
}

const clearConsole = () => {
  fullscreenConsoleRef.value?.clearLogs()
}

const enterFullscreen = () => {
  isFullscreen.value = true
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
}

const exitFullscreen = () => {
  isFullscreen.value = false
  showConsoleInFullscreen.value = false
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    exitFullscreen()
  }
}

// 拖拽处理
const onDragStart = (e: MouseEvent) => {
  isDragging.value = true
  startY.value = e.clientY
  startHeight.value = consoleHeight.value
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.body.style.cursor = 'ns-resize'
  document.body.style.userSelect = 'none'
}

const onDragMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  const deltaY = startY.value - e.clientY
  consoleHeight.value = Math.max(80, Math.min(500, startHeight.value + deltaY))
}

const onDragEnd = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="demo-container" :class="{ fullscreen: isFullscreen }">
    <!-- 全屏顶部操作按钮 -->
    <div v-if="isFullscreen" class="fullscreen-actions">
      <button
        class="fullscreen-btn-item"
        :class="{ copied }"
        @click="copyCode"
        :title="copied ? '已复制' : '复制代码'"
      >
        <Check v-if="copied" :size="20" />
        <Copy v-else :size="20" />
      </button>
      <button
        class="fullscreen-btn-item close"
        @click="exitFullscreen"
        title="退出全屏 (ESC)"
      >
        <X :size="20" />
      </button>
    </div>

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
          <Check v-if="copied" :size="16" />
          <Copy v-else :size="16" />
        </button>
        <button
          class="demo-btn"
          :class="{ active: viewMode === 'code' }"
          @click="toggleView"
          :title="viewMode === 'preview' ? '查看源码' : '查看示例'"
        >
          <Code v-if="viewMode === 'preview'" :size="16" />
          <Eye v-else :size="16" />
        </button>
        <!-- 最大化按钮（移动端隐藏） -->
        <button
          class="demo-btn fullscreen-btn"
          @click="enterFullscreen"
          title="全屏查看"
        >
          <Maximize2 :size="16" />
        </button>
      </div>
    </div>

    <div class="demo-content">
      <!-- 预览区域 -->
      <div
        class="demo-preview-panel"
        v-show="isFullscreen || viewMode === 'preview'"
      >
        <div class="demo-preview-wrapper">
          <div v-if="!is" class="demo-error">
            <span class="error-icon">
              <AlertCircle :size="18" />
            </span>
            <span
              >Demo 文件不存在: <code>examples/{{ path }}</code></span
            >
          </div>
          <component v-else :is="is" />
        </div>
        <!-- 全屏模式下的控制台区域 -->
        <div v-if="isFullscreen" class="fullscreen-console-area">
          <!-- 拖拽条 -->
          <div
            v-if="showConsoleInFullscreen"
            class="console-drag-bar"
            @mousedown="onDragStart"
          ></div>
          <!-- 控制台工具栏 -->
          <div class="console-toolbar">
            <button
              class="console-toggle-btn"
              :class="{ active: showConsoleInFullscreen }"
              @click="toggleFullscreenConsole"
              :title="showConsoleInFullscreen ? '关闭控制台' : '打开控制台'"
            >
              <Terminal :size="12" />
              <span>控制台</span>
              <span v-if="consoleLogsCount > 0" class="console-count">{{
                consoleLogsCount
              }}</span>
            </button>
            <button
              v-if="showConsoleInFullscreen"
              class="console-clear-btn"
              @click="clearConsole"
              title="清空控制台"
              :disabled="consoleLogsCount === 0"
            >
              <Ban :size="12" />
            </button>
          </div>
          <!-- 控制台内容 -->
          <Console
            v-if="showConsoleInFullscreen"
            ref="fullscreenConsoleRef"
            :active="showConsoleInFullscreen"
            :style="{ height: consoleHeight + 'px' }"
          />
        </div>
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
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.demo-container:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--ink-light);
}

/* 全屏样式 */
.demo-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  border-radius: 0;
  z-index: 1000;
}

/* 全屏顶部操作按钮组 */
.fullscreen-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1010;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fullscreen-btn-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--ink-trace);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease,
    border-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fullscreen-btn-item:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
  border-color: var(--ink-light);
}

.fullscreen-btn-item.copied {
  color: var(--vp-c-green-1);
  border-color: var(--vp-c-green-1);
}

.fullscreen-btn-item.close:hover {
  color: var(--vp-c-danger-1);
  border-color: var(--vp-c-danger-1);
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
  display: flex;
  flex-direction: column;
  background-color: var(--vp-c-bg);
  overflow: hidden;
  max-height: 500px;
}

.demo-preview-wrapper {
  flex: 1;
  padding: 20px;
  background-image: radial-gradient(var(--ink-trace) 1px, transparent 1px);
  background-size: 20px 20px;
  overflow: auto;
}

.fullscreen .demo-preview-panel {
  border-left: 1px solid var(--ink-trace);
  max-height: none;
}

/* 全屏模式控制台区域 */
.fullscreen-console-area {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--ink-trace);
}

/* 控制台拖拽条 */
.console-drag-bar {
  height: 4px;
  cursor: ns-resize;
  background-color: var(--ink-trace);
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.console-drag-bar:hover {
  background-color: var(--vp-c-brand-1);
}

/* 控制台工具栏 */
.console-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  background-color: var(--vp-c-bg);
  flex-shrink: 0;
}

.console-toggle-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--ink-light);
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: color 0.2s;
}

.console-toggle-btn:hover {
  color: var(--ink-heavy);
}

.console-toggle-btn.active {
  color: var(--vp-c-brand-1);
}

.console-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: 600;
  color: var(--vp-c-bg);
  background-color: var(--ink-light);
  border-radius: 8px;
}

.console-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--ink-light);
  border-radius: 3px;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.console-clear-btn:hover:not(:disabled) {
  color: var(--ink-heavy);
  background-color: var(--vp-c-bg-soft);
}

.console-clear-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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
  position: relative;
  flex: 1;
  background-color: var(--vp-c-bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 500px;
}

.fullscreen .demo-source-panel {
  max-height: none;
}

.demo-source {
  background-color: var(--vp-c-bg-alt);
  height: 100%;
  overflow: auto;
  display: flex;
  align-items: flex-start;
}

.line-numbers-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 32px;
  padding-top: 20px;
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

/* 操作栏 */
.demo-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--vp-c-bg);
  border-bottom: 1px solid var(--ink-trace);
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
  transition: color 0.2s ease, background-color 0.2s ease,
    border-color 0.2s ease;
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
  .fullscreen-btn {
    display: none;
  }

  .demo-preview-panel {
    padding: 16px;
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
