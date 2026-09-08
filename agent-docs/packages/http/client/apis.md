---
title: HTTPClient HTTP 请求客户端 API
description: "@cat-kit/http 的 HTTPClient 客户端 API 参考：请求别名方法、业务分组、插件注册、可替换 fetch/XHR 引擎、HTTPResponse 响应结构与 HTTPError 统一错误处理。"
aliases: [HTTP 客户端 API, httpClient API, 请求客户端签名, FetchEngine, XHREngine]
keywords: [HTTPClient, mergeRequestConfig, HTTPError, HttpErrorCode, HTTPResponse, RequestConfig, ClientConfig, AliasRequestConfig, ProgressInfo, HttpEngine, FetchEngine, XHREngine, group, registerPlugin, abort, 请求超时, 请求被中止, 网络错误, 统一错误处理]
---

# HTTPClient HTTP 请求客户端 API

`@cat-kit/http` 导出客户端类 `HTTPClient`、配置合并函数 `mergeRequestConfig`、错误类 `HTTPError` 与引擎 `FetchEngine` / `XHREngine`（抽象基类 `HttpEngine`）。每个方法返回 `Promise<HTTPResponse<T>>`，数据在 `res.body`；HTTP 状态码非 2xx 时 reject `HTTPError`（`code: 'NETWORK'`），超时为 `'TIMEOUT'`，中止为 `'ABORTED'`。

## 快速上手

```ts
import { HTTPClient, HTTPError } from '@cat-kit/http'

interface User {
  id: number
  name: string
}

const http = new HTTPClient('/api/v1', {
  origin: 'https://api.example.com',
  timeout: 10_000
})

try {
  const res = await http.get<User>('/users/42', { query: { withDetail: true } })
  // 实际请求 URL: https://api.example.com/api/v1/users/42?withDetail=true
  console.log(res.body.name) // => 'Alice'
  console.log(res.code) // => 200
} catch (error) {
  if (error instanceof HTTPError) {
    // 非 2xx：code 为 'NETWORK'，message 形如 '请求失败，状态码: 404'
    console.error(error.code, error.message, error.response?.body)
  }
  throw error
}
```

## API 签名

