---
title: HTTPClientPlugin HTTP 插件 API
description: "@cat-kit/http 插件 API 参考：HTTPClientPlugin 钩子接口（beforeRequest / afterRespond / onError）、TokenPlugin 令牌注入与刷新重试、MethodOverridePlugin 方法覆盖的完整签名、参数与执行顺序。"
aliases: [HTTP 插件 API, 插件钩子, 拦截器 API, TokenPlugin API, 请求拦截]
keywords: [HTTPClientPlugin, TokenPlugin, HTTPTokenPlugin, MethodOverridePlugin, HTTPMethodOverridePlugin, beforeRequest, afterRespond, onError, getter, authType, onRefresh, isExpired, shouldRefresh, maxRetries, X-HTTP-Method-Override, token 刷新, 401 重试, 无感刷新, 刷新令牌已过期, 插件名称冲突]
---

# HTTPClientPlugin HTTP 插件 API

`@cat-kit/http` 导出插件接口 `HTTPClientPlugin`（别名 `ClientPlugin`）与两个内置插件工厂 `TokenPlugin`（别名 `HTTPTokenPlugin`）、`MethodOverridePlugin`（别名 `HTTPMethodOverridePlugin`）。插件经 `new HTTPClient(prefix, { plugins })` 或 `http.registerPlugin(plugin)` 注册；`beforeRequest` 可改写 URL 与配置，`afterRespond` 可替换响应，`onError` 可恢复错误。

## 快速上手

```ts
import { HTTPClient, TokenPlugin } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  origin: 'https://api.example.com',
  plugins: [
    TokenPlugin({
      // getter 支持同步与异步；返回 null/undefined/'' 时不注入请求头
      getter: () => localStorage.getItem('access_token')
    })
  ]
})

// 请求头自动携带 Authorization: Bearer <access_token>
const res = await http.get<{ ok: boolean }>('/ping')
console.log(res.body.ok) // => true
```

## API 签名

```ts
/** 插件接口。三个钩子均可选；同步与异步返回值均支持 */
export interface HTTPClientPlugin {
  /** 插件名：非空字符串，且在 client 及其父链范围唯一，冲突抛 code 'PLUGIN' */
  name: string
  /**
   * 请求前钩子。context.url 为已拼接 prefix/origin/query 的最终 URL，
   * context.config 为已合并客户端默认值的配置；
   * 返回的 config 经 mergeRequestConfig 合并进请求配置
   */
  beforeRequest?(context: { url: string; config: RequestConfig }):
    | Promise<PluginHookResult | void>
    | PluginHookResult
    | void
  /**
   * 响应后钩子。返回 HTTPResponse 时替换当前响应，后续钩子收到替换后的响应；
   * 引擎抛错时本钩子会以 error.response 作为 response 先行执行
   */
  afterRespond?(context: {
    response: HTTPResponse
    url: string
    config: RequestConfig
    originalUrl: string
    originalConfig: RequestConfig
    client: IHTTPClient
  }): Promise<HTTPResponse | void> | HTTPResponse | void
  /**
   * 错误钩子。afterRespond 未恢复时触发，按注册顺序执行；
   * 返回含 number code、body、headers 的 HTTPResponse 结构时视为恢复，以首个为准
   */
  onError?(error: unknown, context: { url: string; config: RequestConfig }):
    | Promise<HTTPResponse | void>
    | HTTPResponse
    | void
}

/** beforeRequest 钩子返回类型：url 直接替换最终 URL；config 经 mergeRequestConfig 合并 */
export interface PluginHookResult {
  url?: string
  config?: RequestConfig
}

/** HTTPClientPlugin 的别名 */
export type ClientPlugin = HTTPClientPlugin

export interface HTTPTokenPluginOptions {
  /** 取 token 的函数，同步或异步。必填；返回 null/undefined/'' 时不注入请求头 */
  getter: () => string | null | undefined | Promise<string | null | undefined>
  /** 令牌请求头名。默认 'Authorization' */
  headerName?: string
  /** 授权类型：'Bearer'（默认）/ 'Basic' / 'Custom' */
  authType?: 'Bearer' | 'Basic' | 'Custom'
  /** 自定义格式化函数，仅 authType: 'Custom' 时生效；未提供时原样返回 token */
  formatter?: (token: string) => string
  /** 刷新回调；刷新进行期间并发请求共享同一个 Promise 并等待其完成 */
  onRefresh?: () => Promise<void>
  /** 返回 true 且已配置 onRefresh 时，请求前先执行刷新 */
  isExpired?: () => boolean
  /** 返回 true 时调用 onRefreshExpired 并抛 HTTPError('刷新令牌已过期', code 'AUTH')，请求不发送 */
  isRefreshExpired?: () => boolean
  /** 响应后判定是否刷新并重试（如 res.code === 401）；须同时配置 onRefresh，否则不重试 */
  shouldRefresh?: (response: HTTPResponse) => boolean
  /** refresh_token 过期回调（如清理本地凭证、跳转登录） */
  onRefreshExpired?: () => void
  /** 最大重试次数（重发请求数，不含首次）。默认 2；0 为不重试 */
  maxRetries?: number
}

/** HTTPTokenPluginOptions 的别名 */
export type TokenPluginOptions = HTTPTokenPluginOptions

/** Token 插件工厂。插件 name 固定为 'token'，同一插件链只能注册一个 */
export function HTTPTokenPlugin(options: HTTPTokenPluginOptions): HTTPClientPlugin

/** HTTPTokenPlugin 的别名 */
export const TokenPlugin: typeof HTTPTokenPlugin

export interface HTTPMethodOverridePluginOptions {
  /** 需要被重写的方法。默认 ['DELETE', 'PUT', 'PATCH'] */
  methods?: RequestMethod[]
  /** 重写后的方法。默认 'POST' */
  overrideMethod?: RequestMethod
  /** 携带原始方法的请求头名。默认 'X-HTTP-Method-Override' */
  headerName?: string
}

/** HTTPMethodOverridePluginOptions 的别名 */
export type MethodOverridePluginOptions = HTTPMethodOverridePluginOptions

/** 方法覆盖插件工厂。插件 name 固定为 'method-override'，options 可省略 */
export function HTTPMethodOverridePlugin(
  options?: HTTPMethodOverridePluginOptions
): HTTPClientPlugin

/** HTTPMethodOverridePlugin 的别名 */
export const MethodOverridePlugin: typeof HTTPMethodOverridePlugin
```

