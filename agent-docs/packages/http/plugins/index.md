---
title: "HTTP 插件"
description: "Token 注入与刷新、HTTP 方法覆盖及自定义 HTTPClientPlugin 插件"
keywords:
  - TokenPlugin
  - MethodOverridePlugin
  - HTTPClientPlugin
  - registerPlugin
  - token 刷新
  - HTTP 方法覆盖
  - 并发刷新
  - X-HTTP-Method-Override
  - 请求重试
aliases:
  - 插件开发
  - token plugin
  - method override
  - 请求拦截
---

# HTTP 插件

Token 注入/刷新、HTTP 方法覆盖，或实现自定义 `HTTPClientPlugin`。

## 推荐 API

- `TokenPlugin`（别名 `HTTPTokenPlugin`）
- `MethodOverridePlugin`（别名 `HTTPMethodOverridePlugin`）
- 插件钩子类型：`HTTPClientPlugin`、`PluginHookResult`、`ClientPlugin`

详情见 [API](apis.md)、[示例](examples.md)。

## 注意事项

- `registerPlugin`：`name` 非空且在父子链唯一，否则 `HTTPError`（`PLUGIN`）
- `TokenPlugin` 固定 `name: 'token'`，整条继承链只能有一个
- `getter` 返回 `null`/`undefined`/`''` 不注入 Header；并发刷新共享同一 Promise
- `shouldRefresh` 仅在提供 `onRefresh` 时重试；默认 `maxRetries: 2`
- `MethodOverridePlugin` 默认把 `DELETE`/`PUT`/`PATCH` 改为 `POST`，原方法写入 `X-HTTP-Method-Override`
- 钩子签名为单上下文对象：`beforeRequest({ url, config })`，不是 `(url, config)`
