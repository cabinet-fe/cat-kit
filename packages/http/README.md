# HTTP 请求客户端

`@cat-kit/http`是一个符合人体工学的，提供了跨端(node 和浏览器)的 http 请求客户端。

## 基础使用

```ts
import { HTTPClient } from '@cat-kit/http'

const http = new HTTPClient({
  // origin不是必填的, 但是在node环境下如果没有指定并且请求的url中没有origin信息
  // 那么接口会报错，浏览器则会去window.location对象中自动获取
  origin: 'http://localhost:8080',
  // 超时时间 30s
  timeout: 30 * 1000
})

// 发起请求
http.request('/api', { method: 'get' }).then(res => {
  // ...do some things
})

// 请求别名
http.get('/api', { params: { name: 'Zhang San' } }).then(res => {
  // ...do some things
})
```

## 插件

插件系统是`@cat-kit/http`中的核心，你可以基于插件系统灵活地组合和增强请求客户端。

每个插件是像下面一样的类型

```ts
interface ClientPlugin {
  beforeRequest?: () => any
  afterRespond?: () => any
}
```

### 提供的插件

- TokenPlugin

TokenPlugin 是令牌插件，用于将令牌添加到 Header 中。

```ts
import { TokenPlugin, HTTPClient } from '@cat-kit/http'

const http = new HTTPClient({
  plugins: [
    TokenPlugin({
      // 获取token的方法，可以是异步的
      getter: () => sessionStorage.getItem('token'),
      // 授权类型，暂时只有Bearer
      authType: 'Bearer'
    })
  ]

  // 其他配置...
})
```

- MethodOverridePlugin

MethodOverridePlugin 用于绕过安全拦截问题，一般你不需要使用，它的功能是在你请求时将你的请求方法更换为 post，并将被覆盖的方法放到 X-HTTP-Method-Override 请求头中.

```ts
import { MethodOverridePlugin, HTTPClient } from '@cat-kit/http'

const http = new HTTPClient({
  plugins: [
    MethodOverridePlugin({
      // 默认是['delete', 'put']请求会被覆盖
      methods: ['delete', 'put', 'patch']
    })
  ]

  // 其他配置...
})
```

## 分组

分组用于挂载正在请求的 http，并可以通过执行专有方法来控制这些请求，例如终止请求。

使用分组非常简单，只需要调用客户端的`group`方法, 便可生成分组，然后你可以像在客户端上请求接口一样在分组上请求。

```ts
import { HTTPClient } from '@cat-kit/http'

const http = new HTTPClient()

const group = http.group('/group')

// 停止所有正在请求中的接口
group.abort()

// 手动有条件地停止
group.abort(requests => {
  requests.forEach(request => {
    if (request.pathname.startWith('/api')) {
      request.abort()
    }
  })
})
```
