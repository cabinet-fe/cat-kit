# HTTP 工具

统一的 HTTP 请求客户端，支持多种引擎和插件系统。

## 特性

- ✅ 统一的 API 设计
- ✅ 支持 Fetch 和 XMLHttpRequest
- ✅ 请求/响应拦截器
- ✅ 插件系统
- ✅ TypeScript 类型支持
- ✅ 自动错误处理
- ✅ 请求取消
- ✅ 超时控制

## 快速开始

### 安装

```bash
bun add @cat-kit/http
```

### 基本用法

```typescript
import { createClient } from '@cat-kit/http'

// 创建客户端
const client = createClient({
  baseURL: 'https://api.example.com',
  timeout: 5000
})

// 发起请求
const response = await client.get('/users')
console.log(response.data)
```

## 创建客户端

### createClient

创建 HTTP 客户端实例。

```typescript
import { createClient } from '@cat-kit/http'

const client = createClient({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
  engine: 'fetch' // 'fetch' | 'xhr'
})
```

### 配置选项

```typescript
interface ClientConfig {
  baseURL?: string // 基础 URL
  timeout?: number // 超时时间（毫秒）
  headers?: Record<string, string> // 默认请求头
  engine?: 'fetch' | 'xhr' // 请求引擎
  withCredentials?: boolean // 跨域携带凭证
}
```

## HTTP 方法

### GET 请求

```typescript
// 基本 GET 请求
const response = await client.get('/users')

// 带查询参数
const response = await client.get('/users', {
  params: {
    page: 1,
    size: 10,
    role: 'admin'
  }
})
// 请求 URL: /users?page=1&size=10&role=admin
```

### POST 请求

```typescript
// 发送 JSON 数据
const response = await client.post('/users', {
  name: '张三',
  email: 'zhang@example.com',
  age: 25
})

// 发送 FormData
const formData = new FormData()
formData.append('file', fileBlob)
formData.append('name', 'avatar.jpg')

const response = await client.post('/upload', formData)
```

### PUT 请求

```typescript
// 更新资源
const response = await client.put('/users/123', {
  name: '李四',
  email: 'li@example.com'
})
```

### DELETE 请求

```typescript
// 删除资源
const response = await client.delete('/users/123')

// 带参数
const response = await client.delete('/users/123', {
  params: {
    reason: 'inactive'
  }
})
```

### PATCH 请求

```typescript
// 部分更新
const response = await client.patch('/users/123', {
  name: '王五'
})
```

## 拦截器

### 请求拦截器

```typescript
// 添加请求拦截器
client.interceptors.request.use(config => {
  // 添加 token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // 添加时间戳
  config.params = {
    ...config.params,
    _t: Date.now()
  }

  return config
})

// 添加多个拦截器
client.interceptors.request.use(config => {
  console.log('请求:', config.method, config.url)
  return config
})
```

### 响应拦截器

```typescript
// 添加响应拦截器
client.interceptors.response.use(
  // 成功处理
  response => {
    // 提取数据
    return response.data
  },
  // 错误处理
  error => {
    if (error.response?.status === 401) {
      // 处理未授权
      window.location.href = '/login'
    }

    if (error.response?.status === 500) {
      // 处理服务器错误
      console.error('服务器错误')
    }

    return Promise.reject(error)
  }
)
```

## 错误处理

### 捕获错误

```typescript
try {
  const response = await client.get('/users')
} catch (error) {
  if (error.response) {
    // 服务器返回错误状态码
    console.error('状态码:', error.response.status)
    console.error('错误信息:', error.response.data)
  } else if (error.request) {
    // 请求已发送但没有收到响应
    console.error('网络错误')
  } else {
    // 其他错误
    console.error('错误:', error.message)
  }
}
```

### 全局错误处理

```typescript
client.interceptors.response.use(
  response => response,
  error => {
    // 统一错误处理
    const message = error.response?.data?.message || '请求失败'

    // 显示错误提示
    showToast(message)

    // 记录错误日志
    logError(error)

    return Promise.reject(error)
  }
)
```

## 请求取消

### 使用 AbortController

