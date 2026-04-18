# HTTP 请求客户端

`@cat-kit/http` 是一个轻量的 HTTP 请求客户端，支持浏览器与 Node.js（取决于运行时是否提供 `fetch` 与 `XMLHttpRequest`）。

## 特性

- 支持标准 HTTP 方法（`GET`/`POST`/`PUT`/`DELETE`/`PATCH`/`HEAD`/`OPTIONS`）
- 支持请求分组（`group`）与批量中止（`abort`）
- 支持插件扩展（请求前、响应后、错误钩子）
- 内置 `HTTPTokenPlugin`、`HTTPMethodOverridePlugin` 与 `RetryPlugin`
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
  plugins?: HTTPClientPlugin[]
  engine?: HttpEngine
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
interface HTTPClientPlugin {
  /** 插件名称（必填、同一 client 及其父链中唯一） */
  name: string
  beforeRequest?(
    url: string,
    config: RequestConfig
  ): PluginHookResult | void | Promise<PluginHookResult | void>
  afterRespond?(
    response: HTTPResponse,
    url: string,
    config: RequestConfig,
    context?: PluginContext
  ): HTTPResponse | void | Promise<HTTPResponse | void>
  onError?(
    error: unknown,
    context: RequestContext
  ): HTTPResponse | void | Promise<HTTPResponse | void>
}
```

### HTTPTokenPlugin

```ts
import { HTTPClient, HTTPTokenPlugin } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  plugins: [
    HTTPTokenPlugin({
      getter: () => localStorage.getItem('token'),
      authType: 'Bearer',
      headerName: 'Authorization'
    })
  ]
})
```

### HTTPMethodOverridePlugin

```ts
import { HTTPClient, HTTPMethodOverridePlugin } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  plugins: [
    HTTPMethodOverridePlugin({
      methods: ['DELETE', 'PUT', 'PATCH'],
      overrideMethod: 'POST',
      headerName: 'X-HTTP-Method-Override'
    })
  ]
})
```

### 运行时动态注册插件

```ts
const http = new HTTPClient('/api')

http.registerPlugin({
  name: 'audit',
  beforeRequest(url) {
    console.log('[audit]', url)
  }
})
```

## 错误处理

`@cat-kit/http` 使用 `HTTPError` 表示标准化错误：

- `TIMEOUT`：请求超时
- `ABORTED`：请求被主动中止
- `NETWORK`：网络异常或非 2xx HTTP 状态
- `PARSE`：响应解析失败
- `RETRY_LIMIT_EXCEEDED`：重试次数超出上限
- `PLUGIN`：插件注册违规（缺失非空 `name` 或名称冲突）
- `UNKNOWN`：未知错误（保留）

`fetch` 与 `XMLHttpRequest` 引擎都会在非 2xx 响应时抛出 `HTTPError`，并把原始响应挂在 `error.response` 上。

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

子 client 通过父链继承插件：**父影响子、子不影响父**，同名校验跨父子层级生效；父子共享同一 `engine` 实例，`abort()` 会中止父或子任意一方触发该引擎的所有在途请求。

## 迁移说明（插件 API 重命名）

从旧版本升级到当前版本时，插件相关 API 做了以下重命名（行为等价，仅名称变更；同时插件 `name` 字段从可选变为**必填且唯一**）：

| 旧名 | 新名 |
|------|------|
| `ClientPlugin` | `HTTPClientPlugin` |
| `TokenPlugin` | `HTTPTokenPlugin` |
| `TokenPluginOptions` | `HTTPTokenPluginOptions` |
| `MethodOverridePlugin` | `HTTPMethodOverridePlugin` |
| `MethodOverridePluginOptions` | `HTTPMethodOverridePluginOptions` |

`RetryPlugin` / `RetryPluginOptions` 命名保持不变。

内置插件均已自带 `name`（`token` / `method-override` / `retry`），用户自定义插件需手动补齐非空 `name`；若与已注册插件（含父链）重名，会抛 `HTTPError({ code: 'PLUGIN' })`。