```ts
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/** 客户端构造配置：new HTTPClient(prefix, config) 的第二参 */
export interface ClientConfig {
  /** 源（协议 + 主机 + 端口）。末尾斜杠会被去掉；url 已是完整 URL 时忽略此项。默认无 */
  origin?: string
  /** 默认超时（毫秒）。默认 0：不超时。超时后请求终止并抛 code 'TIMEOUT' */
  timeout?: number
  /** 默认请求头。与单次请求 headers 合并，同名键以单次请求为准 */
  headers?: Record<string, string>
  /** 是否随请求发送凭证（Cookie / HTTP 认证 / TLS 客户端证书）。默认 true；false 时不发送 */
  credentials?: boolean
  /** 构造时注册的插件，数组顺序即执行顺序；同名插件抛 code 'PLUGIN' */
  plugins?: HTTPClientPlugin[]
  /** 自定义引擎实例。默认：全局 fetch 可用时用 FetchEngine，否则用 XHREngine */
  engine?: HttpEngine
  /** 默认响应类型。默认按响应 Content-Type 自动推断 */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
  /** 默认终止信号，可被单次请求的 signal 覆盖 */
  signal?: AbortSignal
  /** 默认上传进度回调。仅 XHREngine 生效，FetchEngine 忽略 */
  onUploadProgress?: (info: ProgressInfo) => void
  /** 默认下载进度回调。FetchEngine 需响应体支持流式读取 */
  onDownloadProgress?: (info: ProgressInfo) => void
  /** XSRF Cookie 名。默认 'XSRF-TOKEN'。仅浏览器环境且同域请求生效 */
  xsrfCookieName?: string
  /** XSRF Header 名。默认 'X-XSRF-TOKEN' */
  xsrfHeaderName?: string
}

/** 单次请求配置 */
export interface RequestConfig {
  /** 请求方法。默认 'GET'。只接受大写 RequestMethod 值 */
  method?: RequestMethod
  /**
   * 请求体。对象 / 数组自动 JSON.stringify 并设 Content-Type: application/json；
   * URLSearchParams 设 Content-Type: application/x-www-form-urlencoded；
   * FormData 原样发送（Content-Type 由浏览器带 boundary 设置）；
   * GET / HEAD 忽略 body；假值 body（'' 、0）被忽略
   */
  body?: BodyInit | Record<string, any> | URLSearchParams | FormData
  /**
   * 查询参数，与 URL 已有查询串合并。数组值重复 key（tag=a&tag=b）；
   * undefined 跳过；null 输出字符串 'null'；嵌套对象 JSON.stringify 后输出
   */
  query?: Record<string, any>
  /** 请求头，覆盖客户端同名默认头 */
  headers?: Record<string, string>
  /** 单次请求超时（毫秒）。默认 0：不超时 */
  timeout?: number
  /** 单次请求是否发送凭证。默认 true */
  credentials?: boolean
  /** 响应类型。未设置时按响应 Content-Type 推断：application/json → json，text/* → text，image/ video/ audio/ application/octet-stream application/pdf → blob，其余 text */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
  /** 单次请求终止信号 */
  signal?: AbortSignal
  /** 上传进度回调（FetchEngine 忽略） */
  onUploadProgress?: (info: ProgressInfo) => void
  /** 下载进度回调 */
  onDownloadProgress?: (info: ProgressInfo) => void
  /** XSRF Cookie 名，覆盖客户端配置。默认 'XSRF-TOKEN' */
  xsrfCookieName?: string
  /** XSRF Header 名，覆盖客户端配置。默认 'X-XSRF-TOKEN' */
  xsrfHeaderName?: string
}

/** 省略 method 的 RequestConfig：get / delete / head / options 的 config 入参 */
export type AliasRequestConfig = Omit<RequestConfig, 'method'>

/** 响应结构 */
export interface HTTPResponse<T = any> {
  /** 解析后的响应体；responseType 为 json 且响应体为空文本时为 null */
  body: T
  /** HTTP 状态码 */
  code: number
  /** 响应头，键为小写；set-cookie 多值以换行符分隔 */
  headers: Record<string, string>
  /** 原始响应对象：FetchEngine 为 Response，XHREngine 为 XMLHttpRequest */
  raw?: Response | any
}

/** 传输进度信息 */
export interface ProgressInfo {
  /** 已传输字节数 */
  loaded: number
  /** 总字节数，未知时为 0 */
  total: number
  /** 进度百分比 0-100；total 为 0 时为 0 */
  percent: number
}

export type HttpErrorCode =
  | 'TIMEOUT' // 请求超时（timeout 到期）
  | 'ABORTED' // 请求被中止（signal 中止或 abort()）
  | 'NETWORK' // 网络错误或非 2xx 状态码
  | 'PARSE' // 响应 JSON 解析失败（FetchEngine；XHREngine 抛原生 SyntaxError）
  | 'AUTH' // Token 插件判定刷新令牌已过期
  | 'PLUGIN' // 插件注册校验失败
  | 'UNKNOWN' // 类型联合预留值，内置代码当前不抛出
  | 'RETRY_LIMIT_EXCEEDED' // 类型联合预留值，内置代码当前不抛出

export interface HTTPErrorOptions<T = any> {
  code: HttpErrorCode
  url?: string
  config?: RequestConfig
  response?: HTTPResponse<T>
  cause?: unknown
}

/** 统一错误类。name 固定为 'HTTPError'；用 instanceof HTTPError 判断 */
export class HTTPError<T = any> extends Error {
  code: HttpErrorCode
  url?: string
  config?: RequestConfig
  /** 非 2xx 时携带已按 responseType 解析的响应 */
  response?: HTTPResponse<T>
  cause?: unknown
  constructor(message: string, options: HTTPErrorOptions<T>)
}

export interface IHTTPClient {
  getEngine(): HttpEngine
  registerPlugin(plugin: HTTPClientPlugin): void
  request<T = any>(url: string, config?: RequestConfig): Promise<HTTPResponse<T>>
  get<T = any>(url: string, config?: AliasRequestConfig): Promise<HTTPResponse<T>>
  post<T = any>(
    url: string,
    body?: RequestConfig['body'],
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<HTTPResponse<T>>
  put<T = any>(
    url: string,
    body?: RequestConfig['body'],
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<HTTPResponse<T>>
  delete<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>
  patch<T = any>(
    url: string,
    body?: RequestConfig['body'],
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<HTTPResponse<T>>
  head<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>
  options<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>
  abort(): void
  group(prefix: string): IHTTPClient
}

export class HTTPClient implements IHTTPClient {
  /** prefix 为请求前缀，config 为客户端配置，二者均可省略 */
  constructor(prefix?: string, config?: ClientConfig)
  getEngine(): HttpEngine
  /** 注册插件。name 非空且在 client 及其父链范围唯一，否则抛 HTTPError code 'PLUGIN' */
  registerPlugin(plugin: HTTPClientPlugin): void
  request<T = any>(url: string, config?: RequestConfig): Promise<HTTPResponse<T>>
  get<T = any>(url: string, config?: AliasRequestConfig): Promise<HTTPResponse<T>>
  post<T = any>(
    url: string,
    body?: RequestConfig['body'],
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<HTTPResponse<T>>
  put<T = any>(
    url: string,
    body?: RequestConfig['body'],
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<HTTPResponse<T>>
  delete<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>
  patch<T = any>(
    url: string,
    body?: RequestConfig['body'],
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<HTTPResponse<T>>
  head<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>
  options<T = any>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<HTTPResponse<T>>
  /** 中止当前引擎上的全部在途请求 */
  abort(): void
  /** 创建子客户端：拼接前缀、继承配置与父链插件，共享同一引擎 */
  group(prefix: string): HTTPClient
}

/**
 * 合并两份请求配置：headers 恒合并；query 仅 patch.query !== undefined 时合并；
 * 标量字段（method/body/timeout/credentials/responseType/signal/进度回调/XSRF 名）
 * 仅当 patch 显式传入且非 undefined 时覆盖 base
 */
export function mergeRequestConfig(base: RequestConfig, patch: RequestConfig): RequestConfig

/** 引擎抽象基类：自定义底层（如 undici、msw mock）时继承并实现两个抽象成员 */
export abstract class HttpEngine {
  abstract request<T = any>(url: string, config: RequestConfig): Promise<HTTPResponse<T>>
  abstract abort(): void
}

export class FetchEngine extends HttpEngine {
  request<T = any>(url: string, config?: RequestConfig): Promise<HTTPResponse<T>>
  abort(): void
}

export class XHREngine extends HttpEngine {
  request<T = any>(url: string, config?: RequestConfig): Promise<HTTPResponse<T>>
  /** 逐个调用 xhr.setRequestHeader 设置请求头 */
  sendHeaders(xhr: XMLHttpRequest, headers: Record<string, string>): void
  abort(): void
}
```

