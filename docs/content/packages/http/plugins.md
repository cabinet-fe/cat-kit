# 插件系统

## 介绍

`@cat-kit/http` 的插件系统围绕 `beforeRequest`、`afterRespond`、`onError` 三个阶段工作。它既能做请求头注入、方法改写，也能做自动刷新 token、失败重试和错误恢复。

当前内置了三个插件：

- `TokenPlugin`
- `RetryPlugin`
- `MethodOverridePlugin`

## 快速使用

```ts
import {
  HTTPClient,
  TokenPlugin,
  RetryPlugin,
  MethodOverridePlugin
} from '@cat-kit/http'

const http = new HTTPClient('/api', {
  plugins: [
    TokenPlugin({
      getter: () => localStorage.getItem('token')
    }),
    RetryPlugin({ maxRetries: 2 }),
    MethodOverridePlugin({ methods: ['DELETE'] })
  ]
})
```

## API参考

### 插件接口

```ts
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
```

执行顺序：

1. 按注册顺序执行 `beforeRequest`
2. 调用底层引擎发送请求
3. 按注册顺序执行 `afterRespond`
4. 如果流程抛错，再按注册顺序执行 `onError`

### TokenPlugin

```ts
TokenPlugin(options: TokenPluginOptions): HTTPClientPlugin
```

```ts
interface TokenPluginOptions {
  getter: () => string | null | undefined | Promise<string | null | undefined>
  headerName?: string
  authType?: 'Bearer' | 'Basic' | 'Custom'
  formatter?: (token: string) => string
  onRefresh?: () => Promise<void>
  isExpired?: () => boolean
  isRefreshExpired?: () => boolean
  shouldRefresh?: (response: HTTPResponse) => boolean
  onRefreshExpired?: () => void
}
```

常见用法：

```ts
TokenPlugin({
  getter: () => localStorage.getItem('access_token'),
  authType: 'Bearer'
})
```

带刷新逻辑：

```ts
TokenPlugin({
  getter: () => tokenStore.accessToken,
  isExpired: () => tokenStore.isExpired,
  onRefresh: async () => {
    await tokenStore.refresh()
  },
  shouldRefresh: (response) => response.code === 401
})
```

注意点：

- `getter` 返回 `null` / `undefined` 时不会注入 token
- 并发刷新会被串成同一个 `refreshPromise`
- `shouldRefresh` 命中后，插件会借助 `context.retry()` 重试原请求

### RetryPlugin

```ts
RetryPlugin(options?: RetryPluginOptions): HTTPClientPlugin
```

```ts
interface RetryPluginOptions {
  maxRetries?: number
  delay?: number | ((attempt: number) => number)
  retryOn?: (error: unknown, context: RequestContext) => boolean
  retryOnStatus?: number[]
}
```

默认行为：

- 默认最多重试 `3` 次
- 默认对 `408/429/500/502/503/504` 以及 `NETWORK` / `TIMEOUT` 错误重试
- 默认退避为指数回退，最大 30 秒

示例：

```ts
RetryPlugin({
  maxRetries: 5,
  delay: (attempt) => 300 * 2 ** attempt
})
```

### MethodOverridePlugin

```ts
MethodOverridePlugin(options?: MethodOverridePluginOptions): HTTPClientPlugin
```

```ts
interface MethodOverridePluginOptions {
  methods?: RequestMethod[]
  overrideMethod?: RequestMethod
  headerName?: string
}
```

默认会把 `DELETE` / `PUT` / `PATCH` 改写成 `POST`，并加上 `X-HTTP-Method-Override`。

```ts
MethodOverridePlugin({
  methods: ['DELETE', 'PATCH'],
  overrideMethod: 'POST'
})
```

### 自定义插件

```ts
const tracePlugin = {
  name: 'trace',
  beforeRequest(url, config) {
    return {
      url,
      config: {
        ...config,
        headers: {
          ...config.headers,
          'X-Trace-Id': crypto.randomUUID()
        }
      }
    }
  }
}
```

如果你在 `afterRespond` 或 `onError` 中要“恢复”请求，返回 `HTTPResponse` 即可；`RetryPlugin` 本质上就是通过这个机制工作。
