---
title: 类型定义
description: '@cat-kit/http 的核心类型、错误类型与插件上下文'
outline: deep
---

# 类型定义

## 介绍

这页汇总 `@cat-kit/http` 暴露给业务代码最常用的类型：请求配置、响应结构、进度回调、插件上下文和错误类型。

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
  signal?: AbortSignal
  onUploadProgress?: (info: ProgressInfo) => void
  onDownloadProgress?: (info: ProgressInfo) => void
}

type AliasRequestConfig = Omit<RequestConfig, 'method'>
```

### 响应与进度

```ts
interface HTTPResponse<T = any> {
  data: T
  code: number
  headers: Record<string, string>
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
  | 'UNKNOWN'
  | 'RETRY_LIMIT_EXCEEDED'
  | 'PLUGIN'

class HTTPError<T = any> extends Error {
  code: HttpErrorCode
  url?: string
  config?: RequestConfig
  response?: HTTPResponse<T>
  cause?: unknown
}
```

推荐按 `instanceof HTTPError` + `error.code` 分支处理，而不是直接依赖错误消息文本。

### 插件相关类型

```ts
interface PluginHookResult {
  url?: string
  config?: RequestConfig
}

interface PluginContext {
  retry: (config?: Partial<RequestConfig>) => Promise<HTTPResponse>
}

interface RequestContext {
  url: string
  config: RequestConfig
  retry?: (patch?: Partial<RequestConfig>) => Promise<HTTPResponse>
}

interface HTTPClientPlugin {
  name: string
  beforeRequest?(
    url: string,
    config: RequestConfig
  ): Promise<PluginHookResult | void> | PluginHookResult | void
  afterRespond?(
    response: HTTPResponse,
    url: string,
    config: RequestConfig,
    context?: PluginContext
  ): Promise<HTTPResponse | void> | HTTPResponse | void
  onError?(
    error: unknown,
    context: RequestContext
  ): Promise<HTTPResponse | void> | HTTPResponse | void
}
```

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
