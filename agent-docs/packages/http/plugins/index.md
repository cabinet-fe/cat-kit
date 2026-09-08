---
title: HTTPClientPlugin HTTP 插件总览
description: "@cat-kit/http 插件模块总览：HTTPClientPlugin 插件接口（beforeRequest / afterRespond / onError），内置 TokenPlugin 令牌注入与 401 无感刷新、MethodOverridePlugin HTTP 方法覆盖。本页列出插件模块全部公共导出与对应文档路径。"
aliases: [HTTP 插件, 请求拦截器, 拦截器, 插件模块, token plugin]
keywords: [HTTPClientPlugin, TokenPlugin, HTTPTokenPlugin, MethodOverridePlugin, HTTPMethodOverridePlugin, PluginHookResult, beforeRequest, afterRespond, onError, registerPlugin, token 刷新, 401 重试, 方法覆盖, 请求拦截, 自定义插件, 插件名称冲突]
---

# HTTPClientPlugin HTTP 插件总览

`@cat-kit/http` 的插件模块（`plugins/` + `types.ts` 中的插件接口）导出插件接口 `HTTPClientPlugin` 与两个内置插件工厂 `TokenPlugin`（令牌注入、过期刷新、401 自动重试）和 `MethodOverridePlugin`（HTTP 方法覆盖）。插件通过 `new HTTPClient(prefix, { plugins })` 注册，或运行时调用 `http.registerPlugin(plugin)` 注册；执行顺序为父链插件在前、自身在后，同层按注册顺序。客户端主体见 `packages/http/client/index.md`。

## 安装

```bash
# bun
bun add @cat-kit/http
# npm
npm install @cat-kit/http
```

```ts
import { HTTPClient, TokenPlugin } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  origin: 'https://api.example.com',
  plugins: [
    TokenPlugin({ getter: () => localStorage.getItem('access_token') })
  ]
})

// 请求自动携带 Authorization: Bearer <access_token>
const res = await http.get<{ ok: boolean }>('/ping')
console.log(res.body.ok) // => true
```

## 模块速查

API 参考路径：`packages/http/plugins/apis.md`；场景方案路径：`packages/http/plugins/examples.md`。客户端方法 `registerPlugin` 的签名与抛错见 `packages/http/client/apis.md`。

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `TokenPlugin`（别名 `HTTPTokenPlugin`） | Token 插件工厂：按 `authType` 注入 `Bearer` / `Basic` / 自定义令牌；`isExpired` 触发请求前刷新（并发共享一次）、`shouldRefresh` 触发 401 后刷新重试 | `packages/http/plugins/apis.md` |
| `MethodOverridePlugin`（别名 `HTTPMethodOverridePlugin`） | 方法覆盖插件工厂：默认把 `DELETE` / `PUT` / `PATCH` 改写为 `POST`，原方法写入 `X-HTTP-Method-Override` 请求头 | `packages/http/plugins/apis.md` |
| `HTTPClientPlugin`（别名 `ClientPlugin`） | 插件接口：`name` 必填，可选钩子 `beforeRequest` / `afterRespond` / `onError` | `packages/http/plugins/apis.md` |
| `HTTPTokenPluginOptions`（别名 `TokenPluginOptions`） | Token 插件配置类型：`getter` / `headerName` / `authType` / `formatter` / `onRefresh` / `isExpired` / `isRefreshExpired` / `shouldRefresh` / `onRefreshExpired` / `maxRetries` | `packages/http/plugins/apis.md` |
| `HTTPMethodOverridePluginOptions`（别名 `MethodOverridePluginOptions`） | 方法覆盖插件配置类型：`methods` / `overrideMethod` / `headerName` | `packages/http/plugins/apis.md` |
| `PluginHookResult` | `beforeRequest` 钩子返回类型：`{ url?, config? }`，用于改写最终 URL 与请求配置 | `packages/http/plugins/apis.md` |

场景文档：

- `packages/http/plugins/examples.md`：Token 无感刷新与 401 重试的完整接入
- `packages/http/examples.md`：客户端与插件组合搭建业务 API 客户端
