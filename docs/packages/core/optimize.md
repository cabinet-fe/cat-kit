# 性能优化

提供并行处理、防抖节流、安全执行等性能优化工具。

## 并行处理

使用 `parallel` 函数并行执行多个异步任务。

### 基本用法

```typescript
import { parallel } from '@cat-kit/core'

// 并行执行多个异步任务
const results = await parallel([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
])

// results: [Response, Response, Response]
```

### 实际应用

```typescript
import { parallel } from '@cat-kit/core'

async function loadDashboardData() {
  const [users, stats, notifications] = await parallel([
    fetchUsers(),
    fetchStatistics(),
    fetchNotifications()
  ])

  return {
    users: await users.json(),
    stats: await stats.json(),
    notifications: await notifications.json()
  }
}
```

## 防抖 (Debounce)

延迟函数执行，在指定时间内多次调用只执行最后一次。

### 基本用法

```typescript
import { debounce } from '@cat-kit/core'

// 创建防抖函数
const debouncedSave = debounce(data => {
  console.log('保存数据:', data)
  saveToServer(data)
}, 500) // 500ms 内多次调用只执行最后一次

// 多次快速调用
debouncedSave('data1')
debouncedSave('data2')
debouncedSave('data3')
// 只会执行一次：保存数据: data3
```

### 搜索框示例

```typescript
import { debounce } from '@cat-kit/core'

// 搜索输入防抖
const searchInput = document.querySelector<HTMLInputElement>('#search')

const debouncedSearch = debounce(async (query: string) => {
  if (!query) return

  const results = await fetch(`/api/search?q=${query}`)
  displayResults(await results.json())
}, 300)

searchInput?.addEventListener('input', e => {
  const query = (e.target as HTMLInputElement).value
  debouncedSearch(query)
})
```

### 窗口大小调整

```typescript
import { debounce } from '@cat-kit/core'

const debouncedResize = debounce(() => {
  console.log('Window resized')
  recalculateLayout()
}, 200)

window.addEventListener('resize', debouncedResize)
```

### 表单自动保存

```typescript
import { debounce } from '@cat-kit/core'

const formData = { title: '', content: '' }

const autoSave = debounce(async data => {
  console.log('自动保存...')
  await fetch('/api/drafts', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  console.log('保存成功')
}, 2000) // 2秒无操作后自动保存

document.querySelectorAll('input, textarea').forEach(input => {
  input.addEventListener('input', e => {
    const target = e.target as HTMLInputElement
    formData[target.name] = target.value
    autoSave(formData)
  })
})
```

## 节流 (Throttle)

限制函数执行频率，在指定时间内最多执行一次。

### 基本用法

```typescript
import { throttle } from '@cat-kit/core'

// 创建节流函数
const throttledLog = throttle(message => {
  console.log('执行:', message)
}, 1000) // 每秒最多执行1次

// 快速多次调用
for (let i = 0; i < 10; i++) {
  throttledLog(`消息 ${i}`)
}
// 只会执行一次：执行: 消息 0
```

### 滚动事件

```typescript
import { throttle } from '@cat-kit/core'

let scrollPosition = 0

const throttledScroll = throttle(() => {
  scrollPosition = window.scrollY
  console.log('当前滚动位置:', scrollPosition)

  // 更新导航栏状态
  updateNavbar(scrollPosition)
}, 100) // 每100ms最多执行一次

window.addEventListener('scroll', throttledScroll)
```

### 鼠标移动追踪

```typescript
import { throttle } from '@cat-kit/core'

const mousePosition = { x: 0, y: 0 }

const throttledMouseMove = throttle((e: MouseEvent) => {
  mousePosition.x = e.clientX
  mousePosition.y = e.clientY

  // 更新自定义光标位置
  updateCursor(mousePosition)
}, 16) // 约60fps

document.addEventListener('mousemove', throttledMouseMove)
```

### 无限滚动加载

```typescript
import { throttle } from '@cat-kit/core'

let page = 1
let loading = false

const throttledLoadMore = throttle(async () => {
  const scrollBottom = window.innerHeight + window.scrollY
  const documentHeight = document.documentElement.scrollHeight

  // 距离底部100px时触发加载
  if (scrollBottom >= documentHeight - 100 && !loading) {
    loading = true
    page++

    const data = await fetchData(page)
    appendData(data)

    loading = false
  }
}, 200)

window.addEventListener('scroll', throttledLoadMore)
```

## 睡眠 (Sleep)

暂停异步函数执行指定时间。

### 基本用法

```typescript
import { sleep } from '@cat-kit/core'

async function demo() {
  console.log('开始')

  await sleep(1000) // 暂停1秒

  console.log('1秒后')

  await sleep(2000) // 暂停2秒

  console.log('3秒后')
}
```

### 重试机制

```typescript
import { sleep } from '@cat-kit/core'

async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error

      // 指数退避：1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000
      console.log(`重试 ${i + 1}/${maxRetries}，等待 ${delay}ms`)
      await sleep(delay)
    }
  }
}
```

### 动画控制

```typescript
import { sleep } from '@cat-kit/core'

async function animateSequence() {
  // 第一步
  element.classList.add('fade-in')
  await sleep(500)

  // 第二步
  element.classList.add('slide-up')
  await sleep(500)

  // 第三步
  element.classList.add('bounce')
  await sleep(800)

  console.log('动画完成')
}
```

