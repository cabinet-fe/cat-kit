<script setup lang="ts">
import { ref, computed, type DefineComponent } from 'vue'
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
import CodeViewer from './CodeViewer.vue'
import { useFullscreen, useDraggable } from '../composables'

const props = defineProps<{
  is?: DefineComponent
  path: string
  highlightCode?: string
  code?: string
  lineCount?: number
}>()

// 视图状态
const viewMode = ref<'preview' | 'code'>('preview')
const copied = ref(false)
const showConsole = ref(false)
const consoleRef = ref<InstanceType<typeof Console>>()

// 全屏模式
const {
  isFullscreen,
  enter: enterFullscreen,
  exit: exitFullscreen
} = useFullscreen()

// 控制台高度拖拽
const { value: consoleHeight, onDragStart } = useDraggable({
  initial: 280,
  min: 80,
  max: 500
})

// 解码后的代码
const decodedCode = computed(() =>
  props.code ? decodeURIComponent(props.code) : ''
)
const decodedHighlightCode = computed(() =>
  props.highlightCode ? decodeURIComponent(props.highlightCode) : ''
)

// 控制台日志数量
const consoleLogsCount = computed(() => consoleRef.value?.logs?.length ?? 0)

// 操作方法
async function copyCode() {
  try {
    await clipboard.copy(decodedCode.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (e) {
    console.error(e)
  }
}

function toggleView() {
  viewMode.value = viewMode.value === 'preview' ? 'code' : 'preview'
}

function toggleConsole() {
  showConsole.value = !showConsole.value
}

function clearConsole() {
  consoleRef.value?.clearLogs()
}

function handleExitFullscreen() {
  exitFullscreen()
  showConsole.value = false
}
</script>

<template>
  <div class="demo-container" :class="{ fullscreen: isFullscreen }">
    <!-- 全屏顶部操作按钮 -->
    <div v-if="isFullscreen" class="fullscreen-actions">
      <button
        class="fullscreen-btn-item"
        :class="{ copied }"
        :title="copied ? '已复制' : '复制代码'"
        @click="copyCode"
      >
        <Check v-if="copied" :size="20" />
        <Copy v-else :size="20" />
      </button>
      <button
        class="fullscreen-btn-item close"
        title="退出全屏 (ESC)"
        @click="handleExitFullscreen"
      >
        <X :size="20" />
      </button>
    </div>

    <!-- 操作栏 -->
    <div class="demo-actions">
      <span class="demo-lang">vue</span>
      <div class="demo-btns">
        <button
          class="demo-btn"
          :class="{ copied }"
          :title="copied ? '已复制' : '复制代码'"
          @click="copyCode"
        >
          <Check v-if="copied" :size="16" />
          <Copy v-else :size="16" />
        </button>
        <button
          class="demo-btn"
          :class="{ active: viewMode === 'code' }"
          :title="viewMode === 'preview' ? '查看源码' : '查看示例'"
          @click="toggleView"
        >
          <Code v-if="viewMode === 'preview'" :size="16" />
          <Eye v-else :size="16" />
        </button>
        <button
          class="demo-btn fullscreen-btn"
          title="全屏查看"
          @click="enterFullscreen"
        >
          <Maximize2 :size="16" />
        </button>
      </div>
    </div>

    <div class="demo-content">
      <!-- 预览区域 -->
      <div
        v-show="isFullscreen || viewMode === 'preview'"
        class="demo-preview-panel"
      >
        <div class="demo-preview-wrapper">
          <div v-if="!is" class="demo-error">
            <AlertCircle :size="18" />
            <span
              >Demo 文件不存在: <code>examples/{{ path }}</code></span
            >
          </div>
          <component v-else :is="is" />
        </div>

        <!-- 全屏模式控制台 -->
        <div v-if="isFullscreen" class="console-area">
          <div
            v-if="showConsole"
            class="console-drag-bar"
            @mousedown="onDragStart"
          />
          <div class="console-toolbar">
            <button
              class="console-toggle-btn"
              :class="{ active: showConsole }"
              :title="showConsole ? '关闭控制台' : '打开控制台'"
              @click="toggleConsole"
            >
              <Terminal :size="12" />
              <span>控制台</span>
              <span v-if="consoleLogsCount > 0" class="console-count">
                {{ consoleLogsCount }}
              </span>
            </button>
            <button
              v-if="showConsole"
              class="console-clear-btn"
              title="清空控制台"
              :disabled="consoleLogsCount === 0"
              @click="clearConsole"
            >
              <Ban :size="12" />
            </button>
          </div>
          <Console
            v-if="showConsole"
            ref="consoleRef"
            :active="showConsole"
            :style="{ height: consoleHeight + 'px' }"
          />
        </div>
      </div>

      <!-- 代码区域 -->
      <div
        v-show="isFullscreen || viewMode === 'code'"
        class="demo-source-panel"
      >
        <CodeViewer
          :highlighted-code="decodedHighlightCode"
          :line-count="lineCount || 1"
        />
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
  inset: 0;
  margin: 0;
  border-radius: 0;
  z-index: 1000;
}

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
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
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

/* 内容区域 */
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

.fullscreen .demo-preview-panel {
  border-left: 1px solid var(--ink-trace);
  max-height: none;
}

.demo-preview-wrapper {
  flex: 1;
  padding: 20px;
  background-image: radial-gradient(var(--ink-trace) 1px, transparent 1px);
  background-size: 20px 20px;
  overflow: auto;
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

/* 控制台区域 */
.console-area {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--ink-trace);
}

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
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
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

  .demo-preview-wrapper {
    padding: 16px;
  }
}
</style>
