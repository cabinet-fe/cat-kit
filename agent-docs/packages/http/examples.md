---
title: "@cat-kit/http 业务 API 客户端组合"
description: "用 HTTPClient 与 TokenPlugin、MethodOverridePlugin 组合搭建业务 API 客户端：统一 origin 与超时、令牌自动注入、DELETE 方法覆盖、group 按业务域分组、HTTPError 统一错误分流。"
aliases: [组合用法, 实战示例, 业务客户端搭建, axios 封装, 最佳实践]
keywords: [HTTPClient, TokenPlugin, MethodOverridePlugin, HTTPError, group, post, timeout, getter, X-HTTP-Method-Override, HTTPResponse, 类型化请求, 业务分组, 统一错误处理, 令牌注入, 方法覆盖]
---

# @cat-kit/http 业务 API 客户端组合

从零搭建一个业务 API 客户端：`HTTPClient` 承载 `origin`、超时与路径前缀，`TokenPlugin` 自动注入令牌，`HTTPMethodOverridePlugin` 绕过网关对 `DELETE` 的限制，`group` 按业务域（如 `/admin`）派生子客户端，业务层统一用 `HTTPError` 分流错误。

## 场景

- 何时用本方案：多个模块请求同一后端、需要复用域名与前缀配置，且需要令牌注入或方法覆盖中的至少一种。
- 何时不用：`access_token` 过期需要自动续期的应用。本方案只做注入不做刷新，无感刷新改用 `packages/http/plugins/examples.md` 的方案。

## 完整示例

```ts
// src/api/http.ts
import {
  HTTPClient,
  HTTPError,
  HTTPMethodOverridePlugin,
  TokenPlugin
} from '@cat-kit/http'

export const api = new HTTPClient('/v1', {
  origin: 'https://api.example.com',
  timeout: 15_000,
  plugins: [
    // 每次请求前从 sessionStorage 取 token，注入 Authorization: Bearer <token>
    TokenPlugin({ getter: () => sessionStorage.getItem('access_token') }),
    // DELETE 改写为 POST，原方法写入 X-HTTP-Method-Override，绕过网关限制
    HTTPMethodOverridePlugin({ methods: ['DELETE'] })
  ]
})

// /admin 业务域子客户端：前缀变成 /v1/admin，继承 origin/timeout/插件
export const admin = api.group('/admin')
```

```ts
// src/api/jobs.ts
import { HTTPClient, HTTPError } from '@cat-kit/http'
import { admin } from './http'

export interface Job {
  id: string
  name: string
  ok: boolean
}

export async function createJob(name: string): Promise<Job> {
  try {
    // 实际请求: POST https://api.example.com/v1/admin/jobs，body 自动 JSON 序列化
    const res = await admin.post<Job>('/jobs', { name })
    console.log(res.code, res.body.name) // => 201 'export'
    return res.body
  } catch (error) {
    if (error instanceof HTTPError) {
      // 统一错误分流：非 2xx / 超时 / 中止都在这里
      if (error.code === 'NETWORK') {
        throw new Error(`请求失败，状态码: ${error.response?.code}`)
      }
      if (error.code === 'TIMEOUT') {
        throw new Error('请求超时（15 秒）')
      }
    }
    throw error
  }
}

export async function removeJob(id: string): Promise<void> {
  // 实际发出: POST /v1/admin/jobs/<id> + X-HTTP-Method-Override: DELETE
  const res = await admin.delete(`/jobs/${id}`)
  console.log(res.code) // => 204
}

const job = await createJob('export')
await removeJob(job.id)
```

## 要点说明

- `TokenPlugin({ getter })` 在每次请求的 `beforeRequest` 中调用 `getter`；返回 `null` / `undefined` / `''` 时不注入请求头，请求照常发出（匿名请求场景无需分支处理）。
- `HTTPMethodOverridePlugin({ methods: ['DELETE'] })` 只覆盖 `DELETE`：`http.delete(url)` 实际发出 `POST`，服务端按 `X-HTTP-Method-Override: DELETE` 还原语义；默认配置覆盖 `DELETE` / `PUT` / `PATCH`。
- `api.group('/admin')` 返回新客户端，前缀为 `/v1/admin`；共享父客户端的引擎，父客户端之后 `registerPlugin` 的插件对子客户端同样生效，子客户端注册的插件不影响父客户端。
- 插件在 XSRF 头注入之前执行，执行顺序为注册顺序：`TokenPlugin` 写入的 `Authorization` 头不会被同域 XSRF 逻辑覆盖。
- `admin.post<Job>('/jobs', body)` 的 `body` 为对象时自动 `JSON.stringify` 并设 `Content-Type: application/json`；返回值 `res` 是 `HTTPResponse`，业务数据在 `res.body`。
- `HTTPError` 的 `code` 区分错误来源：`'NETWORK'`（非 2xx 与网络错误）、`'TIMEOUT'`、`'ABORTED'`；非 2xx 时 `error.response.body` 已解析，可直接读取服务端错误信息。

## 注意事项

> [!WARNING]
> - 本库返回 `HTTPResponse`，数据在 `res.body`，不是 axios 的 `AxiosResponse`；禁止写 `res.data`。
> - 本方案不处理 token 过期：`getter` 返回过期 token 时请求会带旧 token 发出并得到 401；需要自动续期改用 `packages/http/plugins/examples.md` 的无感刷新方案。
> - 整条插件链上 `TokenPlugin` 只能注册一个（`name` 固定 `'token'`），第二个抛 `插件名称冲突: token`；`MethodOverridePlugin`（`'method-override'`）同理。
> - `group()` 父子共享同一引擎：任一方调用 `abort()` 会中止该引擎上的全部在途请求。
> - `timeout` 配置在客户端上对所有请求生效（示例 15 秒），单请求可用 `config.timeout` 覆盖；默认 `0` 为不超时。