## 参数说明

### HTTPTokenPluginOptions

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `getter` | `() => string \| null \| undefined \| Promise<...>` | 无 | 是 | 返回 `null` / `undefined` / `''` 时不注入请求头；刷新重试时会重新调用以取新 token |
| `headerName` | `string` | `'Authorization'` | 否 | 令牌写入的请求头名 |
| `authType` | `'Bearer' \| 'Basic' \| 'Custom'` | `'Bearer'` | 否 | `Bearer` / `Basic` 拼接 `'<authType> <token>'`；`Custom` 走 `formatter` |
| `formatter` | `(token: string) => string` | 无 | 否 | 仅 `authType: 'Custom'` 时调用；未提供时原样返回 token |
| `onRefresh` | `() => Promise<void>` | 无 | 否 | 刷新进行中并发请求共享同一 Promise；刷新完成后 getter 重新取 token |
| `isExpired` | `() => boolean` | 无 | 否 | 返回 `true` 且已配置 `onRefresh` 时请求前先刷新；两者缺一不刷新 |
| `isRefreshExpired` | `() => boolean` | 无 | 否 | 返回 `true` 时调用 `onRefreshExpired` 并抛 `HTTPError('刷新令牌已过期', code 'AUTH')`，请求不发送 |
| `shouldRefresh` | `(response: HTTPResponse) => boolean` | 无 | 否 | 收到的是响应对象（非 2xx 响应经错误路径传入）；必须同时配置 `onRefresh` 才会重试 |
| `onRefreshExpired` | `() => void` | 无 | 否 | `isRefreshExpired` 为 `true` 时调用 |
| `maxRetries` | `number` | `2` | 否 | 重发请求次数上限（不含首次）；`0` 为不重试；默认 2 时单请求最多发出 3 次 |

### HTTPMethodOverridePluginOptions

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `methods` | `RequestMethod[]` | `['DELETE', 'PUT', 'PATCH']` | 否 | 命中列表的方法被重写；`[]` 表示全部不重写；匹配按大写原文比较 |
| `overrideMethod` | `RequestMethod` | `'POST'` | 否 | 改写后的方法；设为 `'GET'` / `'HEAD'` 时引擎会丢弃 body |
| `headerName` | `string` | `'X-HTTP-Method-Override'` | 否 | 原始方法写入的请求头名 |

