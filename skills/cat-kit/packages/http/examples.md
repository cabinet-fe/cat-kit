# @cat-kit/http 示例

## 基础用法

```ts
import { HTTPClient } from '@cat-kit/http'

const http = new HTTPClient('/api', { origin: 'https://api.example.com', timeout: 30_000 })

const res = await http.get('/v1/status')
console.log(res.body, res.code)
```

## 带查询参数

```ts
const users = await http.get('/users', { query: { page: 1, limit: 10, search: 'Alice' } })
// GET /api/users?page=1&limit=10&search=Alice
```

## POST / PUT / PATCH

```ts
// 自动 JSON 序列化
await http.post('/users', { name: 'Alice', email: 'alice@example.com' })

await http.patch('/users/1', { name: 'Bob' })
```

## 错误处理

```ts
import { HTTPError } from '@cat-kit/http'

try {
  await http.get('/data')
} catch (err) {
  if (err instanceof HTTPError) {
    console.error(`${err.code}: ${err.url} → ${err.response?.code}`)
  }
}
```

## 请求中断

```ts
const ctrl = new AbortController()
const promise = http.get('/slow', { signal: ctrl.signal })
ctrl.abort() // 立即取消
// promise 将 reject with HTTPError({ code: 'ABORTED' })
```

## 子客户端分组

```ts
const api = new HTTPClient('/api', { origin: 'https://example.com' })

const usersApi = api.group('/users')
const postsApi = api.group('/posts')

// usersApi.get('/') → GET /api/users
// postsApi.get('/') → GET /api/posts
```

## Token 刷新与重试

```ts
import { HTTPClient, TokenPlugin } from '@cat-kit/http'

let token = ''
let refreshToken = ''

const http = new HTTPClient('/api', {
  origin: 'https://api.example.com',
  plugins: [
    TokenPlugin({
      getter: () => token,
      maxRetries: 3,
      onRefresh: async () => {
        const res = await fetch('/auth/refresh', { body: JSON.stringify({ refreshToken }) })
        const data = await res.json()
        token = data.accessToken
      },
      shouldRefresh: (res) => res.code === 401
    })
  ]
})

await http.get('/profile')
```

## 自定义插件

```ts
import { HTTPClient, HTTPClientPlugin } from '@cat-kit/http'

const loggerPlugin: HTTPClientPlugin = {
  name: 'logger',

  async beforeRequest(url, config) {
    console.debug(`→ ${config.method} ${url}`)
  },

  async afterRespond(response, url) {
    console.debug(`← ${response.code} ${url}`)
  },

  async onError(error, { url, config }) {
    console.error(`✕ ${config.method} ${url}:`, error)
  }
}

const http = new HTTPClient('/api', { origin: 'https://api.example.com', plugins: [loggerPlugin] })
```

> 类型参考：`../../generated/http/index.d.ts`
