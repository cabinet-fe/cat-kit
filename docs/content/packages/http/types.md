---
title: 类型定义
description: '@cat-kit/http 的核心类型、错误类型与插件上下文'
outline: deep
---

# 类型定义

## 介绍

这页汇总 `@cat-kit/http` 暴露给业务代码最常用的类型：请求配置、响应结构、进度回调、插件钩子上下文和错误类型。

## 快速使用

```ts
import type {
  ClientConfig,
  RequestConfig,
  HTTPResponse,
  HTTPError,
  HTTPClientPlugin
} from '@cat-kit/http'
```

## API参考

### 基础请求类型

```ts
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

interface ClientConfig {
  origin?: string
  timeout?: number
  headers?: Record<string, string>
  credentials?: boolean
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
  signal?: AbortSignal
  onUploadProgress?: (info: ProgressInfo) => void
  onDownloadProgress?: (info: ProgressInfo) => void
  plugins?: HTTPClientPlugin[]
  engine?: HttpEngine
  xsrfCookieName?: string
  xsrfHeaderName?: string
}

interface RequestConfig {
  method?: RequestMethod
  body?: BodyInit | Record<string, any> | URLSearchParams | FormData
  query?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
  credentials?: boolean
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
  signal?: AbortSignal
  onUploadProgress?: (info: ProgressInfo) => void
  onDownloadProgress?: (info: ProgressInfo) => void
  xsrfCookieName?: string
  xsrfHeaderName?: string
}

type AliasRequestConfig = Omit<RequestConfig, 'method'>
```

### 响应与进度

```ts
interface HTTPResponse<T = any> {
  body: T
  code: number
  headers: Record<string, string | string[]>
  raw?: Response | any
}

interface ProgressInfo {
  loaded: number
  total: number
  percent: number
}
```

`percent` 的计算规则：

- `total > 0` 时返回 `0-100`
- `total === 0` 时固定为 `0`

### 错误类型

```ts
type HttpErrorCode =
  | 'TIMEOUT'
  | 'ABORTED'
  | 'NETWORK'
  | 'PARSE'
  | 'AUTH'
  | 'UNKNOWN'
  | 'RETRY_LIMIT_EXCEEDED'
  | 'PLUGIN'
```

推荐按 `instanceof HTTPError` + `error.code` 分支处理，而不是直接依赖错误消息文本。

### 插件相关类型

```ts
interface PluginHookResult {
  url?: string
  config?: RequestConfig
}

interface AfterRespondContext {
  response: HTTPResponse
  url: string
  config: RequestConfig
  originalUrl: string
  originalConfig: RequestConfig
  client: IHTTPClient
}

interface RequestContext {
  url: string
  config: RequestConfig
}

interface HTTPClientPlugin {
  name: string
  beforeRequest?(
    context: { url: string; config: RequestConfig }
  ): Promise<PluginHookResult | void> | PluginHookResult | void
  afterRespond?(
    context: AfterRespondContext
  ): Promise<HTTPResponse | void> | HTTPResponse | void
  onError?(
    error: unknown,
    context: RequestContext
  ): Promise<HTTPResponse | void> | HTTPResponse | void
}
```

在 `afterRespond` 或 `onError` 中需要重试时，可通过 `context.client.request(context.originalUrl, context.originalConfig)` 发起；`TokenPlugin` 的认证重试则使用 `maxRetries` 与 `_retryAttempt` 控制次数。

### 引擎抽象

```ts
abstract class HttpEngine {
  abstract request<T = any>(url: string, config: RequestConfig): Promise<HTTPResponse<T>>
  abstract abort(): void
}
```

内置实现：

- `FetchEngine`
- `XHREngine`
