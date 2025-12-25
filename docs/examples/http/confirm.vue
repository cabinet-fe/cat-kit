<template>
  <div>
    <div class="demo-section">
      <h3>交互式确认对话框</h3>
      <p>演示在执行删除操作前弹出确认对话框</p>

      <div class="item-list">
        <div v-for="item in items" :key="item.id" class="list-item">
          <div class="item-info">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-desc">ID: {{ item.id }}</div>
          </div>
          <var-button type="danger" size="small" @click="deleteItem(item.id)">
            删除
          </var-button>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>操作日志</h3>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </div>
        <div v-if="logs.length === 0" class="empty-state">暂无操作记录</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { HTTPClient } from '@cat-kit/http/src'
import { Dialog, Snackbar } from '@varlet/ui'
import type { ClientPlugin } from '@cat-kit/http/src'

const items = ref([
  { id: 1, title: '项目 A' },
  { id: 2, title: '项目 B' },
  { id: 3, title: '项目 C' }
])

const logs = ref<string[]>([])

// 确认删除插件
function ConfirmDeletePlugin(): ClientPlugin {
  return {
    async beforeRequest(url, config) {
      if (config.method === 'DELETE') {
        try {
          await Dialog({
            title: '确认删除',
            message: '确定要删除该项吗？此操作不可恢复。',
            confirmButtonText: '确定删除',
            cancelButtonText: '取消'
          })
          addLog('✅ 用户确认删除')
        } catch {
          addLog('❌ 用户取消删除')
          throw new Error('用户取消操作')
        }
      }
    },
    afterRespond(response) {
      addLog(`✅ 删除成功: ${response.code}`)
      return response
    }
  }
}

// 创建 HTTP 客户端
const http = new HTTPClient('', {
  plugins: [ConfirmDeletePlugin()]
})

// 添加日志
function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`[${timestamp}] ${message}`)
  if (logs.value.length > 10) {
    logs.value.pop()
  }
}

// 删除项目
async function deleteItem(id: number) {
  try {
    await http.delete(`https://jsonplaceholder.typicode.com/posts/${id}`)

    // 从列表中移除
    items.value = items.value.filter(item => item.id !== id)
    Snackbar.success('删除成功')
  } catch (error: any) {
    if (error.message === '用户取消操作') {
      Snackbar.info('已取消')
    } else {
      Snackbar.error('删除失败')
      addLog(`❌ 删除失败: ${error.message}`)
    }
  }
}
</script>

<style scoped>
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

.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: all 0.2s;
}

.list-item:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.item-desc {
  font-size: 12px;
  color: var(--vp-c-text-2);
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

.empty-state {
  text-align: center;
  padding: 16px;
  color: var(--vp-c-text-3);
}
</style>
