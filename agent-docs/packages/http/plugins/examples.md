---
title: "@cat-kit/http Token 无感刷新与 401 重试"
description: "用 TokenPlugin 实现登录态无感刷新：请求前按过期时间主动刷新（并发共享一次刷新），响应 401 后自动刷新重试，refresh_token 失效时统一登出。"
aliases: [无感刷新, token 刷新, 401 重试, 自动登录态续期, 刷新令牌]
keywords: [TokenPlugin, getter, onRefresh, isExpired, isRefreshExpired, shouldRefresh, onRefreshExpired, maxRetries, HTTPError, AUTH, Authorization, Bearer, 401 重试, token 刷新, 无感刷新, 刷新令牌, 并发刷新, 登录态]
---

# @cat-kit/http Token 无感刷新与 401 重试

SPA 中 `access_token` 短期有效、`refresh_token` 长期有效时的自动续期方案：`TokenPlugin` 在请求前检测过期主动刷新（并发请求共享同一次刷新），响应 401 后再兜底刷新并重试，`refresh_token` 失效时调用登出回调并抛出 `code: 'AUTH'` 的 `HTTPError`。

## 场景

- 何时用本方案：token 存内存或本地存储、需要自动续期且用户无感知的浏览器应用；多个并发请求会遇到 token 同时过期的场景。
- 何时不用：token 由服务端会话（Cookie）管理的应用，无需前端持有 token，跳过本方案直接使用默认 `credentials` 行为（见 `packages/http/client/apis.md`）。

## 完整示例

```ts
// src/api/http.ts
import { HTTPClient, TokenPlugin } from '@cat-kit/http'

// token 的唯一来源：onRefresh 更新这里，getter 从这里读，二者必须指向同一变量
let accessToken: string | null = localStorage.getItem('access_token')
let refreshExpireAt: number = Number(localStorage.getItem('refresh_expire_at') ?? '0')

async function refreshAccessToken(): Promise<void> {
  const res = await fetch('https://api.example.com/auth/refresh', {
    method: 'POST',
    credentials: 'include' // refresh_token 放在 httpOnly Cookie 中
  })
  if (!res.ok) {
    throw new Error(`刷新失败，状态码: ${res.status}`)
  }
  const data = (await res.json()) as { accessToken: string; refreshExpireAt: number }
  accessToken = data.accessToken
  refreshExpireAt = data.refreshExpireAt
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_expire_at', String(refreshExpireAt))
}

export const api = new HTTPClient('/v1', {
  origin: 'https://api.example.com',
  plugins: [
    TokenPlugin({
      getter: () => accessToken,
      isExpired: () => !accessToken, // 请求前：本地无 token 时先刷新
      isRefreshExpired: () => Date.now() >= refreshExpireAt, // refresh_token 已过期
      onRefresh: refreshAccessToken,
      onRefreshExpired: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_expire_at')
        location.href = '/login'
      },
      shouldRefresh: (res) => res.code === 401, // 响应后：401 兜底刷新重试
      maxRetries: 1 // 首次 + 最多 1 次重试
    })
  ]
})
```

```ts
// src/api/user.ts
import { HTTPError } from '@cat-kit/http'
import { api } from './http'

export interface Profile {
  id: number
  name: string
}

export async function loadProfile(): Promise<Profile> {
  try {
    const res = await api.get<Profile>('/user/profile')
    return res.body
  } catch (error) {
    // refresh_token 失效且无法恢复时收到 code 'AUTH'
    if (error instanceof HTTPError && error.code === 'AUTH') {
      throw new Error(`登录已失效：${error.message}`) // => '登录已失效：刷新令牌已过期'
    }
    throw error
  }
}

const profile = await loadProfile()
console.log(profile.name) // => 'Alice'
```

## 要点说明

- `getter` 与 `onRefresh` 必须读写同一变量（示例中的 `accessToken`）：重试前插件会重新调用 `getter`，若 `onRefresh` 更新的不是 `getter` 读取的来源，重试仍带旧 token，401 会循环到 `maxRetries` 耗尽。
- `isExpired` 与 `shouldRefresh` 分工：前者在请求前依据本地状态主动刷新（避免发出必 401 的请求），后者在响应后依据状态码兜底刷新重试；两者都依赖 `onRefresh`，未配置 `onRefresh` 时均不生效。
- 并发只刷新一次：多个请求同时发现过期时，`TokenPlugin` 内部共享同一个刷新 Promise，后续请求等待刷新完成再携带新 token 发出；`onRefresh` 不会被并发触发多次。
- `isRefreshExpired` 返回 `true` 时请求不发送：插件调用 `onRefreshExpired()` 后抛 `HTTPError('刷新令牌已过期', code 'AUTH')`，业务层用 `error.code === 'AUTH'` 识别。
- `maxRetries` 是重发次数（不含首次）：示例 `maxRetries: 1` 表示单请求最多发出 2 次；默认 `2` 时最多 3 次。
- 重试经 `client.request(originalUrl, originalConfig)` 发起，`prefix` 不会重复拼接；重试走完整插件管道，`beforeRequest` 会重新执行。

## 注意事项

> [!WARNING]
> - 整个插件链只能有一个 `TokenPlugin`：其 `name` 固定为 `'token'`，注册第二个抛 `插件名称冲突: token`。
> - `shouldRefresh` 收到的是响应对象（`res.code`），不是错误对象；判断 401 写 `res.code === 401`，不要写 `error.response`。
> - `onRefresh` 抛错（如刷新接口 500）时该错误直接抛给业务调用方，插件不吞错；刷新接口自身不要复用带 `TokenPlugin` 的客户端，避免递归刷新，示例中用原生 `fetch`。
> - `location.href` 跳转登录不会立刻中断已入队的并发请求；需要终止时配合客户端 `abort()`（见 `packages/http/client/apis.md`）。
> - `authType: 'Bearer'` 为默认值，产出 `Bearer <token>`；`Basic` 只拼前缀不做 Base64 编码。
