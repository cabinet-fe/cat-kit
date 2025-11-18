---
title: HTTP 客户端
description: HTTPClient 类的完整 API 文档
outline: deep
---

# HTTP 客户端

## HTTPClient 类

HTTP 请求客户端类，提供完整的 HTTP 请求功能。

### 构造函数

创建一个新的 HTTP 客户端实例。

```typescript
new HTTPClient(prefix?: string, config?: ClientConfig)
```

**参数：**

| 参数   | 类型           | 必填 | 默认值 | 描述                                      |
| ------ | -------------- | ---- | ------ | ----------------------------------------- |
| prefix | `string`       | 否   | `''`   | 请求路径前缀，会自动拼接到所有请求 URL 前 |
| config | `ClientConfig` | 否   | `{}`   | 客户端全局配置                            |

**ClientConfig 配置项：**

```typescript
interface ClientConfig {
  /** 源地址（协议+域名+端口） */
  origin?: string
  /** 超时时间（毫秒），0 表示不超时 */
  timeout?: number
  /** 默认请求头 */
  headers?: Record<string, string>
  /** 是否发送凭证（cookie），默认 true */
  credentials?: boolean
  /** 插件列表 */
  plugins?: ClientPlugin[]
}
```

**示例：**

```typescript
import { HTTPClient } from '@cat-kit/http'

// 基础用法
const http = new HTTPClient()

// 带前缀
const api = new HTTPClient('/api')

// 完整配置
const client = new HTTPClient('/api/v1', {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': '1.0.0'
  },
  credentials: true
})
```

## 请求方法

### request()

发送 HTTP 请求的通用方法。

```typescript
request<T = any>(url: string, config?: RequestConfig): Promise<HTTPResponse<T>>
```

**参数：**

| 参数   | 类型            | 必填 | 描述     |
| ------ | --------------- | ---- | -------- |
| url    | `string`        | 是   | 请求地址 |
| config | `RequestConfig` | 否   | 请求配置 |

**RequestConfig 配置项：**

```typescript
interface RequestConfig {
  /** 请求方法，默认 'GET' */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  /** 请求体 */
  body?: BodyInit | Record<string, any>
  /** 查询参数，会自动拼接到 URL */
  query?: Record<string, any>
  /** 请求头 */
  headers?: Record<string, string>
  /** 超时时间（毫秒） */
  timeout?: number
  /** 是否携带凭证 */
  credentials?: boolean
  /** 响应类型，默认 'json' */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
}
```

**返回值：**

```typescript
interface HTTPResponse<T = any> {
  /** 响应数据 */
  data: T
  /** HTTP 状态码 */
  code: number
  /** 响应头 */
  headers: Record<string, string>
}
```

**示例：**

```typescript
// 基础请求
const response = await http.request('/users', {
  method: 'GET'
})

// 带查询参数
const response = await http.request('/users', {
  method: 'GET',
  query: { page: 1, size: 10 }
})
// 实际请求：/users?page=1&size=10

// POST 请求
const response = await http.request('/users', {
  method: 'POST',
  body: { name: '张三', age: 18 }
})

// 自定义响应类型
const blob = await http.request<Blob>('/download/file', {
  method: 'GET',
  responseType: 'blob'
})
```

### get()

发送 GET 请求。

```typescript
get<T>(url: string, config?: AliasRequestConfig): Promise<HTTPResponse<T>>
```

**参数：**

| 参数   | 类型                 | 必填 | 描述                      |
| ------ | -------------------- | ---- | ------------------------- |
| url    | `string`             | 是   | 请求地址                  |
| config | `AliasRequestConfig` | 否   | 请求配置（不包含 method） |

**示例：**

```typescript
// 基础 GET 请求
const response = await http.get('/users')

// 带查询参数
const response = await http.get('/users', {
  query: { page: 1, size: 10, status: 'active' }
})

// 带类型定义
interface User {
  id: number
  name: string
  email: string
}

const response = await http.get<User[]>('/users')
// response.data 的类型为 User[]
```

### post()

发送 POST 请求。

