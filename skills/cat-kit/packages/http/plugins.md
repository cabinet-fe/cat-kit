# http — 请求插件

## 适用场景

插件用于跨请求复用 Token 认证、受限环境的方法覆盖，或少量确实需要统一改写请求/响应的横切逻辑。

## 如何选择

| 需求                                       | 选择                                   |
| ------------------------------------------ | -------------------------------------- |
| 注入 Bearer/Basic/自定义 Token             | `TokenPlugin`                          |
| Token 过期时刷新并重试原请求               | `TokenPlugin` + `onRefresh` + 过期判断 |
| 将 DELETE/PUT/PATCH 改为 POST 等受支持方法 | `MethodOverridePlugin`                 |
| 修改 URL/配置、转换响应或恢复错误          | 实现 `HTTPClientPlugin`                |
| 只处理某个 endpoint 的业务逻辑             | 直接写在调用处，不要创建插件           |

插件可在 `new HTTPClient(..., { plugins })` 时提供，也可用 `client.registerPlugin(plugin)` 动态注册。

## 公共 API

### TokenPlugin

```ts
TokenPlugin(options: TokenPluginOptions): HTTPClientPlugin
```

| 字段               | 含义                                                               |
| ------------------ | ------------------------------------------------------------------ |
| `getter`           | 必填；同步或异步返回 Token，返回 `null` / `undefined` 时不写请求头 |
| `headerName`       | 请求头名，默认 `Authorization`                                     |
| `authType`         | `'Bearer' \| 'Basic' \| 'Custom'`，默认 `Bearer`                   |
| `formatter`        | `authType: 'Custom'` 时格式化 Token；省略则使用原值                |
| `isExpired`        | 返回 `true` 时在请求前刷新                                         |
| `onRefresh`        | 刷新 Token；完成后插件再次调用 `getter`                            |
| `shouldRefresh`    | 根据响应决定是否刷新并重试，例如 `response.code === 401`           |
| `maxRetries`       | 响应触发刷新的最大重试次数，默认 `2`；`0` 禁用这类重试             |
| `isRefreshExpired` | 返回 `true` 时终止请求并抛出 `AUTH` 错误                           |
| `onRefreshExpired` | refresh token 失效时执行，例如清理会话                             |

`HTTPTokenPlugin` 与 `HTTPTokenPluginOptions` 也从根入口导出；短名称 `TokenPlugin` / `TokenPluginOptions` 指向同一公开能力。

### MethodOverridePlugin

```ts
MethodOverridePlugin(options?: {
  methods?: RequestMethod[]
  overrideMethod?: RequestMethod
  headerName?: string
}): HTTPClientPlugin
```

默认把 `DELETE`、`PUT`、`PATCH` 改为 `POST`，并在 `X-HTTP-Method-Override` 中发送原方法。三个默认值都可覆盖。

`HTTPMethodOverridePlugin` 与对应 Options 类型也是同一能力的公开名称。

### 自定义插件

```ts
interface HTTPClientPlugin {
  name: string
  beforeRequest?(context: {
    url: string
    config: RequestConfig
  }): PluginHookResult | void | Promise<PluginHookResult | void>
  afterRespond?(context: {
    response: HTTPResponse
    url: string
    config: RequestConfig
    originalUrl: string
    originalConfig: RequestConfig
    client: IHTTPClient
  }): HTTPResponse | void | Promise<HTTPResponse | void>
  onError?(
    error: unknown,
    context: RequestContext
  ): HTTPResponse | void | Promise<HTTPResponse | void>
}
```

- `beforeRequest` 返回 `{ url?, config? }` 才会改写请求。
- `afterRespond` 返回 `HTTPResponse` 才会替换响应；非 2xx 响应也可被该钩子检查。
- `onError` 返回结构有效的 `HTTPResponse` 时可恢复错误。

## 最小示例

```ts
import { HTTPClient, TokenPlugin } from '@cat-kit/http'

let accessToken = ''

const http = new HTTPClient('/api', {
  origin: 'https://example.com',
  plugins: [
    TokenPlugin({
      getter: () => accessToken,
      onRefresh: async () => {
        const response = await fetch('https://example.com/auth/refresh', { method: 'POST' })
        const body = (await response.json()) as { accessToken: string }
        accessToken = body.accessToken
      },
      isExpired: () => accessToken === '',
      shouldRefresh: (response) => response.code === 401
    })
  ]
})

await http.get('/profile')
```

## 必要边界

- 自定义插件必须提供稳定、非空且在当前父子客户端链中唯一的 `name`；动态注册无效名称或重复名称会抛出 `HTTPError`，`code` 为 `PLUGIN`。
- 同一个 `TokenPlugin` 实例会合并并发刷新；刷新期间到达的请求会等待同一个 `onRefresh` Promise。
- `shouldRefresh` 只有同时提供 `onRefresh` 才会重试。达到 `maxRetries` 后停止重试，原非 2xx 响应继续按请求错误处理。
- `isRefreshExpired` 为真时会先调用 `onRefreshExpired`，再以 `AUTH` 错误终止请求。
- `beforeRequest` 返回的 `headers` 和 `query` 与已有配置浅合并；其他字段只用明确的非 `undefined` 值覆盖。不要依赖 `_retryAttempt`，它是内部字段。
- 多个插件会按注册顺序连续影响同一次请求；组合插件时避免让它们争用同一 Header 或重复恢复同一错误。
- 只有根入口 `@cat-kit/http` 是公开导入路径。

## 类型入口

- [插件、上下文与响应类型](../../generated/http/types.d.ts)
- [Token 插件](../../generated/http/plugins/token.d.ts)
- [方法覆盖插件](../../generated/http/plugins/method-override.d.ts)
