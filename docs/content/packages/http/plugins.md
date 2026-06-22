# 插件系统

## 介绍

`@cat-kit/http` 的插件系统围绕 `beforeRequest`、`afterRespond`、`onError` 三个阶段工作。它既能做请求头注入、方法改写，也能做自动刷新 token 和错误恢复。

当前内置了两个插件：

- `TokenPlugin`
- `MethodOverridePlugin`

## 快速使用

```ts
import { HTTPClient, TokenPlugin, MethodOverridePlugin } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  plugins: [
    TokenPlugin({ getter: () => localStorage.getItem('token') }),
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

```ts
interface PluginHookResult {
  url?: string
  config?: RequestConfig
}

interface AfterRespondContext {
  response: HTTPResponse
  /** 经插件处理后的最终 URL（含 prefix / origin / query） */
  url: string
  /** 经插件处理后的最终配置 */
  config: RequestConfig
  /** 调用 client.request / get 等方法时传入的原始 URL */
  originalUrl: string
  /** 合并客户端默认值后、beforeRequest 前的原始配置 */
  originalConfig: RequestConfig
  client: IHTTPClient
}

interface RequestContext {
  url: string
  config: RequestConfig
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
  maxRetries?: number
}
```

常见用法：

```ts
TokenPlugin({ getter: () => localStorage.getItem('access_token'), authType: 'Bearer' })
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
- `shouldRefresh` 命中后，插件会调用 `client.request(originalUrl, { ...originalConfig, _retryAttempt })` 重试原请求，重试会重新走完整插件链
- `maxRetries` 默认 `2`（最多重试 2 次，共 3 次请求）；`0` 表示不重试

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
MethodOverridePlugin({ methods: ['DELETE', 'PATCH'], overrideMethod: 'POST' })
```

### 自定义插件

```ts
const tracePlugin = {
  name: 'trace',
  beforeRequest({ url, config }) {
    return {
      url,
      config: { ...config, headers: { ...config.headers, 'X-Trace-Id': crypto.randomUUID() } }
    }
  }
}
```

如果你在 `afterRespond` 或 `onError` 中要“恢复”请求，返回 `HTTPResponse` 即可；需要重试时可通过 `context.client.request(context.originalUrl, context.originalConfig)` 发起。
