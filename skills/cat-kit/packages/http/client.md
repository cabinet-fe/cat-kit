# http — 客户端与引擎

## 适用场景

使用 `HTTPClient` 统一一组接口的地址、默认配置、响应格式和错误处理；需要上传进度、替换底层传输或按业务域分组时也从这里选择。

## 如何选择

| 需求                           | 选择                                                                       |
| ------------------------------ | -------------------------------------------------------------------------- |
| 常规浏览器或现代 Node.js 请求  | `HTTPClient`，默认在全局 `fetch` 可用时使用 `FetchEngine`                  |
| 浏览器上传进度，或明确需要 XHR | 注入 `new XHREngine()`                                                     |
| 下载进度                       | `FetchEngine` 和 `XHREngine` 都支持；服务端未提供总长度时 `percent` 为 `0` |
| 测试、Mock 或其他传输实现      | 继承 `HttpEngine`，通过 `ClientConfig.engine` 注入                         |
| 同一服务下的多组路径           | 用 `group(prefix)` 派生子客户端                                            |
| 在插件中合并请求配置           | 用公开的 `mergeRequestConfig(base, patch)`                                 |

## 公共 API

### 客户端配置

```ts
new HTTPClient(prefix?: string, config?: ClientConfig)
```

| `ClientConfig` 字段                       | 用途                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| `origin`                                  | 协议、主机和端口；请求 URL 已是绝对 URL 时忽略                              |
| `timeout`                                 | 毫秒；`0` 或省略表示不设置超时                                              |
| `headers`                                 | 默认请求头；单次请求的同名字段优先                                          |
| `credentials`                             | 是否携带凭证，默认 `true`                                                   |
| `responseType`                            | `'json' \| 'text' \| 'blob' \| 'arraybuffer'`；省略时按 `Content-Type` 推断 |
| `signal`                                  | 默认 `AbortSignal`                                                          |
| `onUploadProgress` / `onDownloadProgress` | 默认传输进度回调，参数为 `{ loaded, total, percent }`                       |
| `xsrfCookieName` / `xsrfHeaderName`       | 默认分别为 `XSRF-TOKEN` / `X-XSRF-TOKEN`                                    |
| `plugins`                                 | `HTTPClientPlugin[]`；内置和自定义插件见 [plugins.md](plugins.md)           |
| `engine`                                  | `HttpEngine` 实例；省略时自动选择 `FetchEngine` 或 `XHREngine`              |

### 请求

```ts
client.request<T>(url: string, config?: RequestConfig): Promise<HTTPResponse<T>>
client.get<T>(url: string, config?: AliasRequestConfig): Promise<HTTPResponse<T>>
client.post<T>(url: string, body?, config?): Promise<HTTPResponse<T>>
client.put<T>(url: string, body?, config?): Promise<HTTPResponse<T>>
client.patch<T>(url: string, body?, config?): Promise<HTTPResponse<T>>
client.delete<T>(url: string, config?): Promise<HTTPResponse<T>>
client.head<T>(url: string, config?): Promise<HTTPResponse<T>>
client.options<T>(url: string, config?): Promise<HTTPResponse<T>>
```

`RequestConfig` 可覆盖客户端级的 `headers`、`timeout`、`credentials`、`responseType`、`signal`、进度回调和 XSRF 名称，还可传：

- `method`：`'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'`
- `body`：`BodyInit`、普通对象、`URLSearchParams` 或 `FormData`
- `query`：查询参数对象

### 响应与错误

```ts
interface HTTPResponse<T> {
  body: T
  code: number
  headers: Record<string, string>
  raw?: unknown
}
```

非 2xx、网络失败、解析失败、超时或取消都会拒绝 Promise。用 `HTTPError` 读取 `code`、`url`、`config`、`response` 和 `cause`：

```ts
type HttpErrorCode =
  | 'TIMEOUT'
  | 'ABORTED'
  | 'NETWORK'
  | 'PARSE'
  | 'AUTH'
  | 'UNKNOWN'
  | 'RETRY_LIMIT_EXCEEDED'
  | 'PLUGIN'

new HTTPError(message: string, options: HTTPErrorOptions)
```

当前内置引擎将非 2xx 归为 `NETWORK`，并把已解析的响应放在 `error.response`；不要把它误判为“没有收到响应”。

### 分组、取消与引擎

```ts
client.group(prefix: string): HTTPClient
client.abort(): void
client.getEngine(): HttpEngine
client.registerPlugin(plugin: HTTPClientPlugin): void

mergeRequestConfig(base: RequestConfig, patch: RequestConfig): RequestConfig
```

自定义引擎只需实现：

```ts
abstract class HttpEngine {
  abstract request<T>(url: string, config: RequestConfig): Promise<HTTPResponse<T>>
  abstract abort(): void
}
```

## 最小示例

```ts
import { HTTPClient, HTTPError } from '@cat-kit/http'

interface User {
  id: number
  name: string
}

const api = new HTTPClient('/api', { origin: 'https://example.com', timeout: 10_000 })

try {
  const { body } = await api.get<User>('/users/42')
  console.log(body.name)
} catch (error) {
  if (error instanceof HTTPError) {
    console.error(error.code, error.response?.code)
  }
}
```

## 必要边界

- 绝对 URL 不拼接 `origin` 和 `prefix`；相对 URL 会先拼接前缀。Node.js 中使用相对 URL 时通常应配置 `origin`。
- Node.js 运行时没有全局 `fetch` 时，自动回退的 `XHREngine` 还需要 `XMLHttpRequest`；两者都不可用时必须注入可用的自定义 `HttpEngine`。
- `query` 会追加到 URL 已有查询串；数组生成重复键、对象会 JSON 序列化、`undefined` 省略、`null` 写为字符串 `"null"`。
- 普通对象和数组请求体会 JSON 序列化；`URLSearchParams` 使用表单编码；`FormData` 的 multipart boundary 交给运行时设置；GET/HEAD 不发送 body。
- 内置 `FetchEngine` 的 `response.raw` 是 `Response`，`XHREngine` 则是 `XMLHttpRequest`；使用前按所选引擎收窄类型。
- `onUploadProgress` 在 `FetchEngine` 下被忽略；需要上传进度时显式使用 `XHREngine`。
- XSRF Cookie 到 Header 的注入只在浏览器同域请求中生效。
- 单次取消优先传 `signal`。`abort()` 会中止该引擎的全部在途请求；父子客户端共享引擎，因此任一方调用都会影响另一方的在途请求。
- 子客户端继承父客户端配置和插件；父客户端之后注册的插件对子客户端可见，子客户端插件不反向影响父客户端。
- `mergeRequestConfig` 对 `headers` 和 `query` 做浅合并；其他公开字段仅在 patch 明确给出非 `undefined` 值时覆盖。

## 类型入口

- [客户端与配置](../../generated/http/client.d.ts)
- [请求、响应、错误与插件类型](../../generated/http/types.d.ts)
- [引擎基类](../../generated/http/engine/engine.d.ts)
- [Fetch 引擎](../../generated/http/engine/fetch.d.ts)
- [XHR 引擎](../../generated/http/engine/xhr.d.ts)
