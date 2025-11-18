---
title: 类型定义
description: HTTP 包的完整 TypeScript 类型定义
outline: deep
---

# 类型定义

本文档列出了 `@cat-kit/http` 包的所有 TypeScript 类型定义。

## 核心类型

### RequestMethod

HTTP 请求方法类型。

```typescript
type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
```

**说明：**

- 包含所有标准的 HTTP 请求方法
- 用于类型安全的方法指定

## 配置类型

### ClientConfig

客户端全局配置接口。

```typescript
interface ClientConfig {
  /**
   * 源地址
   * - 由协议、主机名（域名）和端口定义
   * - 如果未指定，默认为当前页面的 location.href
   * - 如果 url 已经是一个完整的 URL，则会忽略此配置
   */
  origin?: string

  /**
   * 请求超时时间（单位：ms）
   * - 默认为 0，即不超时
   * - 设置超时时间后，请求会在指定时间后自动终止，并抛出 408 错误
   * - 除了上传下载文件，通常情况下，普通请求不应该很长
   */
  timeout?: number

  /**
   * HTTP 默认请求头
   * - 这里指定的是实例请求头配置
   * - 如果在请求配置中传入了 headers，则 header 会被合并
   * - 相同的 header 会被请求配置覆盖
   */
  headers?: Record<string, string>

  /**
   * 控制浏览器是否发送凭证
   * - 默认发送，即在同源请求时发送凭证
   * - 如果设置为 false，则在任何请求时都不会发送凭证
   * @default true
   */
  credentials?: boolean

  /**
   * 插件列表
   * - 插件是一种扩展机制，可以用于修改请求和响应
   */
  plugins?: ClientPlugin[]
}
```

**使用示例：**

```typescript
const config: ClientConfig = {
  origin: 'https://api.example.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': '1.0'
  },
  credentials: true,
  plugins: [TokenPlugin({ getter: () => 'token' })]
}
```

### RequestConfig

单个请求的配置接口。

```typescript
interface RequestConfig {
  /**
   * 请求方法
   * - 默认 'GET'
   */
  method?: RequestMethod

  /**
   * 请求体
   * - ReadableStream 数据在不支持 fetch 的环境下无效
   * - JS 对象会被自动转换为 JSON 字符串
   * - 自动设置 Content-Type 为 application/json
   */
  body?: BodyInit | Record<string, any>

  /**
   * 查询参数
   * - 如果在 url 中也指定了查询参数，那么它们会被合并
   * - 查询参数会被自动转换为 key=value 的形式
   * - 对象类型的值会被 JSON 序列化
   */
  query?: Record<string, any>

  /**
   * 请求头
   * @see https://developer.mozilla.org/zh-CN/docs/Glossary/Request_header
   */
  headers?: Record<string, string>

  /**
   * 请求超时时间（单位：ms）
   * - 会覆盖客户端全局配置的 timeout
   */
  timeout?: number

  /**
   * 请求是否携带凭证
   * - 会覆盖客户端全局配置的 credentials
   */
  credentials?: boolean

  /**
   * 响应类型
   * - 'json': 解析为 JSON（默认）
   * - 'text': 解析为文本
   * - 'blob': 解析为 Blob
   * - 'arraybuffer': 解析为 ArrayBuffer
   * @default 'json'
   */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
}
```

**使用示例：**

```typescript
const config: RequestConfig = {
  method: 'POST',
  body: { name: '张三', age: 18 },
  query: { page: 1, size: 10 },
  headers: { 'X-Request-ID': '123' },
  timeout: 5000,
  responseType: 'json'
}
```

### AliasRequestConfig

请求别名方法的配置类型，不包含 `method` 字段。

```typescript
type AliasRequestConfig = Omit<RequestConfig, 'method'>
```

**说明：**

- 用于 `get()`、`delete()` 等方法
- 这些方法已经指定了请求方法，不需要再传入 `method`

**使用示例：**

```typescript
const config: AliasRequestConfig = {
  query: { page: 1 },
  headers: { 'X-Custom': 'value' }
}

await http.get('/users', config)
```

## 响应类型

### HTTPResponse

HTTP 响应接口。