## 参数说明

### ClientConfig

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `prefix`（构造第一参） | `string` | `''` | 否 | 请求路径前缀，与 `group` 前缀链式拼接；空串不追加 |
| `origin` | `string` | 无 | 否 | `协议://主机:端口`；末尾斜杠被去掉；`url` 为完整 URL（含 `://` 或以 `//` 开头）时忽略 |
| `timeout` | `number` | `0` | 否 | 毫秒；`0` 表示不超时；超时抛 `code: 'TIMEOUT'` |
| `headers` | `Record<string, string>` | 无 | 否 | 与单次请求 `headers` 合并，同名键以单次请求为准 |
| `credentials` | `boolean` | `true` | 否 | `false` 时 fetch 层为 `credentials: 'omit'`、XHR 层为 `withCredentials: false` |
| `plugins` | `HTTPClientPlugin[]` | `[]` | 否 | 数组顺序即执行顺序；重复 `name` 抛 `code: 'PLUGIN'` |
| `engine` | `HttpEngine` | 按 `fetch` 可用性自动选择 | 否 | 传入后该实例全部请求经此引擎；`group()` 父子共享同一实例 |
| `responseType` | `'json' \| 'text' \| 'blob' \| 'arraybuffer'` | 按 Content-Type 推断 | 否 | 推断规则：`application/json` → json，`text/*` → text，`application/octet-stream`、`image/*`、`video/*`、`audio/*`、`application/pdf` → blob，其余 → text |
| `signal` | `AbortSignal` | 无 | 否 | 客户端级默认信号；单次请求传 `signal` 时覆盖 |
| `onUploadProgress` | `(info: ProgressInfo) => void` | 无 | 否 | 仅 `XHREngine` 生效 |
| `onDownloadProgress` | `(info: ProgressInfo) => void` | 无 | 否 | `FetchEngine` 需响应体支持流式读取，`total` 取自 `content-length`，缺失时为 `0` |
| `xsrfCookieName` | `string` | `'XSRF-TOKEN'` | 否 | 仅浏览器环境且同域请求生效；Cookie 不存在时跳过 |
| `xsrfHeaderName` | `string` | `'X-XSRF-TOKEN'` | 否 | 仅浏览器环境且同域请求生效；Cookie 不存在时跳过 |

