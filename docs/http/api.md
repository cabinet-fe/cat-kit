# HTTP API 参考

HTTP 工具的完整 API 参考文档。

## createClient

创建 HTTP 客户端实例。

### 类型签名

```typescript
function createClient(config?: ClientConfig): HttpClient
```

### 参数

| 参数   | 类型           | 说明       |
| ------ | -------------- | ---------- |
| config | `ClientConfig` | 客户端配置 |

### ClientConfig

```typescript
interface ClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  engine?: 'fetch' | 'xhr'
  withCredentials?: boolean
}
```

## HttpClient

HTTP 客户端实例方法。

### get

```typescript
get<T>(url: string, config?: RequestConfig): Promise<Response<T>>
```

### post

```typescript
post<T>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>>
```

### put

```typescript
put<T>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>>
```

### delete

```typescript
delete<T>(url: string, config?: RequestConfig): Promise<Response<T>>
```

### patch

```typescript
patch<T>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>>
```

::: warning 开发中
完整的 API 文档正在编写中，敬请期待。
:::

## 相关资源

- [HTTP 概述](/http/index) - 完整文档
- [快速开始](/http/getting-started) - 快速上手