## 方法与事件

钩子均为可选，同步与异步返回值等价处理。

### 钩子执行顺序

- 插件顺序：父链插件在前、自身在后；同层按注册顺序（`plugins` 数组顺序或 `registerPlugin` 调用顺序）。
- 单次请求管道：`beforeRequest`（按序）→ 同域 XSRF 头注入 → 引擎发送 → `afterRespond`（按序）。
- `beforeRequest({ url, config })`：`url` 是已拼接 `prefix` / `origin` / `query` 的最终 URL；返回 `{ url?, config? }`，`url` 直接替换最终 URL，`config` 经 `mergeRequestConfig` 合并（`headers` / `query` 对象合并，标量字段显式传入才覆盖）。
- `afterRespond({ response, url, config, originalUrl, originalConfig, client })`：返回 `HTTPResponse` 时替换当前响应并传给后续钩子；`client.request(originalUrl, originalConfig)` 可发起重试。
- 错误路径：引擎抛 `HTTPError` 且携带 `response` 时，先按序执行 `afterRespond`（`response` 为错误携带的响应）；若至少一个钩子返回了响应且链尾响应状态码为 2xx，请求正常 resolve；否则按序执行 `onError(error, { url, config })`，首个返回合法 `HTTPResponse` 结构（`code` 为 number、含 `body` 与 object `headers`）的结果作为恢复值，后续 `onError` 仍会执行（用于副作用）；全部未恢复则原样抛出错误。

### TokenPlugin 内部流程

`beforeRequest` 按以下顺序执行：

1. `isRefreshExpired()` 为 `true`：调用 `onRefreshExpired()`，抛 `HTTPError('刷新令牌已过期', { code: 'AUTH' })`，请求不发送。
2. 有刷新进行中：等待同一刷新 Promise 完成（并发只触发一次 `onRefresh`）。
3. `isExpired()` 为 `true` 且已配置 `onRefresh`：触发刷新并等待完成。
4. 调用 `getter()` 取 token；为空时返回空结果，不注入请求头。
5. 按 `authType` 格式化：`Bearer` / `Basic` 产出 `'<authType> <token>'`；`Custom` 产出 `formatter(token)`（未提供 `formatter` 时原样返回）；写入 `headerName`。

`afterRespond` 重试流程：`shouldRefresh(response)` 为 `true` 且已配置 `onRefresh` 且重试计数 `< maxRetries` 时，先刷新，再以 `originalUrl` + `originalConfig` 重发请求（重试计数写入配置 `_retryAttempt`）；重发会重新走完整插件管道，`getter` 取到新 token。重试次数耗尽后不再重发，错误原样抛出。

## 典型示例

### Bearer / Basic / Custom 令牌注入

```ts
import { HTTPClient, TokenPlugin } from '@cat-kit/http'

// Bearer（默认）：Authorization: Bearer <token>
const bearerHttp = new HTTPClient('/api', {
  plugins: [TokenPlugin({ getter: () => localStorage.getItem('access_token') })]
})

// Basic：Authorization: Basic <token>；token 须是已 Base64 的 'user:password'
const basicHttp = new HTTPClient('/api', {
  plugins: [
    TokenPlugin({
      getter: () => 'dXNlcjpwYXNzd29yZA==',
      authType: 'Basic'
    })
  ]
})

// Custom：用 formatter 自定义格式
const customHttp = new HTTPClient('/api', {
  plugins: [
    TokenPlugin({
      getter: () => sessionStorage.getItem('token'),
      authType: 'Custom',
      formatter: (token) => `Token ${token}`
    })
  ]
})

const res = await customHttp.get<{ ok: boolean }>('/ping')
// 请求头: Authorization: Token <token>
console.log(res.body.ok) // => true
```

### 401 刷新并自动重试

