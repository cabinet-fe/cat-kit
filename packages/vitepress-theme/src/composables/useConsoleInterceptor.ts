import { ref, watch, onUnmounted, nextTick, type Ref } from 'vue'

export interface LogEntry {
  id: number
  type: 'log' | 'warn' | 'error' | 'info' | 'debug'
  args: unknown[]
  timestamp: number
}

type ConsoleMethod = 'log' | 'warn' | 'error' | 'info' | 'debug'

const CONSOLE_METHODS: ConsoleMethod[] = ['log', 'warn', 'error', 'info', 'debug']
const ORIGINAL_CONSOLE_KEY = '__catkit_original_console__'

/**
 * 获取原始 console 方法（防止被多次拦截覆盖）
 */
function getOriginalConsole(): Record<ConsoleMethod, typeof console.log> {
  const win = window as unknown as Record<string, unknown>
  if (!win[ORIGINAL_CONSOLE_KEY]) {
    win[ORIGINAL_CONSOLE_KEY] = Object.fromEntries(
      CONSOLE_METHODS.map(method => [method, console[method].bind(console)])
    )
  }
  return win[ORIGINAL_CONSOLE_KEY] as Record<ConsoleMethod, typeof console.log>
}

export interface UseConsoleInterceptorOptions {
  /** 是否激活拦截 */
  active: Ref<boolean>
  /** 控制台容器引用，用于自动滚动 */
  containerRef?: Ref<HTMLElement | undefined>
}

/**
 * Console 拦截器 composable
 * 拦截 console 输出并收集日志
 */
export function useConsoleInterceptor(options: UseConsoleInterceptorOptions) {
  const { active, containerRef } = options

  const logs = ref<LogEntry[]>([])
  let logId = 0
  let isIntercepting = false

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
        // 自动滚动到底部
        nextTick(() => {
          if (containerRef?.value) {
            containerRef.value.scrollTop = containerRef.value.scrollHeight
          }
        })
      }
      originalConsole[type](...args)
    }
  }

  const setupInterceptors = () => {
    if (isIntercepting) return
    isIntercepting = true
    CONSOLE_METHODS.forEach(method => {
      console[method] = createInterceptor(method)
    })
  }

  const restoreConsole = () => {
    if (!isIntercepting) return
    isIntercepting = false
    const originalConsole = getOriginalConsole()
    CONSOLE_METHODS.forEach(method => {
      console[method] = originalConsole[method]
    })
  }

  const clearLogs = () => {
    logs.value = []
  }

  // 监听 active 状态切换拦截
  watch(
    active,
    isActive => {
      if (isActive) {
        setupInterceptors()
      } else {
        restoreConsole()
      }
    },
    { immediate: true }
  )

  // 组件卸载时恢复
  onUnmounted(restoreConsole)

  return {
    logs,
    clearLogs
  }
}

