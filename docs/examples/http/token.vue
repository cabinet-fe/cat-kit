<template>
  <div>
    <div class="demo-section">
      <h3>Token 插件示例</h3>
      <p>演示如何自动在请求中添加 Token</p>

      <var-space direction="column" style="width: 100%">
        <var-input v-model="token" placeholder="输入 Token (模拟)" clearable>
          <template #prepend-icon>
            <var-icon name="key" />
          </template>
        </var-input>

        <var-space>
          <var-button type="primary" @click="sendAuthRequest">
            发送带 Token 的请求
          </var-button>
          <var-button @click="clearToken">清空 Token</var-button>
        </var-space>
      </var-space>
    </div>

    <div class="demo-section">
      <h3>请求详情</h3>
      <div class="info-card" v-if="lastRequest">
        <div class="info-row">
          <span class="label">请求头:</span>
          <code class="value">{{ lastRequest.headers }}</code>
        </div>
        <div class="info-row">
          <span class="label">状态:</span>
          <span
            class="value"
            :class="lastRequest.success ? 'success' : 'error'"
          >
            {{ lastRequest.success ? '✅ 成功' : '❌ 失败' }}
          </span>
        </div>
      </div>
      <div v-else class="empty-state">暂无请求记录</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { HTTPClient, TokenPlugin } from '@cat-kit/http/src'
import { Snackbar } from '@varlet/ui'

const token = ref('demo-token-abc123')
const lastRequest = ref<{
  headers: string
  success: boolean
} | null>(null)

// 创建带 Token 插件的 HTTP 客户端
const http = new HTTPClient('', {
  plugins: [
    TokenPlugin({
      getter: () => token.value,
      authType: 'Bearer'
    })
  ]
})

// 发送带认证的请求
async function sendAuthRequest() {
  if (!token.value) {
    Snackbar.warning('请先输入 Token')
    return
  }

  try {
    const response = await http.get(
      'https://jsonplaceholder.typicode.com/posts/1'
    )

    lastRequest.value = {
      headers: `Authorization: Bearer ${token.value}`,
      success: response.code === 200
    }

    Snackbar.success('请求成功')
  } catch (error) {
    lastRequest.value = {
      headers: token.value ? `Authorization: Bearer ${token.value}` : '无',
      success: false
    }
    Snackbar.error('请求失败')
  }
}

// 清空 Token
function clearToken() {
  token.value = ''
  Snackbar.info('Token 已清空')
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

.info-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-weight: 600;
  min-width: 80px;
  color: var(--vp-c-text-2);
}

.value {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.value.success {
  color: var(--vp-c-green-1);
}

.value.error {
  color: var(--vp-c-red-1);
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
}
</style>