```ts
import { HTTPClient, HTTPError, TokenPlugin } from '@cat-kit/http'

let accessToken = 'old-token'

const http = new HTTPClient('/api', {
  plugins: [
    TokenPlugin({
      getter: () => accessToken,
      // 响应码 401 时刷新并重试
      shouldRefresh: (res) => res.code === 401,
      onRefresh: async () => {
        const res = await fetch('https://api.example.com/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        })
        const data = (await res.json()) as { accessToken: string }
        accessToken = data.accessToken // getter 会取到新 token
      },
      maxRetries: 1 // 首次 + 最多 1 次重试
    })
  ]
})

try {
  const res = await http.get<{ ok: boolean }>('/secure')
  console.log(res.code) // => 200（重试成功）
} catch (error) {
  // 重试次数耗尽仍 401 时走到这里
  if (error instanceof HTTPError && error.code === 'NETWORK') {
    console.log(error.response?.code) // => 401
  }
  throw error
}
```

### HTTP 方法覆盖

```ts
import { HTTPClient, HTTPMethodOverridePlugin } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  origin: 'https://api.example.com',
  plugins: [
    // 默认把 DELETE / PUT / PATCH 改写为 POST，原方法写入 X-HTTP-Method-Override
    HTTPMethodOverridePlugin({ methods: ['DELETE'] })
  ]
})

await http.delete('/users/42')
// 服务端收到: POST /api/users/42，请求头 X-HTTP-Method-Override: DELETE
```

## 注意事项

> [!WARNING]
> - 钩子签名为单上下文对象 `beforeRequest({ url, config })`，不是 axios 拦截器的 `(config)`，也不是 `(url, config)` 双参。
> - `TokenPlugin` 的 `name` 固定为 `'token'`：同一插件链注册两个 TokenPlugin 抛 `插件名称冲突: token`；`MethodOverridePlugin` 同理（`'method-override'`）。
> - `authType: 'Basic'` 只拼接 `Basic ` 前缀，不做 Base64 编码；凭证须先自行 Base64。
> - `shouldRefresh` 单独配置不生效，必须同时配置 `onRefresh`；重试计数是"重发次数"，默认 `maxRetries: 2` 时单请求最多发出 3 次。
> - `MethodOverridePlugin` 只改写 `method` 与注入请求头，不移动 body；`overrideMethod` 设为 `'GET'` / `'HEAD'` 时引擎会丢弃 body。
> - `onError` 返回的对象须含 number 类型 `code`、`body` 与 object 类型 `headers` 才算恢复；返回普通对象（如 `{ ok: true }`）不算，错误继续抛出。

## 常见问题

### 报错 `HTTPError: 刷新令牌已过期`

原因：`isRefreshExpired()` 返回 `true`。此时 `onRefreshExpired` 已被调用且请求未发送。修复：先恢复 refresh_token（如重新登录），或在 `isRefreshExpired` 中修正过期判定。

```ts
import { HTTPClient, HTTPError, TokenPlugin } from '@cat-kit/http'

let refreshTokenExpiredAt = Date.now() - 1

const http = new HTTPClient('/api', {
  plugins: [
    TokenPlugin({
      getter: () => 'token',
      isRefreshExpired: () => Date.now() >= refreshTokenExpiredAt,
      onRefreshExpired: () => {
        location.href = '/login' // refresh_token 失效，跳登录
      }
    })
  ]
})

try {
  await http.get('/data')
} catch (error) {
  if (error instanceof HTTPError && error.code === 'AUTH') {
    console.log(error.message) // => '刷新令牌已过期'
  }
  throw error
}
```

### 报错 `插件名称冲突: token`

原因：同一插件链上已存在 `TokenPlugin`（`name` 固定 `'token'`），再次注册同名插件。修复：整条链只保留一个 TokenPlugin 实例。

```ts
import { HTTPClient, TokenPlugin } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  plugins: [TokenPlugin({ getter: () => 'token' })]
})
// http.registerPlugin(TokenPlugin({ getter: () => 'token2' })) // 抛 code 'PLUGIN'
http.registerPlugin({ name: 'audit-log', beforeRequest({ url }) { console.log(url) } }) // 正常
```

### 配置了 `shouldRefresh` 却不重试

原因：未同时配置 `onRefresh`，插件的 `afterRespond` 直接返回不处理。修复：补上 `onRefresh`。

```ts
import { HTTPClient, TokenPlugin } from '@cat-kit/http'

let accessToken = 'token'
const http = new HTTPClient('/api', {
  plugins: [
    TokenPlugin({
      getter: () => accessToken,
      shouldRefresh: (res) => res.code === 401,
      onRefresh: async () => {
        accessToken = 'new-token' // 刷新逻辑
      }
    })
  ]
})
```
