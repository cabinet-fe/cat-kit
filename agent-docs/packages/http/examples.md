---
title: "@cat-kit/http 组合示例"
description: "HTTPClient 与 TokenPlugin 组合创建业务 API 客户端并发送类型化请求"
---

# @cat-kit/http 组合示例

客户端与插件组合使用：创建带 Token 注入的 API 客户端，按业务域分组并发送类型化 POST 请求。

```ts
import { HTTPClient, HTTPError, TokenPlugin } from '@cat-kit/http'

const api = new HTTPClient('/v1', {
  origin: 'https://api.example.com',
  timeout: 15_000,
  plugins: [
    TokenPlugin({
      getter: async () => sessionStorage.getItem('access_token')
    })
  ]
})

const admin = api.group('/admin')

try {
  const { body } = await admin.post<{ ok: boolean }>('/jobs', {
    name: 'export'
  })
  console.log(body.ok)
} catch (e) {
  if (e instanceof HTTPError) throw e
}
```
