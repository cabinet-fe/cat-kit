---
title: "HTTP 插件 API"
description: "HTTPClientPlugin 钩子接口与 TokenPlugin、MethodOverridePlugin 工厂签名"
---

# HTTP 插件 — API

插件钩子接口与内置插件工厂的签名，完整定义见 [token.d.ts](../../../../packages/http/dist/plugins/token.d.ts)、[method-override.d.ts](../../../../packages/http/dist/plugins/method-override.d.ts)。

```ts
interface HTTPClientPlugin {
  name: string
  beforeRequest?(ctx: {
    url: string
    config: RequestConfig
  }): PluginHookResult | void | Promise<PluginHookResult | void>
  afterRespond?(ctx: {
    response: HTTPResponse
    url: string
    config: RequestConfig
    originalUrl: string
    originalConfig: RequestConfig
    client: IHTTPClient
  }): HTTPResponse | void | Promise<HTTPResponse | void>
  onError?(
    error: HTTPError,
    ctx: { url: string; config: RequestConfig }
  ): HTTPResponse | void | Promise<HTTPResponse | void>
}

declare function TokenPlugin(options: TokenPluginOptions): HTTPClientPlugin
declare function MethodOverridePlugin(
  options?: MethodOverridePluginOptions
): HTTPClientPlugin
```

`TokenPluginOptions` 含 `getter`、`header?`、`shouldRefresh?`、`onRefresh?`、`maxRetries?` 等字段。  
`MethodOverridePluginOptions`：`methods?`、`header?`。