```typescript
post<T = any>(
  url: string,
  body?: RequestConfig['body'],
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<HTTPResponse<T>>
```

**参数：**

| 参数   | 类型                              | 必填 | 描述         |
| ------ | --------------------------------- | ---- | ------------ |
| url    | `string`                          | 是   | 请求地址     |
| body   | `BodyInit \| Record<string, any>` | 否   | 请求体       |
| config | `RequestConfig`                   | 否   | 其他请求配置 |

**示例：**

```typescript
// JSON 数据
const response = await http.post('/users', {
  name: '张三',
  age: 18,
  email: 'zhangsan@example.com'
})

// FormData
const formData = new FormData()
formData.append('name', '张三')
formData.append('file', file)

const response = await http.post('/upload', formData)

// 带类型定义
interface CreateUserResponse {
  id: number
  success: boolean
}

const response = await http.post<CreateUserResponse>('/users', {
  name: '张三'
})
```

### put()

发送 PUT 请求，用于更新资源。

```typescript
put<T = any>(
  url: string,
  body?: RequestConfig['body'],
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<HTTPResponse<T>>
```

**示例：**

```typescript
// 更新用户信息
const response = await http.put('/users/123', {
  name: '李四',
  age: 20
})
```

### delete()

发送 DELETE 请求，用于删除资源。

```typescript
delete<T = any>(
  url: string,
  config?: Omit<RequestConfig, 'method'>
): Promise<HTTPResponse<T>>
```

**示例：**

```typescript
// 删除用户
const response = await http.delete('/users/123')

// 带确认参数
const response = await http.delete('/users/123', {
  query: { confirm: true }
})
```

### patch()

发送 PATCH 请求，用于部分更新资源。

```typescript
patch<T = any>(
  url: string,
  body?: RequestConfig['body'],
  config?: Omit<RequestConfig, 'method' | 'body'>
): Promise<HTTPResponse<T>>
```

**示例：**

```typescript
// 只更新用户的邮箱
const response = await http.patch('/users/123', {
  email: 'newemail@example.com'
})
```

### head()

发送 HEAD 请求，只获取响应头。

```typescript
head<T = any>(
  url: string,
  config?: Omit<RequestConfig, 'method'>
): Promise<HTTPResponse<T>>
```

**示例：**

```typescript
// 检查资源是否存在
const response = await http.head('/users/123')
console.log(response.code) // 200 表示存在
```

### options()

发送 OPTIONS 请求，获取服务器支持的请求方法。

```typescript
options<T = any>(
  url: string,
  config?: Omit<RequestConfig, 'method'>
): Promise<HTTPResponse<T>>
```

**示例：**

```typescript
const response = await http.options('/api/users')
console.log(response.headers['allow']) // 查看允许的方法
```

## 实用方法

### abort()

中止当前客户端的所有进行中的请求。

```typescript
abort(): void
```

**示例：**

```typescript
const http = new HTTPClient()

// 发起一个长时间请求
http.get('/long-request')

// 在某个时刻中止所有请求
http.abort()
```

::: tip
每个客户端实例的请求是独立管理的，调用 `abort()` 只会中止该实例的请求。
:::

### group()

创建一个新的客户端实例，继承当前实例的配置并添加额外的路径前缀。

```typescript
group(prefix: string): HTTPClient
```

**参数：**

| 参数   | 类型     | 必填 | 描述             |
| ------ | -------- | ---- | ---------------- |
| prefix | `string` | 是   | 要添加的路径前缀 |

**返回值：** 新的 `HTTPClient` 实例

**示例：**

```typescript
const api = new HTTPClient('/api')

// 创建用户相关的请求分组
const userApi = api.group('/users')
await userApi.get('/') // 请求 /api/users/
await userApi.get('/profile') // 请求 /api/users/profile
await userApi.post('/', { name: '张三' }) // 请求 /api/users/

// 创建文章相关的请求分组
const postApi = api.group('/posts')
await postApi.get('/') // 请求 /api/posts/
await postApi.get('/123') // 请求 /api/posts/123

// 分组可以嵌套
const userPostApi = userApi.group('/posts')
await userPostApi.get('/') // 请求 /api/users/posts/

// 每个分组可以独立中止
userApi.abort() // 只中止 userApi 的请求
```

