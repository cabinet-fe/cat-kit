<script setup lang="ts">
import { ref, toRef } from 'vue'
import { Circle, Info, AlertTriangle, XCircle, Bug } from 'lucide-vue-next'
import { useConsoleInterceptor, type LogEntry } from '../composables'

const props = defineProps<{
  active?: boolean
}>()

const consoleRef = ref<HTMLElement>()

const { logs, clearLogs } = useConsoleInterceptor({
  active: toRef(() => props.active ?? false),
  containerRef: consoleRef
})

/**
 * 格式化日志值为可显示的字符串
 */
function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  if (typeof value === 'function') return `ƒ ${value.name || 'anonymous'}()`
  if (value instanceof Error) return `${value.name}: ${value.message}`

  // 对象和数组尝试 JSON 序列化
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return Array.isArray(value) ? '[Array]' : '[Object]'
    }
  }
  return String(value)
}

/**
 * 获取日志类型对应的图标组件
 */
function getLogIcon(type: LogEntry['type']) {
  const icons = {
    log: Circle,
    info: Info,
    warn: AlertTriangle,
    error: XCircle,
    debug: Bug
  }
  return icons[type]
}

defineExpose({ clearLogs, logs })
</script>

<template>
  <div ref="consoleRef" class="console-logs">
    <div v-if="logs.length === 0" class="console-empty">暂无日志输出</div>
    <div
      v-for="log in logs"
      :key="log.id"
      class="console-entry"
      :class="`log-${log.type}`"
    >
      <span class="log-icon">
        <component :is="getLogIcon(log.type)" :size="12" />
      </span>
      <span class="log-content">
        <template v-for="(arg, index) in log.args" :key="index">
          <span class="log-value">{{ formatValue(arg) }}</span>
          <span v-if="index < log.args.length - 1" class="log-separator">
          </span>
        </template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.console-logs {
  overflow-y: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.5;
  background-color: var(--vp-c-bg-alt);
}

.console-empty {
  padding: 20px;
  text-align: center;
  color: var(--ink-light);
  font-size: 13px;
}

.console-entry {
  display: flex;
  align-items: flex-start;
  padding: 4px 12px;
  border-bottom: 1px solid var(--ink-trace);
  gap: 8px;
}

.console-entry:hover {
  background-color: var(--vp-c-bg-soft);
}

.log-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.log-content {
  flex: 1;
  word-break: break-all;
  white-space: pre-wrap;
}

.log-value {
  color: var(--vp-c-text-1);
}

.log-separator {
  margin: 0 4px;
}

/* 日志类型样式 */
.log-log .log-icon {
  color: var(--ink-light);
}

.log-info .log-icon {
  color: var(--vp-c-brand-1);
}

.log-warn {
  background-color: rgba(234, 179, 8, 0.08);
}
.log-warn .log-icon {
  color: #eab308;
}
.log-warn .log-value {
  color: #ca8a04;
}

.log-error {
  background-color: rgba(239, 68, 68, 0.08);
}
.log-error .log-icon {
  color: #ef4444;
}
.log-error .log-value {
  color: #dc2626;
}

.log-debug .log-icon {
  color: #8b5cf6;
}
.log-debug .log-value {
  color: #7c3aed;
}

/* 滚动条 */
.console-logs::-webkit-scrollbar {
  width: 6px;
}
.console-logs::-webkit-scrollbar-track {
  background: transparent;
}
.console-logs::-webkit-scrollbar-thumb {
  background-color: var(--ink-trace);
  border-radius: 3px;
}
.console-logs::-webkit-scrollbar-thumb:hover {
  background-color: var(--ink-light);
}
</style>
