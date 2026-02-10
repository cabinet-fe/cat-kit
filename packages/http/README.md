# HTTP 请求客户端

`@cat-kit/http` 是一个轻量的 HTTP 请求客户端，支持浏览器与 Node.js（取决于运行时是否提供 `fetch` 与 `XMLHttpRequest`）。

## 特性

- 支持标准 HTTP 方法（`GET`/`POST`/`PUT`/`DELETE`/`PATCH`/`HEAD`/`OPTIONS`）
- 支持请求分组（`group`）与批量中止（`abort`）
- 支持插件扩展（请求前、响应后、错误钩子）
- 内置 `TokenPlugin` 与 `MethodOverridePlugin`
- 完整 TypeScript 类型支持

## 安装

```bash
npm install @cat-kit/http
# 或
pnpm add @cat-kit/http
# 或
yarn add @cat-kit/http
# 或
bun add @cat-kit/http
```

## 基础使用

```ts
import { HTTPClient } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  origin: 'https://example.com',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' }
})

const users = await http.get('/users')
console.log(users.data)
```

## 配置说明

```ts
interface ClientConfig {
  origin?: string
  timeout?: number
  headers?: Record<string, string>
  credentials?: boolean
  plugins?: ClientPlugin[]
}

interface RequestConfig {
  method?: RequestMethod
  body?: BodyInit | Record<string, any>
  query?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
  credentials?: boolean
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
}
```

## 插件系统

```ts
interface ClientPlugin {
  beforeRequest?(url: string, config: RequestConfig): PluginHookResult | void | Promise<PluginHookResult | void>
  afterRespond?(response: HTTPResponse, url: string, config: RequestConfig): HTTPResponse | void | Promise<HTTPResponse | void>
  onError?(error: unknown, context: RequestContext): void | Promise<void>
}
```

### TokenPlugin

```ts
import { HTTPClient, TokenPlugin } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  plugins: [
    TokenPlugin({
      getter: () => localStorage.getItem('token'),
      authType: 'Bearer',
      headerName: 'Authorization'
    })
  ]
})
```

### MethodOverridePlugin

```ts
import { HTTPClient, MethodOverridePlugin } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  plugins: [
    MethodOverridePlugin({
      methods: ['DELETE', 'PUT', 'PATCH'],
      overrideMethod: 'POST',
      headerName: 'X-HTTP-Method-Override'
    })
  ]
})
```

## 错误处理

`@cat-kit/http` 使用 `HTTPError` 表示标准化错误：

- `TIMEOUT`：请求超时
- `ABORTED`：请求被主动中止
- `NETWORK`：网络异常或非 2xx XHR 状态
- `PARSE`：响应解析失败
- `UNKNOWN`：未知错误（保留）

```ts
import { HTTPError } from '@cat-kit/http'

try {
  await http.get('/users')
} catch (error) {
  if (error instanceof HTTPError) {
    console.error(error.code, error.message)
  }
}
```

## 请求分组

```ts
const api = new HTTPClient('/api')
const user = api.group('/users')

await user.get('/profile') // /api/users/profile

user.abort() // 中止该分组引擎内请求
```