### 模拟加载状态

```typescript
import { sleep } from '@cat-kit/core'

async function simulateLoading<T>(
  task: () => Promise<T>,
  minDelay = 500
): Promise<T> {
  const start = Date.now()
  const result = await task()
  const elapsed = Date.now() - start

  // 确保至少显示加载状态 minDelay 毫秒
  if (elapsed < minDelay) {
    await sleep(minDelay - elapsed)
  }

  return result
}

// 使用
showLoading()
const data = await simulateLoading(() => fetchData(), 500)
hideLoading()
```

## 安全执行

使用 `safeRun` 安全执行可能抛出错误的函数。

### 基本用法

```typescript
import { safeRun } from '@cat-kit/core'

// 安全执行同步函数
const result = safeRun(() => {
  return JSON.parse(jsonString)
})

if (result.success) {
  console.log('解析成功:', result.data)
} else {
  console.error('解析失败:', result.error)
}
```

### 异步安全执行

```typescript
import { safeRun } from '@cat-kit/core'

// 安全执行异步函数
const result = await safeRun(async () => {
  const response = await fetch('/api/data')
  return await response.json()
})

if (result.success) {
  console.log('数据:', result.data)
} else {
  console.error('请求失败:', result.error)
}
```

### 表单验证

```typescript
import { safeRun } from '@cat-kit/core'

function validateEmail(email: string): boolean {
  const result = safeRun(() => {
    if (!email) throw new Error('邮箱不能为空')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('邮箱格式不正确')
    }
    return true
  })

  if (!result.success) {
    showError(result.error.message)
    return false
  }

  return true
}
```

### 数据转换

```typescript
import { safeRun } from '@cat-kit/core'

function parseUserData(data: string) {
  const parseResult = safeRun(() => JSON.parse(data))

  if (!parseResult.success) {
    return { error: '数据格式错误' }
  }

  const validateResult = safeRun(() => {
    const user = parseResult.data
    if (!user.id || !user.name) {
      throw new Error('缺少必要字段')
    }
    return user
  })

  if (!validateResult.success) {
    return { error: validateResult.error.message }
  }

  return { user: validateResult.data }
}
```

## 综合示例

### 搜索建议系统

```typescript
import { debounce, safeRun } from '@cat-kit/core'

class SearchSuggestion {
  private cache = new Map<string, any[]>()

  private fetchSuggestions = debounce(async (query: string) => {
    // 检查缓存
    if (this.cache.has(query)) {
      return this.cache.get(query)
    }

    // 安全请求
    const result = await safeRun(async () => {
      const response = await fetch(`/api/search/suggest?q=${query}`)
      if (!response.ok) throw new Error('请求失败')
      return await response.json()
    })

    if (result.success) {
      this.cache.set(query, result.data)
      this.displaySuggestions(result.data)
    } else {
      console.error('获取建议失败:', result.error)
      this.displayError()
    }
  }, 300)

  search(query: string) {
    this.fetchSuggestions(query)
  }

  private displaySuggestions(suggestions: any[]) {
    // 显示建议...
  }

  private displayError() {
    // 显示错误...
  }
}
```

### 数据同步管理器

```typescript
import { throttle, sleep, safeRun } from '@cat-kit/core'

class DataSyncManager {
  private syncQueue: any[] = []
  private syncing = false

  // 节流的同步触发
  private triggerSync = throttle(() => {
    this.performSync()
  }, 5000) // 每5秒最多同步一次

  addToQueue(data: any) {
    this.syncQueue.push(data)
    this.triggerSync()
  }

  private async performSync() {
    if (this.syncing || this.syncQueue.length === 0) return

    this.syncing = true
    const dataToSync = [...this.syncQueue]
    this.syncQueue = []

    let retries = 0
    const maxRetries = 3

    while (retries < maxRetries) {
      const result = await safeRun(async () => {
        return await fetch('/api/sync', {
          method: 'POST',
          body: JSON.stringify(dataToSync)
        })
      })

      if (result.success) {
        console.log('同步成功')
        break
      } else {
        retries++
        if (retries < maxRetries) {
          await sleep(Math.pow(2, retries) * 1000)
        } else {
          // 同步失败，重新加入队列
          this.syncQueue.unshift(...dataToSync)
          console.error('同步失败，已加回队列')
        }
      }
    }

    this.syncing = false
  }
}
```

## API 参考

### parallel

```typescript
function parallel<T extends readonly unknown[]>(
  tasks: T
): Promise<{ [K in keyof T]: Awaited<T[K]> }>
```

并行执行多个 Promise 任务。

### debounce

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void
```

创建防抖函数，延迟执行。

### throttle

```typescript
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void
```

创建节流函数，限制执行频率。

### sleep

```typescript
function sleep(ms: number): Promise<void>
```

异步睡眠指定毫秒数。

### safeRun

```typescript
function safeRun<T>(
  fn: () => T | Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: Error }>
```

安全执行函数，捕获错误并返回结果对象。

## 最佳实践

1. **选择合适的工具**：搜索用防抖，滚动用节流
2. **合理设置延迟**：根据实际场景调整延迟时间
3. **清理事件监听**：组件销毁时记得移除事件监听
4. **错误处理**：使用 safeRun 包装可能失败的操作
5. **性能监控**：测试和监控优化效果
6. **避免过度优化**：不是所有函数都需要防抖/节流
