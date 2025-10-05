# HTTP 快速开始

快速上手使用 CatKit HTTP 工具。

## 安装

```bash
bun add @cat-kit/http
```

## 创建客户端

```typescript
import { createClient } from '@cat-kit/http'

const client = createClient({
  baseURL: 'https://api.example.com',
  timeout: 5000
})
```

## 基本请求

```typescript
// GET 请求
const users = await client.get('/users')

// POST 请求
const newUser = await client.post('/users', {
  name: '张三',
  email: 'zhang@example.com'
})

// PUT 请求
await client.put('/users/1', { name: '李四' })

// DELETE 请求
await client.delete('/users/1')
```

## 拦截器

```typescript
// 请求拦截器
client.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器
client.interceptors.response.use(
  response => response.data,
  error => {
    console.error('请求失败:', error)
    return Promise.reject(error)
  }
)
```

::: tip 提示
查看 [完整文档](/http/index) 了解更多功能。
:::

## 相关资源

- [HTTP 概述](/http/index) - 完整文档
- [API 参考](/http/api) - API 文档
