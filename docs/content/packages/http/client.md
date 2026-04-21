---
title: HTTP 客户端
description: '@cat-kit/http 的 HTTPClient、请求方法、分组与错误处理'
outline: deep
---

# HTTP 客户端

## 介绍

`HTTPClient` 是 `@cat-kit/http` 的核心入口。它负责：

- 组合 `origin + prefix + url + query`
- 合并全局与单次请求配置
- 驱动插件链与引擎层
- 暴露 `get/post/put/delete/patch/head/options` 等便捷方法

默认情况下，如果当前环境存在全局 `fetch`，会自动使用 `FetchEngine`；否则退回到 `XHREngine`。

## 快速使用

```ts
import { HTTPClient } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  origin: 'https://example.com',
  timeout: 10_000,
  headers: { 'X-App': 'cat-kit' }
})

const users = await http.get<{ id: number; name: string }[]>('/users', {
  query: { page: 1 }
})

await http.post('/users', { name: 'Mimi' })
```

## API参考

### 创建实例

```ts
new HTTPClient(prefix?: string, config?: ClientConfig)
```

常用配置：

```ts
interface ClientConfig {
  origin?: string
  timeout?: number
  headers?: Record<string, string>
  credentials?: boolean
  plugins?: HTTPClientPlugin[]
  engine?: HttpEngine
}
```

- `prefix` 用于给当前 client 统一加路径前缀
- `origin` 只会作用于相对 URL；如果传入完整 URL，会跳过 `origin`
- `engine` 可替换底层发送实现，适合 mock、特殊运行时或自定义 transport

### 发送请求

```ts
request<T = any>(url: string, config?: RequestConfig): Promise<HTTPResponse<T>>
get<T>(url: string, config?: AliasRequestConfig): Promise<HTTPResponse<T>>
post<T = any>(url: string, body?: RequestConfig['body'], config?: Omit<RequestConfig, 'method' | 'body'>): Promise<HTTPResponse<T>>
put<T = any>(url: string, body?: RequestConfig['body'], config?: Omit<RequestConfig, 'method' | 'body'>): Promise<HTTPResponse<T>>
delete<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>
patch<T = any>(url: string, body?: RequestConfig['body'], config?: Omit<RequestConfig, 'method' | 'body'>): Promise<HTTPResponse<T>>
head<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>
options<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>
```

常用请求配置：

```ts
interface RequestConfig {
  method?: RequestMethod
  body?: BodyInit | Record<string, any>
  query?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
  credentials?: boolean
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
  signal?: AbortSignal
  onUploadProgress?: (info: ProgressInfo) => void
  onDownloadProgress?: (info: ProgressInfo) => void
}
```

几个关键行为：

- 对象类型 `body` 会自动序列化成 JSON，并补 `Content-Type: application/json`
- `query` 会附加到 URL 上；数组会展开成重复 key，对象会 `JSON.stringify`
- `onDownloadProgress` 在 `FetchEngine` 流式读取时可用
- `onUploadProgress` 只有 `XHREngine` 会真正回调，`FetchEngine` 下会被静默忽略

### 请求分组

```ts
const api = new HTTPClient('/api')
const users = api.group('/users')

await users.get('/profile') // /api/users/profile
```

`group()` 的语义：

- 子 client 继承父 client 的 `origin`、`timeout`、`credentials`、`headers`
- 父子共享同一个 `engine`
- 父插件会影响子插件链；子注册的插件不会反向影响父 client

### 运行时注册插件

```ts
const http = new HTTPClient()

http.registerPlugin({
  name: 'trace-id',
  beforeRequest(url, config) {
    return {
      url,
      config: {
        ...config,
        headers: { ...config.headers, 'X-Trace-Id': crypto.randomUUID() }
      }
    }
  }
})
```

约束：

- 每个插件必须有非空 `name`
- 同一条父子链里插件名必须唯一，冲突会抛 `HTTPError({ code: 'PLUGIN' })`

### 中止请求

```ts
const http = new HTTPClient()

http.get('/slow')
http.abort()
```

`abort()` 会调用当前 `engine.abort()`，因此在父子 `group()` 共享引擎时，任一侧调用 `abort()` 都会中止该引擎上的在途请求。

### 错误处理

请求失败时会抛 `HTTPError`：

```ts
import { HTTPError } from '@cat-kit/http'

try {
  await http.get('/users')
} catch (error) {
  if (error instanceof HTTPError) {
    console.log(error.code)
    console.log(error.response?.code)
  }
}
```

常见 `code`：

- `TIMEOUT`
- `ABORTED`
- `NETWORK`
- `PARSE`
- `RETRY_LIMIT_EXCEEDED`
- `PLUGIN`

### 自定义引擎

```ts
import { HTTPClient, HttpEngine } from '@cat-kit/http'
import type { HTTPResponse, RequestConfig } from '@cat-kit/http'

class MockEngine extends HttpEngine {
  async request<T = any>(_url: string, _config: RequestConfig): Promise<HTTPResponse<T>> {
    return {
      data: { ok: true } as T,
      code: 200,
      headers: {}
    }
  }

  abort(): void {}
}

const http = new HTTPClient('', { engine: new MockEngine() })
```
