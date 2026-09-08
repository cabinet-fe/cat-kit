---
title: HTTPClient 请求客户端总览
description: "HTTPClient 模块总览：创建可复用的跨端 HTTP 客户端，处理请求前缀、origin、超时、响应类型、进度回调、XSRF、业务分组与统一错误。本页列出客户端模块全部公共导出与对应文档路径。"
aliases: [HTTP 客户端, httpClient, http client, 请求客户端, 客户端模块]
keywords: [HTTPClient, HTTPError, FetchEngine, XHREngine, HttpEngine, mergeRequestConfig, HTTPResponse, ClientConfig, RequestConfig, AliasRequestConfig, group, registerPlugin, abort, 请求前缀, 请求分组, 统一错误处理, 下载进度, 自定义引擎]
---

# HTTPClient 请求客户端总览

`@cat-kit/http` 的客户端模块（`client.ts` + `engine/` + `types.ts`）导出请求客户端类 `HTTPClient`、统一错误类 `HTTPError`、两个内置引擎 `FetchEngine` / `XHREngine`、引擎抽象基类 `HttpEngine` 与配置合并函数 `mergeRequestConfig`。所有响应解析为 `HTTPResponse`（数据在 `res.body`），非 2xx 状态码抛出 `HTTPError`。插件见 `packages/http/plugins/index.md`。

## 安装

```bash
# bun
bun add @cat-kit/http
# npm
npm install @cat-kit/http
```

```ts
import { HTTPClient, HTTPError } from '@cat-kit/http'

const http = new HTTPClient('/api/v1', {
  origin: 'https://api.example.com',
  timeout: 10_000
})

try {
  const res = await http.get<{ ok: boolean }>('/ping')
  console.log(res.body.ok) // => true
} catch (error) {
  if (error instanceof HTTPError) {
    console.error(error.code, error.message)
  }
  throw error
}
```

## 模块速查

API 参考路径：`packages/http/client/apis.md`；场景方案路径：`packages/http/client/examples.md`。

| 导出名 | 说明 | 文档路径 |
| --- | --- | --- |
| `HTTPClient` | HTTP 请求客户端类：`request` 与 `get` / `post` / `put` / `delete` / `patch` / `head` / `options` 别名方法、`group` 业务分组、`registerPlugin` 插件注册、`abort` 中止 | `packages/http/client/apis.md` |
| `mergeRequestConfig` | 合并两份 `RequestConfig`：`headers` / `query` 对象级合并，标量字段仅 patch 显式传入且非 `undefined` 时覆盖 | `packages/http/client/apis.md` |
| `HTTPError` | 统一错误类（`name` 为 `'HTTPError'`），字段 `code` / `url` / `config` / `response` / `cause` | `packages/http/client/apis.md` |
| `HttpEngine` | 引擎抽象基类：子类实现 `request` / `abort`，经 `ClientConfig.engine` 注入 | `packages/http/client/apis.md` |
| `FetchEngine` | 基于 `fetch` 的内置引擎：流式下载进度、超时与外部 `signal` 合并 | `packages/http/client/apis.md` |
| `XHREngine` | 基于 `XMLHttpRequest` 的内置引擎：上传与下载进度、`xhr.timeout` 超时 | `packages/http/client/apis.md` |
| `IHTTPClient` | 客户端接口类型，`HTTPClient` 实现该接口 | `packages/http/client/apis.md` |
| `ClientConfig` | 客户端构造配置类型：`origin` / `timeout` / `headers` / `credentials` / `plugins` / `engine` / `responseType` / `signal` / 进度回调 / XSRF 名称 | `packages/http/client/apis.md` |
| `RequestConfig` | 单次请求配置类型：`method` / `body` / `query` / `headers` / `timeout` / `credentials` / `responseType` / `signal` / 进度回调 / XSRF 名称 | `packages/http/client/apis.md` |
| `AliasRequestConfig` | 省略 `method` 的 `RequestConfig`（`Omit<RequestConfig, 'method'>`） | `packages/http/client/apis.md` |
| `HTTPResponse` | 响应结构：`body`（解析后响应体）、`code`（状态码）、`headers`（小写键）、`raw`（原始对象） | `packages/http/client/apis.md` |
| `HttpErrorCode` | 错误码联合类型：`'TIMEOUT'` / `'ABORTED'` / `'NETWORK'` / `'PARSE'` / `'AUTH'` / `'UNKNOWN'` / `'RETRY_LIMIT_EXCEEDED'` / `'PLUGIN'` | `packages/http/client/apis.md` |
| `HTTPErrorOptions` | `HTTPError` 构造参数类型 | `packages/http/client/apis.md` |
| `RequestMethod` | `'GET' \| 'POST' \| 'PUT' \| 'DELETE' \| 'PATCH' \| 'HEAD' \| 'OPTIONS'` | `packages/http/client/apis.md` |
| `ProgressInfo` | 传输进度信息：`loaded` / `total` / `percent`（0-100） | `packages/http/client/apis.md` |
| `RequestContext` | 请求上下文 `{ url, config }`，插件 `onError` 钩子的入参 | `packages/http/client/apis.md` |
| `HTTPClientPlugin`（别名 `ClientPlugin`） | 插件接口类型：`name` 与 `beforeRequest` / `afterRespond` / `onError` 钩子，签名详见 `packages/http/plugins/apis.md` | `packages/http/plugins/apis.md` |
| `PluginHookResult` | `beforeRequest` 钩子返回类型 `{ url?, config? }`，签名详见 `packages/http/plugins/apis.md` | `packages/http/plugins/apis.md` |

场景文档：

- `packages/http/client/examples.md`：文件下载进度监控与请求中止
- `packages/http/plugins/examples.md`：Token 无感刷新与 401 重试（客户端 + 插件组合）