```typescript
// 创建控制器
const controller = new AbortController()

// 发起请求
const request = client.get('/users', {
  signal: controller.signal
})

// 取消请求
controller.abort()

try {
  await request
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('请求已取消')
  }
}
```

### 自动取消重复请求

```typescript
const pendingRequests = new Map()

client.interceptors.request.use(config => {
  const key = `${config.method}:${config.url}`

  // 取消之前的相同请求
  if (pendingRequests.has(key)) {
    pendingRequests.get(key).abort()
  }

  // 保存新请求
  const controller = new AbortController()
  config.signal = controller.signal
  pendingRequests.set(key, controller)

  return config
})

client.interceptors.response.use(
  response => {
    // 请求完成，移除记录
    const key = `${response.config.method}:${response.config.url}`
    pendingRequests.delete(key)
    return response
  },
  error => {
    // 请求失败，移除记录
    if (error.config) {
      const key = `${error.config.method}:${error.config.url}`
      pendingRequests.delete(key)
    }
    return Promise.reject(error)
  }
)
```

## 完整示例

### RESTful API 客户端

```typescript
import { createClient } from '@cat-kit/http'

// 创建客户端
const api = createClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(config => {
  // 添加 token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // 添加请求 ID
  config.headers['X-Request-ID'] = crypto.randomUUID()

  return config
})

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 提取数据
    return response.data
  },
  error => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // 未授权，跳转登录
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    if (error.response?.status === 403) {
      // 无权限
      showToast('无权限访问')
    }

    if (error.response?.status >= 500) {
      // 服务器错误
      showToast('服务器错误，请稍后重试')
    }

    return Promise.reject(error)
  }
)

// API 方法
export const userAPI = {
  // 获取用户列表
  async getUsers(params?: { page?: number; size?: number }) {
    return api.get('/users', { params })
  },

  // 获取用户详情
  async getUser(id: number) {
    return api.get(`/users/${id}`)
  },

  // 创建用户
  async createUser(data: { name: string; email: string }) {
    return api.post('/users', data)
  },

  // 更新用户
  async updateUser(
    id: number,
    data: Partial<{
      name: string
      email: string
    }>
  ) {
    return api.patch(`/users/${id}`, data)
  },

  // 删除用户
  async deleteUser(id: number) {
    return api.delete(`/users/${id}`)
  }
}

// 使用示例
async function example() {
  // 获取用户列表
  const users = await userAPI.getUsers({ page: 1, size: 10 })
  console.log('用户列表:', users)

  // 创建用户
  const newUser = await userAPI.createUser({
    name: '张三',
    email: 'zhang@example.com'
  })
  console.log('新用户:', newUser)

  // 更新用户
  await userAPI.updateUser(newUser.id, {
    name: '李四'
  })

  // 删除用户
  await userAPI.deleteUser(newUser.id)
}
```

## 高级用法

### 文件上传

```typescript
async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', file.name)

  const response = await client.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    // 上传进度
    onUploadProgress: event => {
      const percent = (event.loaded / event.total) * 100
      console.log(`上传进度: ${percent.toFixed(2)}%`)
    }
  })

  return response.data
}
```

### 文件下载

```typescript
async function downloadFile(url: string, filename: string) {
  const response = await client.get(url, {
    responseType: 'blob'
  })

  // 创建下载链接
  const blob = response.data
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  link.click()

  // 清理
  URL.revokeObjectURL(downloadUrl)
}
```

### 并发请求

```typescript
import { parallel } from '@cat-kit/core'

// 并发获取多个用户
async function getMultipleUsers(ids: number[]) {
  return await parallel(
    ids,
    async id => {
      return await client.get(`/users/${id}`)
    },
    { concurrency: 3 } // 最多同时 3 个请求
  )
}

// 使用 Promise.all
async function getAllData() {
  const [users, posts, comments] = await Promise.all([
    client.get('/users'),
    client.get('/posts'),
    client.get('/comments')
  ])

  return { users, posts, comments }
}
```

### 重试机制

```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.get(url)
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

## 相关 API

- [Storage](/fe/storage/storage) - 本地存储
- [并行执行](/core/optimize/parallel) - 并发控制
