<template>
  <div>
    <div class="demo-section">
      <h3>加载状态示例</h3>
      <p>点击下方按钮发起请求，观察加载条效果</p>
      <var-space>
        <var-button type="primary" @click="sendRequest">发起请求</var-button>
        <var-button @click="sendMultipleRequests">发起多个请求</var-button>
      </var-space>
    </div>

    <div class="demo-section">
      <h3>请求日志</h3>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { HTTPClient } from '@cat-kit/http'
import type { ClientPlugin } from '@cat-kit/http'
import { Snackbar } from '@varlet/ui'
import { ref } from 'vue'

const logs = ref<string[]>([])

// 创建加载和消息插件
function LoadingPlugin(): ClientPlugin {
  let requestCount = 0

  return {
    name: 'loading-state',
    beforeRequest(url) {
      if (requestCount === 0) {
        Snackbar.loading('请求中...')
      }
      requestCount++
      addLog(`🚀 请求开始: ${url}`)
    },
    afterRespond(response, url) {
      requestCount--
      if (requestCount === 0) {
        Snackbar.clear()
      }
      addLog(`✅ 请求完成: ${url}`)
      return response
    }
  }
}

// 创建消息提示插件
function MessagePlugin(): ClientPlugin {
  return {
    name: 'message-feedback',
    afterRespond(response, url) {
      if (response.code >= 400) {
        Snackbar.error(`请求失败: ${response.code}`)
        addLog(`❌ 请求失败: ${url} - ${response.code}`)
      } else {
        Snackbar.success('请求成功')
      }
      return response
    }
  }
}

// 添加日志
function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`[${timestamp}] ${message}`)
  if (logs.value.length > 10) {
    logs.value.pop()
  }
}

// 创建 HTTP 客户端
const http = new HTTPClient('', {
  plugins: [LoadingPlugin(), MessagePlugin()]
})

// 发起单个请求
async function sendRequest() {
  try {
    // 使用模拟 API
    await http.get('https://jsonplaceholder.typicode.com/posts/1')
  } catch (error) {
    console.error(error)
  }
}

// 发起多个请求
async function sendMultipleRequests() {
  try {
    await Promise.all([
      http.get('https://jsonplaceholder.typicode.com/posts/1'),
      http.get('https://jsonplaceholder.typicode.com/posts/2'),
      http.get('https://jsonplaceholder.typicode.com/posts/3')
    ])
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.demo-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-section h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.demo-section p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.log-container {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-item {
  padding: 4px 0;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.log-item:last-child {
  border-bottom: none;
}
</style>
