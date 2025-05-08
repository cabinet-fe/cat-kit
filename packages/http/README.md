# HTTP 请求客户端

`@cat-kit/http` 是一个符合人体工学的，提供了跨端(Node.js 和浏览器)的 HTTP 请求客户端。

## 特性

- 🌐 **跨平台**：同时支持浏览器和 Node.js 环境
- 🔌 **插件系统**：灵活的插件系统，可以轻松扩展功能
- 🧩 **类型安全**：完整的 TypeScript 类型支持
- 🚀 **简单易用**：人性化的 API 设计，使用起来非常简单
- 🔄 **请求分组**：支持请求分组，方便管理和控制请求
- ⚙️ **多引擎支持**：支持 Fetch API 和 XMLHttpRequest 两种请求引擎

## 安装

```bash
# 使用 npm
npm install @cat-kit/http

# 使用 yarn
yarn add @cat-kit/http

# 使用 pnpm
pnpm add @cat-kit/http

# 使用 bun
bun add @cat-kit/http
```

## 基础使用

```ts
import { HTTPClient } from '@cat-kit/http'

const http = new HTTPClient({
  // origin 不是必填的, 但是在 Node.js 环境下如果没有指定并且请求的 URL 中没有 origin 信息
  // 那么接口会报错，浏览器则会去 window.location 对象中自动获取
  origin: 'http://localhost:8080',
  // 超时时间 30s
  timeout: 30 * 1000
})

// 发起请求
http.request('/api', { method: 'GET' }).then(res => {
  console.log(res.data)
})

// 请求别名
http.get('/api', { query: { name: '张三' } }).then(res => {
  console.log(res.data)
})

// 发送 POST 请求
http.post('/api/users', { name: '张三', age: 18 }).then(res => {
  console.log(res.data)
})

// 链式调用
http
  .setHeaders({ 'Content-Type': 'application/json' })
  .setTimeout(5000)
  .post('/api/login', { username: 'admin', password: '123456' })
  .then(res => {
    console.log(res.data)
  })
```

## 请求方法

HTTP 客户端提供了所有标准 HTTP 方法的简便方法：

```ts
// GET 请求
http.get('/api/users')

// POST 请求
http.post('/api/users', { name: '张三' })

// PUT 请求
http.put('/api/users/1', { name: '李四' })

// DELETE 请求
http.delete('/api/users/1')

// PATCH 请求
http.patch('/api/users/1', { name: '王五' })

// HEAD 请求
http.head('/api/users')

// OPTIONS 请求
http.options('/api/users')
```

## 请求配置

```ts
const http = new HTTPClient({
  // 源地址
  origin: 'https://api.example.com',

  // 基础路径
  base: '/v1',

  // 超时时间（毫秒）
  timeout: 10000,

  // 默认请求头
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },

  // 是否发送凭证（cookies）
  credentials: true,

  // 请求引擎类型：'fetch'、'xhr' 或 'auto'
  engineType: 'auto',

  // 是否自动处理错误
  autoHandleError: true,

  // 插件列表
  plugins: []
})
```

## 响应处理

```ts
http.get('/api/users').then(response => {
  // 响应数据
  console.log(response.data)

  // HTTP 状态码
  console.log(response.code)

  // 响应头
  console.log(response.headers)
})
```

## 错误处理

```ts
http
  .get('/api/users')
  .then(response => {
    console.log(response.data)
  })
  .catch(error => {
    if (error.name === 'HTTPError') {
      // HTTP 错误（4xx, 5xx）
      console.error(`HTTP 错误 ${error.code}: ${error.message}`)
      console.error('响应数据:', error.data)
    } else if (error.name === 'TimeoutError') {
      // 超时错误
      console.error(`请求超时: ${error.url}`)
    } else if (error.name === 'AbortError') {
      // 请求被中止
      console.error(`请求被中止: ${error.url}`)
    } else {
      // 其他错误
      console.error('请求错误:', error.message)
    }
  })
```

## 泛型支持

```ts
interface User {
  id: number
  name: string
  email: string
}

// 指定响应数据类型
http.get<User>('/api/users/1').then(response => {
  // response.data 的类型为 User
  const user = response.data
  console.log(user.name)
})

// 获取用户列表
http.get<User[]>('/api/users').then(response => {
  // response.data 的类型为 User[]
  const users = response.data
  users.forEach(user => {
    console.log(user.name)
  })
})
```

## 插件系统

插件系统是 `@cat-kit/http` 中的核心，你可以基于插件系统灵活地组合和增强请求客户端。

每个插件都可以实现以下钩子：