### RequestConfig

| 参数 | 类型 | 默认 | 必填 | 约束 |
| --- | --- | --- | :---: | --- |
| `method` | `RequestMethod` | `'GET'` | 否 | 仅大写枚举值；别名方法内部已设置 |
| `body` | `BodyInit \| Record<string, any> \| URLSearchParams \| FormData` | 无 | 否 | 对象/数组转 JSON 字符串；`GET` / `HEAD` 忽略；假值（`''`、`0`）忽略 |
| `query` | `Record<string, any>` | 无 | 否 | 数组重复 key；`undefined` 跳过；`null` 输出 `'null'`；嵌套对象 JSON 序列化；与 URL 已有查询串合并 |
| `headers` | `Record<string, string>` | 无 | 否 | 覆盖客户端同名默认头 |
| `timeout` | `number` | `0` | 否 | 毫秒；覆盖客户端默认值 |
| `credentials` | `boolean` | `true` | 否 | 覆盖客户端默认值 |
| `responseType` | `'json' \| 'text' \| 'blob' \| 'arraybuffer'` | 按 Content-Type 推断 | 否 | `json` 时空响应体解析为 `null` |
| `signal` | `AbortSignal` | 无 | 否 | 信号已中止时请求直接抛 `code: 'ABORTED'`，不发送 |
| `onUploadProgress` | `(info: ProgressInfo) => void` | 无 | 否 | 仅 `XHREngine` 生效 |
| `onDownloadProgress` | `(info: ProgressInfo) => void` | 无 | 否 | `FetchEngine` 走流式读取路径 |
| `xsrfCookieName` | `string` | `'XSRF-TOKEN'` | 否 | 覆盖客户端配置 |
| `xsrfHeaderName` | `string` | `'X-XSRF-TOKEN'` | 否 | 覆盖客户端配置 |

## 方法与事件

全部请求方法异步，返回 `Promise<HTTPResponse<T>>`，`T` 为 `res.body` 的类型；错误路径见下方错误码表。

