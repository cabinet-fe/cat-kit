<template>
  <div class="demo-box">
    <div class="demo-header">
      <h3>插件链路调试</h3>
      <p>调试 TokenPlugin、MethodOverridePlugin 与自定义日志插件</p>
    </div>

    <var-input
      v-model="token"
      clearable
      placeholder="输入 token，观察请求头变化"
    />

    <var-space>
      <var-button type="primary" :loading="loading" @click="sendDelete">
        调试 DELETE（会被重写）
      </var-button>
      <var-button @click="clearLogs">清空日志</var-button>
    </var-space>

    <div class="meta-box">
      <div class="meta-row">
        <span class="label">最终 method</span>
        <code>{{ requestMeta.method || '-' }}</code>
      </div>
      <div class="meta-row">
        <span class="label">请求头</span>
        <code>{{ requestMeta.headers || '-' }}</code>
      </div>
      <div class="meta-row">
        <span class="label">响应状态</span>
        <code>{{ requestMeta.code ?? '-' }}</code>
      </div>
    </div>

    <div class="log-box">
      <div v-for="(log, index) in logs" :key="index" class="log-row">
        {{ log }}
      </div>
      <div v-if="logs.length === 0" class="empty">暂无调试日志</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { HTTPClient, MethodOverridePlugin, TokenPlugin } from '@cat-kit/http'

const token = ref('debug-token-001')
const loading = ref(false)
const logs = ref<string[]>([])

const requestMeta = reactive<{
  method: string
  headers: string
  code: number | null
}>({
  method: '',
  headers: '',
  code: null
})

function appendLog(message: string) {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${message}`)
  if (logs.value.length > 12) {
    logs.value.pop()
  }
}

const http = new HTTPClient('', {
  timeout: 15000,
  plugins: [
    TokenPlugin({
      getter: () => token.value,
      authType: 'Bearer'
    }),
    MethodOverridePlugin({
      methods: ['DELETE'],
      overrideMethod: 'POST'
    }),
    {
      beforeRequest(url, config) {
        requestMeta.method = config.method ?? '-'
        requestMeta.headers = JSON.stringify(config.headers ?? {})
        appendLog(`beforeRequest -> ${config.method} ${url}`)
      },
      afterRespond(response) {
        requestMeta.code = response.code
        appendLog(`afterRespond -> code=${response.code}`)
        return response
      },
      onError(error) {
        const message = error instanceof Error ? error.message : 'unknown error'
        appendLog(`onError -> ${message}`)
      }
    }
  ]
})

async function sendDelete() {
  loading.value = true
  requestMeta.code = null

  try {
    await http.delete('https://jsonplaceholder.typicode.com/posts/1')
  } catch (error) {
    appendLog(error instanceof Error ? error.message : '请求失败')
  } finally {
    loading.value = false
  }
}

function clearLogs() {
  logs.value = []
}
</script>

<style scoped>
.demo-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.demo-header h3 {
  margin: 0;
  font-size: 16px;
}

.demo-header p {
  margin: 4px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.meta-box,
.log-box {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
}

.meta-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.label {
  min-width: 72px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.log-box {
  max-height: 240px;
  overflow: auto;
}

.log-row {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  padding: 4px 0;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.log-row:last-child {
  border-bottom: none;
}

.empty {
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 12px;
}
</style>
