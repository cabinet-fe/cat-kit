---
title: "HTTP 插件示例"
description: "配置 TokenPlugin、MethodOverridePlugin 与自定义插件的示例"
---

# HTTP 插件 — 示例

在客户端上配置 Token 注入与刷新、方法覆盖，并注册一个自定义 `beforeRequest` 插件。

```ts
import {
  HTTPClient,
  MethodOverridePlugin,
  TokenPlugin
} from '@cat-kit/http'

const http = new HTTPClient('/api', {
  origin: 'https://example.com',
  plugins: [
    TokenPlugin({
      getter: () => localStorage.getItem('token'),
      shouldRefresh: (error) => error.response?.code === 401,
      onRefresh: async () => {
        // 刷新并写回 token
      }
    }),
    MethodOverridePlugin({ methods: ['DELETE'] })
  ]
})

http.registerPlugin({
  name: 'log',
  beforeRequest({ url }) {
    console.debug('→', url)
  }
})
```