- `request<T>(url, config?)`：基础方法；`url` 为相对路径时拼 `prefix` 与 `origin`，为完整 URL 时跳过拼接；`query` 对两种 `url` 都追加。
- `get<T>(url, config?)`：等同 `request(url, { ...config, method: 'GET' })`，`config` 不含 `method`。
- `post<T>(url, body?, config?)`、`put<T>(url, body?, config?)`、`patch<T>(url, body?, config?)`：第二参为请求体，`config` 不含 `method` 与 `body`。
- `delete<T>(url, config?)`、`head<T>(url, config?)`、`options<T>(url, config?)`：`config` 不含 `method`。
- `abort()`：同步，无返回值。调用当前引擎的 `abort()`，中止该引擎上全部在途请求；`group()` 父子共享引擎，任一方调用都影响全部。
- `group(prefix)`：同步，返回新的 `HTTPClient`。前缀拼接在父前缀之后；继承 `origin` / `timeout` / `credentials` / `headers` / `engine` / `responseType` / `signal` / 进度回调 / XSRF 配置；插件经父链动态继承（父之后注册的插件对子生效），子注册的插件不影响父。
- `registerPlugin(plugin)`：同步，无返回值。`plugin` 为 `null`、缺 `name`、`name` 为空串时抛 `HTTPError('插件必须提供非空 name 字段', { code: 'PLUGIN' })`；`name` 与自身或父链已有插件重复时抛 `HTTPError('插件名称冲突: <name>', { code: 'PLUGIN' })`。
- `getEngine()`：同步，返回当前引擎实例。

错误码与触发条件（`HTTPError.message` 为报错原文）：

| `code` | `message` | 触发条件 |
| --- | --- | --- |
| `'NETWORK'` | `请求失败，状态码: <status>` | HTTP 状态码非 2xx；`error.response` 携带已解析的响应体 |
| `'NETWORK'` | `网络错误` | fetch / XHR 层请求失败；无 `response` |
| `'TIMEOUT'` | `请求超时` | `timeout > 0` 且在时限内未收到响应 |
| `'ABORTED'` | `请求被中止` | `signal` 已中止或被中止、或调用 `abort()` |
| `'PARSE'` | `响应解析失败` | FetchEngine 下 JSON 解析失败；XHREngine 下同场景抛原生 `SyntaxError` |
| `'PLUGIN'` | `插件必须提供非空 name 字段`、`插件名称冲突: <name>` | `registerPlugin` 校验失败 |

URL 拼接规则：相对 `url` 先与 `prefix` 拼接（`joinUrlPath` 语义，多余斜杠合并为单个 `/`），再拼 `origin`（去掉末尾斜杠）；`query` 序列化后以 `?` 或 `&` 追加；已编码的路径保持原样不转码。

## 典型示例

### 业务分组与查询参数

```ts
import { HTTPClient } from '@cat-kit/http'

const api = new HTTPClient('/api/v1', { origin: 'https://api.example.com' })
const users = api.group('/users')

interface UserListItem {
  id: number
  name: string
}

const res = await users.get<UserListItem[]>('/list', {
  query: { tag: ['admin', 'new'], active: true, cursor: undefined, q: null }
})
// 请求 URL: https://api.example.com/api/v1/users/list?tag=admin&tag=new&active=true&q=null
// cursor 为 undefined 被跳过；数组重复 key；null 输出字符串 'null'
console.log(res.body.length) // => 2
```

### 非 2xx 与超时的统一错误处理

```ts
import { HTTPClient, HTTPError } from '@cat-kit/http'

const api = new HTTPClient('/api', {
  origin: 'https://api.example.com',
  timeout: 3000
})

interface ErrorBody {
  message: string
}

try {
  await api.get('/orders/1')
} catch (error) {
  if (error instanceof HTTPError) {
    switch (error.code) {
      case 'NETWORK':
        // 非 2xx：error.response.body 已按 responseType 解析
        console.log(error.response?.code, (error.response?.body as ErrorBody).message)
        break
      case 'TIMEOUT':
        console.log(error.message) // => '请求超时'
        break
      case 'ABORTED':
        console.log(error.message) // => '请求被中止'
        break
      default:
        throw error
    }
  } else {
    throw error
  }
}
```

### 中止请求：signal 与 abort()