```ts
interface ClientPlugin {
  // 请求前钩子
  beforeRequest?(
    url: string,
    options: RequestOptions
  ): Promise<PluginHookResult | void> | PluginHookResult | void

  // 响应后钩子
  afterRespond?(
    response: HTTPResponse,
    url: string,
    options: RequestOptions
  ): Promise<HTTPResponse | void> | HTTPResponse | void
}
```

### 提供的插件

#### TokenPlugin

TokenPlugin 是令牌插件，用于将令牌添加到请求头中。

```ts
import { TokenPlugin, HTTPClient } from '@cat-kit/http'

const http = new HTTPClient({
  plugins: [
    TokenPlugin({
      // 获取 token 的方法，可以是异步的
      getter: () => localStorage.getItem('token'),

      // 授权类型：'Bearer'、'Basic' 或 'Custom'
      authType: 'Bearer',

      // 自定义令牌格式化方法（仅在 authType 为 'Custom' 时有效）
      formatter: token => `Custom ${token}`,

      // 请求头名称
      headerName: 'Authorization',

      // 是否每次请求都刷新令牌
      refresh: false,

      // 令牌缓存时间（毫秒）
      cacheTime: 3600000 // 1小时
    })
  ]
})
```

#### MethodOverridePlugin

MethodOverridePlugin 用于绕过某些环境对特定 HTTP 方法的限制，它会将指定的请求方法更换为 POST，并将原始方法放到 X-HTTP-Method-Override 请求头中。

```ts
import { MethodOverridePlugin, HTTPClient } from '@cat-kit/http'

const http = new HTTPClient({
  plugins: [
    MethodOverridePlugin({
      // 需要被覆盖的请求方法
      methods: ['DELETE', 'PUT', 'PATCH'],

      // 覆盖后的请求方法
      overrideMethod: 'POST',

      // 请求头名称
      headerName: 'X-HTTP-Method-Override'
    })
  ]
})
```

### 自定义插件

你可以创建自己的插件来扩展 HTTP 客户端的功能：

```ts
import { ClientPlugin, HTTPClient } from '@cat-kit/http'

// 创建一个日志插件
const LoggerPlugin = (): ClientPlugin => {
  return {
    beforeRequest(url, options) {
      console.log(`请求开始: ${options.method} ${url}`)
      console.log('请求选项:', options)

      // 记录请求开始时间
      const startTime = Date.now()

      return {
        options: {
          ...options,
          // 在请求选项中存储开始时间，以便在响应后使用
          _startTime: startTime
        }
      }
    },

    afterRespond(response, url, options) {
      const startTime = (options as any)._startTime
      const duration = Date.now() - startTime

      console.log(`请求完成: ${options.method} ${url}`)
      console.log(`状态码: ${response.code}`)
      console.log(`耗时: ${duration}ms`)
      console.log('响应数据:', response.data)

      return response
    }
  }
}

// 使用自定义插件
const http = new HTTPClient({
  plugins: [LoggerPlugin()]
})
```

## 请求分组

分组用于管理相关的请求，并可以通过执行专有方法来控制这些请求，例如终止请求。

```ts
import { HTTPClient } from '@cat-kit/http'

const http = new HTTPClient()

// 创建一个用户相关的请求分组
const userGroup = http.group('/users')

// 等同于 http.get('/users/profile')
userGroup.get('/profile').then(res => {
  console.log(res.data)
})

// 等同于 http.post('/users/login')
userGroup
  .post('/login', { username: 'admin', password: '123456' })
  .then(res => {
    console.log(res.data)
  })

// 中止分组中的所有请求
userGroup.abort()
```

## 高级用法

### 链式调用

```ts
http
  .setHeaders({ 'X-Custom-Header': 'value' })
  .setHeader('Authorization', 'Bearer token')
  .setBase('/api/v2')
  .setTimeout(15000)
  .get('/users')
  .then(res => {
    console.log(res.data)
  })
```

### 并发请求

```ts
import { HTTPClient } from '@cat-kit/http'

const http = new HTTPClient()

// 并发请求
Promise.all([
  http.get('/api/users'),
  http.get('/api/posts'),
  http.get('/api/comments')
]).then(([users, posts, comments]) => {
  console.log('用户:', users.data)
  console.log('文章:', posts.data)
  console.log('评论:', comments.data)
})
```

## 浏览器兼容性

- 现代浏览器（Chrome、Firefox、Safari、Edge）：完全支持
- 旧版浏览器：通过 XHREngine 提供兼容支持

## Node.js 兼容性

- Node.js 14.x 及以上版本：完全支持
- 低版本 Node.js：可能需要 polyfill