::: tip 使用场景
`group()` 方法非常适合用于组织大型应用的 API 调用，可以为不同的功能模块创建独立的客户端实例。
:::

## 最佳实践

### 1. 使用 TypeScript 类型

定义清晰的类型可以提高代码质量和开发体验。

```typescript
// 定义请求和响应类型
interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

interface ListResponse<T> {
  items: T[]
  total: number
  page: number
}

// 使用类型
const response = await http.get<ListResponse<User>>('/users')
// response.data 的类型为 ListResponse<User>
console.log(response.data.items[0].name) // 类型安全
```

### 2. 统一的 API 管理

创建统一的 API 管理模块。

```typescript
// api/index.ts
import { HTTPClient } from '@cat-kit/http'

export const http = new HTTPClient('/api', {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// api/user.ts
import { http } from './index'

export const userApi = http.group('/users')

export async function getUsers() {
  return userApi.get('/')
}

export async function getUser(id: number) {
  return userApi.get(`/${id}`)
}

export async function createUser(data: CreateUserData) {
  return userApi.post('/', data)
}
```

### 3. 错误处理

正确处理各种错误情况。

```typescript
try {
  const response = await http.get('/users')
  console.log(response.data)
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('请求被中止')
  } else if (error.message.includes('timeout')) {
    console.log('请求超时')
  } else if (error.message.includes('Network')) {
    console.log('网络错误')
  } else {
    console.error('请求失败:', error)
  }
}
```

### 4. 请求取消

合理使用请求取消功能。

```typescript
// 在组件卸载时取消请求
class UserList {
  private api = new HTTPClient('/api/users')

  async loadUsers() {
    try {
      const response = await this.api.get('/')
      return response.data
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('加载用户失败:', error)
      }
    }
  }

  destroy() {
    // 组件销毁时取消所有请求
    this.api.abort()
  }
}
```

### 5. 分组管理

使用分组来组织复杂的 API 结构。

```typescript
const api = new HTTPClient('/api/v1')

// 按功能模块分组
const users = api.group('/users')
const posts = api.group('/posts')
const comments = api.group('/comments')

// 使用分组
await users.get('/') // /api/v1/users/
await posts.get('/123') // /api/v1/posts/123
await comments.post('/', { text: 'Great!' }) // /api/v1/comments/

// 嵌套分组
const userPosts = users.group('/posts')
await userPosts.get('/') // /api/v1/users/posts/
```

## 常见问题

### 如何设置全局请求头？

在创建客户端时通过 `headers` 配置：

```typescript
const http = new HTTPClient('', {
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  }
})
```

### 如何处理文件上传？

使用 `FormData`：

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('name', 'filename')

await http.post('/upload', formData)
```

### 如何下载文件？

设置 `responseType` 为 `'blob'`：

```typescript
const response = await http.get<Blob>('/download/file', {
  responseType: 'blob'
})

// 创建下载链接
const url = URL.createObjectURL(response.data)
const a = document.createElement('a')
a.href = url
a.download = 'filename.pdf'
a.click()
URL.revokeObjectURL(url)
```

### 如何取消单个请求？

目前 `abort()` 会取消所有请求。如果需要取消单个请求，可以为每个请求创建独立的客户端实例：

```typescript
const requestClient = new HTTPClient()
const promise = requestClient.get('/long-request')

// 取消这个特定的请求
requestClient.abort()
```

### 查询参数中的对象如何处理？

对象会被自动转换为 JSON 字符串：

```typescript
await http.get('/search', {
  query: {
    filter: { status: 'active', role: 'admin' }
  }
})
// 实际请求：/search?filter={"status":"active","role":"admin"}
```

## 下一步

- [插件系统](/packages/http/plugins) - 学习如何使用插件扩展功能
- [类型定义](/packages/http/types) - 查看完整的类型定义