```typescript
interface HTTPResponse<T = any> {
  /**
   * 响应的数据
   * - 根据 responseType 自动解析
   * - 默认解析为 JSON
   */
  data: T

  /**
   * HTTP 状态码
   * - 2xx: 成功
   * - 3xx: 重定向
   * - 4xx: 客户端错误
   * - 5xx: 服务器错误
   */
  code: number

  /**
   * 响应标头
   * - 所有响应头的键值对
   */
  headers: Record<string, string>

  /**
   * 原始响应对象
   * - Fetch API 的 Response 对象
   * - 或 XMLHttpRequest 对象
   */
  raw?: Response | any
}
```

**使用示例：**

```typescript
// 泛型指定响应数据类型
interface User {
  id: number
  name: string
}

const response: HTTPResponse<User> = await http.get('/user/123')

console.log(response.data.name) // 类型安全
console.log(response.code) // 200
console.log(response.headers['content-type']) // 'application/json'
```

## 插件类型

### ClientPlugin

客户端插件接口。

```typescript
interface ClientPlugin {
  /**
   * 请求前钩子
   * @param url 请求 URL
   * @param config 请求配置
   * @returns 修改后的 URL 和请求选项
   */
  beforeRequest?(
    url: string,
    config: RequestConfig
  ): Promise<PluginHookResult | void> | PluginHookResult | void

  /**
   * 响应后钩子
   * @param response 响应对象
   * @param url 请求 URL
   * @param config 请求配置
   * @returns 修改后的响应对象
   */
  afterRespond?(
    response: HTTPResponse,
    url: string,
    config: RequestConfig
  ): Promise<HTTPResponse | void> | HTTPResponse | void
}
```

**说明：**

- 两个钩子都是可选的
- 可以返回 Promise 以支持异步操作
- `beforeRequest` 返回 `PluginHookResult` 或 `void`
- `afterRespond` 返回 `HTTPResponse` 或 `void`

**使用示例：**

```typescript
const myPlugin: ClientPlugin = {
  beforeRequest(url, config) {
    console.log('请求前:', url)
    return {
      config: {
        ...config,
        headers: {
          ...config.headers,
          'X-Custom': 'value'
        }
      }
    }
  },

  afterRespond(response) {
    console.log('响应后:', response.code)
    return response
  }
}
```

### PluginHookResult

插件钩子返回类型。

```typescript
interface PluginHookResult {
  /**
   * 修改后的 URL
   * - 如果指定，将使用这个 URL 发送请求
   */
  url?: string

  /**
   * 修改后的请求配置
   * - 会与原配置合并
   */
  config?: RequestConfig
}
```

**使用示例：**

```typescript
function modifyUrlPlugin(): ClientPlugin {
  return {
    beforeRequest(url, config) {
      // 修改 URL
      const result: PluginHookResult = {
        url: url + '?modified=true',
        config: {
          ...config,
          headers: {
            ...config.headers,
            'X-Modified': 'true'
          }
        }
      }
      return result
    }
  }
}
```

## 引擎类型

### HttpEngine

HTTP 引擎接口（内部使用）。

```typescript
interface HttpEngine {
  /**
   * 发送 HTTP 请求
   * @param url 请求 URL
   * @param config 请求配置
   * @returns Promise<HTTPResponse>
   */
  request<T = any>(url: string, config: RequestConfig): Promise<HTTPResponse<T>>

  /**
   * 中止所有请求
   */
  abort(): void
}
```

**说明：**

- 这是内部接口，通常不需要直接使用
- 有两个实现：`FetchEngine` 和 `XHREngine`

## 工具类型

### 条件响应类型

使用 TypeScript 的条件类型来提供更好的类型推断：

```typescript
// 根据 responseType 推断响应数据类型
type ResponseData<T extends RequestConfig['responseType']> = T extends 'json'
  ? any
  : T extends 'text'
  ? string
  : T extends 'blob'
  ? Blob
  : T extends 'arraybuffer'
  ? ArrayBuffer
  : any

// 使用示例
async function fetchFile() {
  const response = await http.get<Blob>('/file', {
    responseType: 'blob'
  })
  // response.data 的类型为 Blob
}
```

### 严格类型的请求体

为请求体提供更严格的类型：

```typescript
type RequestBody<T> = T extends 'json' ? Record<string, any> : BodyInit

// 使用示例
interface CreateUserDTO {
  name: string
  email: string
}

const body: RequestBody<'json'> = {
  name: '张三',
  email: 'zhangsan@example.com'
}
```

