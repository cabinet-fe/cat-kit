<template>
  <div class="demo-box">
    <div class="demo-header">
      <h3>基础请求调试</h3>
      <p>在浏览器里直接调试 GET / POST 请求与响应内容</p>
    </div>

    <div class="demo-controls">
      <var-input
        v-model="postTitle"
        placeholder="POST 时使用的标题"
        clearable
      />

      <var-space>
        <var-button type="primary" :loading="loading" @click="sendGetRequest">
          调试 GET
        </var-button>
        <var-button type="success" :loading="loading" @click="sendPostRequest">
          调试 POST
        </var-button>
      </var-space>
    </div>

    <div class="demo-result">
      <div class="result-row">
        <span class="label">请求方法</span>
        <code>{{ lastMethod || '-' }}</code>
      </div>

      <div class="result-row">
        <span class="label">请求地址</span>
        <code>{{ lastUrl || '-' }}</code>
      </div>

      <div class="result-row">
        <span class="label">状态码</span>
        <code>{{ statusCode ?? '-' }}</code>
      </div>

      <div v-if="errorMessage" class="error-box">
        {{ errorMessage }}
      </div>

      <pre v-else class="json-box">{{ formattedResponse }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { HTTPClient } from '@cat-kit/http'

interface PostItem {
  id: number
  userId: number
  title: string
  body: string
}

const http = new HTTPClient('', {
  timeout: 15000,
  headers: {
    'X-Demo-Source': 'cat-kit-docs'
  }
})

const postTitle = ref('cat-kit browser demo')
const loading = ref(false)
const statusCode = ref<number | null>(null)
const lastMethod = ref('')
const lastUrl = ref('')
const errorMessage = ref('')
const responseData = ref<unknown>(null)

const formattedResponse = computed(() => {
  if (!responseData.value) {
    return '点击上方按钮发起请求'
  }

  return JSON.stringify(responseData.value, null, 2)
})

async function sendGetRequest() {
  loading.value = true
  errorMessage.value = ''
  lastMethod.value = 'GET'
  lastUrl.value = 'https://jsonplaceholder.typicode.com/posts/1?_t=debug'

  try {
    const response = await http.get<PostItem>(
      'https://jsonplaceholder.typicode.com/posts/1',
      {
        query: { _t: 'debug' }
      }
    )

    statusCode.value = response.code
    responseData.value = response.data
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '请求失败'
  } finally {
    loading.value = false
  }
}

async function sendPostRequest() {
  loading.value = true
  errorMessage.value = ''
  lastMethod.value = 'POST'
  lastUrl.value = 'https://jsonplaceholder.typicode.com/posts'

  try {
    const response = await http.post<PostItem>(
      'https://jsonplaceholder.typicode.com/posts',
      {
        title: postTitle.value || 'cat-kit browser demo',
        body: 'request from docs demo',
        userId: 1
      }
    )

    statusCode.value = response.code
    responseData.value = response.data
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '请求失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.demo-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-header h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.demo-header p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.demo-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-result {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-row {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
}

.label {
  min-width: 64px;
  color: var(--vp-c-text-2);
}

.json-box {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 260px;
  overflow: auto;
  padding: 10px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}

.error-box {
  padding: 10px;
  border-radius: 6px;
  color: var(--vp-c-red-1);
  border: 1px solid var(--vp-c-red-3);
  background: color-mix(in srgb, var(--vp-c-red-1) 10%, transparent);
}
</style>
