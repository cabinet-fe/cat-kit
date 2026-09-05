---
title: "HTTP 客户端示例"
description: "创建客户端与子客户端、发送 GET 请求、捕获 HTTPError 并中止请求"
---

# HTTP 客户端 — 示例

创建指定引擎的客户端，按业务域分组请求，统一捕获 `HTTPError` 并支持中止。

```ts
import { HTTPClient, HTTPError, FetchEngine } from '@cat-kit/http'

const api = new HTTPClient('/api', {
  origin: 'https://example.com',
  timeout: 10_000,
  engine: new FetchEngine()
})

const users = api.group('/users')

try {
  const { body } = await users.get<{ id: number; name: string }>('/42')
  console.log(body.name)
} catch (error) {
  if (error instanceof HTTPError) {
    console.error(error.code, error.response?.code)
  }
}

api.abort()
```