## 类型守卫

### 检查响应是否成功

```typescript
function isSuccessResponse(response: HTTPResponse): boolean {
  return response.code >= 200 && response.code < 300
}

// 使用
const response = await http.get('/api/users')
if (isSuccessResponse(response)) {
  console.log('请求成功')
}
```

### 检查是否为错误响应

```typescript
function isErrorResponse(response: HTTPResponse): boolean {
  return response.code >= 400
}
```

## 完整示例

### 类型安全的 API 封装

```typescript
import type { HTTPResponse, ClientConfig } from '@cat-kit/http'
import { HTTPClient } from '@cat-kit/http'

// 定义 API 响应的通用格式
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 定义业务实体类型
interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

interface Post {
  id: number
  title: string
  content: string
  authorId: number
}

// 创建类型安全的 API 客户端
class TypedAPIClient {
  private client: HTTPClient

  constructor(baseURL: string, config?: ClientConfig) {
    this.client = new HTTPClient(baseURL, config)
  }

  // 泛型方法，返回类型安全的响应
  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url)
    return response.data.data
  }

  async post<T, D = any>(url: string, data: D): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data)
    return response.data.data
  }

  // 用户相关 API
  getUser(id: number): Promise<User> {
    return this.get<User>(`/users/${id}`)
  }

  getUsers(): Promise<User[]> {
    return this.get<User[]>('/users')
  }

  createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return this.post<User>('/users', data)
  }

  // 文章相关 API
  getPost(id: number): Promise<Post> {
    return this.get<Post>(`/posts/${id}`)
  }

  getPosts(): Promise<Post[]> {
    return this.get<Post[]>('/posts')
  }
}

// 使用示例
const api = new TypedAPIClient('/api')

async function example() {
  // 类型安全的 API 调用
  const user = await api.getUser(1)
  console.log(user.name) // TypeScript 知道 user 有 name 属性

  const users = await api.getUsers()
  users.forEach(u => console.log(u.email)) // 类型安全

  const newUser = await api.createUser({
    name: '张三',
    email: 'zhangsan@example.com'
  })
  console.log(newUser.id) // 类型安全
}
```

### 自定义插件类型

```typescript
import type { ClientPlugin, RequestConfig, HTTPResponse } from '@cat-kit/http'

// 定义插件配置类型
interface LoggerPluginOptions {
  level: 'info' | 'debug' | 'error'
  prefix?: string
}

// 实现类型安全的插件
function createLoggerPlugin(options: LoggerPluginOptions): ClientPlugin {
  const { level, prefix = '[HTTP]' } = options

  return {
    beforeRequest(url: string, config: RequestConfig) {
      if (level === 'debug') {
        console.log(`${prefix} [${config.method}] ${url}`)
      }
    },

    afterRespond(response: HTTPResponse) {
      if (level === 'info' || level === 'debug') {
        console.log(`${prefix} Response [${response.code}]`)
      }
      return response
    }
  }
}

// 使用
const plugin = createLoggerPlugin({
  level: 'debug',
  prefix: '[API]'
})
```

## 常见问题

### 如何为响应数据指定类型？

使用泛型参数：

```typescript
interface User {
  id: number
  name: string
}

// 方式 1：直接指定
const response = await http.get<User>('/user/1')

// 方式 2：通过 HTTPResponse
const response: HTTPResponse<User> = await http.get('/user/1')

// response.data 的类型都是 User
```

### 如何处理多种可能的响应类型？

使用联合类型：

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

const response = await http.get<ApiResponse<User>>('/user/1')

if (response.data.success) {
  console.log(response.data.data.name) // 类型安全
} else {
  console.error(response.data.error) // 类型安全
}
```

### 如何扩展配置类型？

使用接口扩展：

```typescript
interface CustomConfig extends ClientConfig {
  customOption?: string
}

interface CustomRequestConfig extends RequestConfig {
  customOption?: string
}

// 注意：实际使用时，HTTPClient 不会处理自定义选项
// 需要通过插件来处理
```

## 下一步

- [HTTP 客户端](/packages/http/client) - 查看客户端 API 使用
- [插件系统](/packages/http/plugins) - 学习插件开发
