<script setup lang="ts">
import { ref, onUnmounted, nextTick, watch } from 'vue'
import { Circle, Info, AlertTriangle, XCircle, Bug } from 'lucide-vue-next'

interface LogEntry {
  id: number
  type: 'log' | 'warn' | 'error' | 'info' | 'debug'
  args: unknown[]
  timestamp: number
}

type ConsoleMethod = 'log' | 'warn' | 'error' | 'info' | 'debug'

// 全局存储原始 console 方法，防止被多次拦截覆盖
const ORIGINAL_CONSOLE_KEY = '__catkit_original_console__'
const getOriginalConsole = (): Record<ConsoleMethod, typeof console.log> => {
  const win = window as unknown as Record<string, unknown>
  if (!win[ORIGINAL_CONSOLE_KEY]) {
    win[ORIGINAL_CONSOLE_KEY] = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console)
    }
  }
  return win[ORIGINAL_CONSOLE_KEY] as Record<ConsoleMethod, typeof console.log>
}

const props = defineProps<{
  active?: boolean
}>()

const logs = ref<LogEntry[]>([])
const consoleRef = ref<HTMLElement>()

let logId = 0
let isIntercepting = false

const formatValue = (value: unknown): string => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  if (typeof value === 'function') return `ƒ ${value.name || 'anonymous'}()`
  if (value instanceof Error) return `${value.name}: ${value.message}`
  if (Array.isArray(value)) {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return '[Array]'
    }
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return '[Object]'
    }
  }
  return String(value)
}

const createInterceptor = (type: ConsoleMethod) => {
  const originalConsole = getOriginalConsole()
  return (...args: unknown[]) => {
    if (isIntercepting) {
      logs.value.push({
        id: logId++,
        type,
        args,
        timestamp: Date.now()
      })
      nextTick(() => {
        if (consoleRef.value) {
          consoleRef.value.scrollTop = consoleRef.value.scrollHeight
        }
      })
    }
    originalConsole[type](...args)
  }
}

const setupInterceptors = () => {
  if (isIntercepting) return
  isIntercepting = true
  const methods: ConsoleMethod[] = ['log', 'warn', 'error', 'info', 'debug']
  methods.forEach(method => {
    console[method] = createInterceptor(method)
  })
}

const restoreConsole = () => {
  if (!isIntercepting) return
  isIntercepting = false
  const originalConsole = getOriginalConsole()
  const methods: ConsoleMethod[] = ['log', 'warn', 'error', 'info', 'debug']
  methods.forEach(method => {
    console[method] = originalConsole[method]
  })
}

const clearLogs = () => {
  logs.value = []
}

// 暴露给父组件
defineExpose({
  clearLogs,
  logs
})

watch(
  () => props.active,
  active => {
    if (active) {
      setupInterceptors()
    } else {
      restoreConsole()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  restoreConsole()
})
</script>

<template>
  <div ref="consoleRef" class="console-logs">
    <div v-if="logs.length === 0" class="console-empty">暂无日志输出</div>
    <div
      v-for="log in logs"
      :key="log.id"
      class="console-log-entry"
      :class="'log-' + log.type"
    >
      <span class="log-icon">
        <Circle v-if="log.type === 'log'" :size="12" />
        <Info v-else-if="log.type === 'info'" :size="12" />
        <AlertTriangle v-else-if="log.type === 'warn'" :size="12" />
        <XCircle v-else-if="log.type === 'error'" :size="12" />
        <Bug v-else :size="12" />
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

.console-log-entry {
  display: flex;
  align-items: flex-start;
  padding: 4px 12px;
  border-bottom: 1px solid var(--ink-trace);
  gap: 8px;
}

.console-log-entry:hover {
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

/* 滚动条样式 */
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