```ts
import { HTTPClient, HTTPError } from '@cat-kit/http'

const api = new HTTPClient('/api', { origin: 'https://api.example.com' })

// 方式一：单次请求传 signal
const controller = new AbortController()
const pending = api.get('/search', { query: { q: 'cat' }, signal: controller.signal })
controller.abort()
try {
  await pending
} catch (error) {
  if (error instanceof HTTPError && error.code === 'ABORTED') {
    console.log(error.message) // => '请求被中止'
  }
}

// 方式二：中止该客户端引擎上的全部在途请求（含 group 派生客户端的请求）
api.abort()
```

## 注意事项

> [!WARNING]
> - 本库返回 `HTTPResponse`，数据在 `res.body`，不是 axios 的 `AxiosResponse`；禁止写 `res.data`。
> - 非 2xx 会 reject `HTTPError`（`code: 'NETWORK'`），不会以 `res.code === 404` 正常 resolve；错误响应体在 `error.response.body`。
> - `credentials` 默认 `true`（跨域也携带 Cookie），fetch 原生默认是 `same-origin`；不需要时显式传 `false`。
> - `query` 数组序列化为重复 key（`?tag=a&tag=b`）、`null` 输出字符串 `'null'`、嵌套对象 JSON 序列化；与 axios params 的 `tag[]=` 风格不同。
> - `GET` / `HEAD` 请求的 `body` 被静默丢弃；假值 body（`''`、`0`）同样被忽略。
> - 绝对 URL（含 `://` 或以 `//` 开头）跳过 `prefix` 与 `origin` 拼接，但 `query` 仍会追加。
> - `group()` 父子共享同一引擎实例：任一方 `abort()` 会中止该引擎上的全部在途请求。
> - `method` 只接受 `RequestMethod` 的大写枚举值：`'GET'` / `'POST'` / `'PUT'` / `'DELETE'` / `'PATCH'` / `'HEAD'` / `'OPTIONS'`。
> - `timeout` 默认 `0` 即不超时；`FetchEngine` 忽略 `onUploadProgress`，上传进度须用 `XHREngine`。
> - JSON 解析失败时 `FetchEngine` 抛 `HTTPError`（`code: 'PARSE'`），`XHREngine` 抛原生 `SyntaxError`；用 `instanceof HTTPError` 判断时不要漏掉后者。
> - 同域请求会自动把 Cookie `XSRF-TOKEN` 写入请求头 `X-XSRF-TOKEN`（名称可配）；跨域请求与 Node 环境不做此注入。

## 常见问题

### 报错 `HTTPError: 请求失败，状态码: 404`

原因：HTTP 状态码非 2xx，本库将其归一为 `code: 'NETWORK'` 的 `HTTPError`，`error.response` 携带已解析的响应。按业务码分流：

```ts
import { HTTPClient, HTTPError } from '@cat-kit/http'

const api = new HTTPClient('/api', { origin: 'https://api.example.com' })

try {
  await api.get('/missing')
} catch (error) {
  if (error instanceof HTTPError && error.code === 'NETWORK') {
    console.log(error.response?.code) // => 404
    console.log(error.response?.body) // => 服务端返回的已解析响应体
  }
}
```

### 报错 `插件必须提供非空 name 字段`

原因：`registerPlugin` 收到 `null`、无 `name` 字段或 `name` 为空串的插件。修复：补上非空 `name`。

```ts
import { HTTPClient } from '@cat-kit/http'

const http = new HTTPClient()
http.registerPlugin({ name: 'log', beforeRequest({ url }) { console.log(url) } })
```

### 报错 `插件名称冲突: log`

原因：同一 client 及其父链上已存在同名插件。修复：换名后注册，或移除旧注册。

```ts
import { HTTPClient } from '@cat-kit/http'

const http = new HTTPClient()
http.registerPlugin({ name: 'log-a' })
// http.registerPlugin({ name: 'log-a' }) // 抛 HTTPError code 'PLUGIN'
http.registerPlugin({ name: 'log-b' }) // 不同名，注册成功
```
