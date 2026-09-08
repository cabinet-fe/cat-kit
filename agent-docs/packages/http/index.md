---
title: "@cat-kit/http HTTP 请求客户端"
description: "@cat-kit/http 总览：浏览器与 Node.js 通用的 HTTP 请求客户端，统一响应与错误结构，支持请求前缀与业务分组、可替换 fetch/XHR 引擎、插件式 Token 注入与 401 无感刷新。本页列出全部公共导出与对应文档路径。"
aliases: [cat-kit http, HTTP 请求库, http client, axios 替代, fetch 封装, 请求封装]
keywords: [HTTPClient, HTTPError, FetchEngine, XHREngine, HttpEngine, TokenPlugin, MethodOverridePlugin, HTTPClientPlugin, mergeRequestConfig, HTTPResponse, ClientConfig, RequestConfig, 请求分组, 请求取消, 请求超时, token 刷新, 401 重试, 方法覆盖, 统一错误处理, 自定义引擎]
---

# @cat-kit/http HTTP 请求客户端

`@cat-kit/http`（当前版本 1.2.1）导出跨端 HTTP 请求客户端 `HTTPClient`、统一错误类 `HTTPError`、传输引擎 `FetchEngine` / `XHREngine` 与插件工厂 `TokenPlugin` / `HTTPMethodOverridePlugin`。所有响应解析为 `HTTPResponse`（`body` / `code` / `headers` / `raw`），非 2xx 状态码抛出 `HTTPError`。仅从包根导出，统一按 `import { HTTPClient } from '@cat-kit/http'` 导入。

## 安装

```bash
# bun
bun add @cat-kit/http
# npm
npm install @cat-kit/http
```

运行环境须提供全局 `fetch` 或 `XMLHttpRequest`：有全局 `fetch` 时默认使用 `FetchEngine`，否则使用 `XHREngine`；两者都不可用时通过 `ClientConfig.engine` 注入自定义引擎。

```ts
import { HTTPClient } from '@cat-kit/http'

const http = new HTTPClient('/api', { timeout: 10_000 })
const res = await http.get<{ ok: boolean }>('/ping')
console.log(res.body) // => { ok: true }
```

## 模块速查

### 客户端与引擎

文档路径：`packages/http/client/apis.md`（API 参考）、`packages/http/client/examples.md`（场景方案）。

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `HTTPClient` | HTTP 请求客户端类：前缀与 `origin` 复用、`get` / `post` / `put` / `delete` / `patch` / `head` / `options` 别名方法、`group` 业务分组、`registerPlugin` 插件注册 | `packages/http/client/apis.md` |
| `mergeRequestConfig` | 合并两份 `RequestConfig`：`headers` / `query` 对象级合并，标量字段仅显式传入时覆盖 | `packages/http/client/apis.md` |
| `HTTPError` | 统一错误类，携带 `code` / `url` / `config` / `response` / `cause` | `packages/http/client/apis.md` |
| `HttpEngine` | 引擎抽象基类（`request` / `abort`），对接其他底层时继承它 | `packages/http/client/apis.md` |
| `FetchEngine` | 基于 `fetch` 的内置引擎，支持流式下载进度 | `packages/http/client/apis.md` |
| `XHREngine` | 基于 `XMLHttpRequest` 的内置引擎，支持上传与下载进度 | `packages/http/client/apis.md` |
| `IHTTPClient` | 客户端接口类型，`HTTPClient` 实现该接口 | `packages/http/client/apis.md` |
| `ClientConfig` | `new HTTPClient(prefix, config)` 的客户端配置类型 | `packages/http/client/apis.md` |
| `RequestConfig` | 单次请求配置类型 | `packages/http/client/apis.md` |
| `AliasRequestConfig` | 省略 `method` 的 `RequestConfig`，`get` / `delete` / `head` / `options` 的入参 | `packages/http/client/apis.md` |
| `HTTPResponse` | 响应结构：`body` / `code` / `headers` / `raw` | `packages/http/client/apis.md` |
| `HttpErrorCode` | `HTTPError.code` 的联合类型：`'TIMEOUT'` / `'ABORTED'` / `'NETWORK'` / `'PARSE'` / `'AUTH'` / `'UNKNOWN'` / `'RETRY_LIMIT_EXCEEDED'` / `'PLUGIN'` | `packages/http/client/apis.md` |
| `HTTPErrorOptions` | `HTTPError` 构造参数类型 | `packages/http/client/apis.md` |
| `RequestMethod` | 请求方法联合类型：`'GET'` 到 `'OPTIONS'` 的大写枚举 | `packages/http/client/apis.md` |
| `ProgressInfo` | 传输进度信息：`loaded` / `total` / `percent` | `packages/http/client/apis.md` |
| `RequestContext` | 请求上下文类型（`url` + `config`），`onError` 钩子的入参 | `packages/http/client/apis.md` |

### 插件

文档路径：`packages/http/plugins/apis.md`（API 参考）、`packages/http/plugins/examples.md`（场景方案）。

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `TokenPlugin`（别名 `HTTPTokenPlugin`） | Token 注入插件：`Bearer` / `Basic` / `Custom` 令牌、过期刷新单飞、401 自动重试 | `packages/http/plugins/apis.md` |
| `MethodOverridePlugin`（别名 `HTTPMethodOverridePlugin`） | HTTP 方法覆盖插件：`DELETE` / `PUT` / `PATCH` 改写为 `POST` 并写入 `X-HTTP-Method-Override` | `packages/http/plugins/apis.md` |
| `HTTPClientPlugin`（别名 `ClientPlugin`） | 插件接口：`beforeRequest` / `afterRespond` / `onError` 三个钩子 | `packages/http/plugins/apis.md` |
| `HTTPTokenPluginOptions`（别名 `TokenPluginOptions`） | Token 插件配置类型 | `packages/http/plugins/apis.md` |
| `HTTPMethodOverridePluginOptions`（别名 `MethodOverridePluginOptions`） | 方法覆盖插件配置类型 | `packages/http/plugins/apis.md` |
| `PluginHookResult` | `beforeRequest` 钩子的返回类型：`url` / `config` | `packages/http/plugins/apis.md` |

### 场景文档

- `packages/http/examples.md`：客户端与插件组合搭建业务 API 客户端
- `packages/http/client/examples.md`：文件下载进度监控与请求中止
- `packages/http/plugins/examples.md`：Token 无感刷新与 401 重试
