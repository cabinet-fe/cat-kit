# @cat-kit/http - HTTP 请求工具包

本文件为 `@cat-kit/http` 包提供详细的开发指导。

## 包概述

`@cat-kit/http` 是一个基于插件架构的现代 HTTP 客户端，提供灵活的引擎抽象和强大的插件系统。

**包名称**：`@cat-kit/http`
**依赖关系**：依赖 `@cat-kit/core`
**运行环境**：浏览器和 Node.js（取决于使用的引擎）

## 依赖说明

⚠️ **重要**：在开发此包时，优先从 `@cat-kit/core` 导入基础工具函数。

```typescript
// ✅ 正确：从 core 导入
import { isObject, deepClone } from '@cat-kit/core/src'
```

## 目录结构

```
packages/http/src/
├── engine/            # 请求引擎
│   ├── xhr.ts         # XMLHttpRequest 引擎
│   ├── fetch.ts       # Fetch API 引擎
│   └── index.ts
├── plugins/           # 内置插件
│   ├── token.ts       # Token 管理插件
│   ├── method-override.ts  # HTTP 方法覆盖插件
│   └── index.ts
├── client.ts          # HTTP 客户端实现
├── requestor.ts       # 请求器实现
├── types.ts           # 类型定义
└── index.ts           # 主导出文件
```

## 核心概念

### 1. 引擎（Engine）

引擎是实际执行 HTTP 请求的底层实现。支持多种引擎：

- **XHR Engine**：基于 XMLHttpRequest（浏览器）
- **Fetch Engine**：基于 Fetch API（浏览器和 Node.js）

**引擎接口**：
```typescript
export interface HttpEngine {
  /**
   * 执行 HTTP 请求
   */
  request<T = any>(config: RequestConfig): Promise<Response<T>>
}
```

### 2. 插件（Plugin）

插件用于处理横切关注点（cross-cutting concerns），如：
- 认证和授权
- 请求/响应拦截
- 错误处理
- 日志记录
- 重试逻辑

**插件接口**：
```typescript
export interface HttpPlugin {
  /**
   * 插件名称
   */
  name: string

  /**
   * 请求前钩子
   */
  onRequest?(config: RequestConfig): RequestConfig | Promise<RequestConfig>

  /**
   * 响应后钩子
   */
  onResponse?<T>(response: Response<T>): Response<T> | Promise<Response<T>>

  /**
   * 错误处理钩子
   */
  onError?(error: HttpError): void | Promise<void>
}
```

### 3. HTTP 客户端（Client）

客户端是用户直接交互的高级 API，封装了引擎和插件的管理。

```typescript
export class HttpClient {
  constructor(options: HttpClientOptions)

  /**
   * 注册插件
   */
  use(plugin: HttpPlugin): this

  /**
   * 执行 GET 请求
   */
  get<T = any>(url: string, config?: RequestConfig): Promise<Response<T>>

  /**
   * 执行 POST 请求
   */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>>

  // ... 其他 HTTP 方法
}
```

## 架构设计原则

### 插件优先

所有横切关注点都应该通过插件实现，而不是硬编码在客户端中：

```typescript
// ✅ 正确：使用插件
const client = new HttpClient()
client.use(tokenPlugin({ getToken: () => localStorage.getItem('token') }))

// ❌ 错误：硬编码在客户端
class HttpClient {
  request() {
    const token = localStorage.getItem('token')
    // ...
  }
}
```

### 引擎抽象

引擎应该是可替换的，客户端不应依赖特定引擎的实现细节：

```typescript
// ✅ 正确：通过配置选择引擎
const client = new HttpClient({
  engine: new FetchEngine()
})

// ❌ 错误：硬编码引擎
class HttpClient {
  async request() {
    return fetch(url) // 直接使用 fetch
  }
}
```

### 不可变配置

请求配置应该是不可变的，插件返回新配置而不是修改原配置：

```typescript
// ✅ 正确：返回新配置
onRequest(config: RequestConfig): RequestConfig {
  return {
    ...config,
    headers: {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }
}

// ❌ 错误：修改原配置
onRequest(config: RequestConfig): RequestConfig {
  config.headers['Authorization'] = `Bearer ${token}`
  return config
}
```

## 开发插件

### 插件模板

```typescript
import type { HttpPlugin, RequestConfig } from '../types'

export interface MyPluginOptions {
  // 插件配置选项
}

export function myPlugin(options: MyPluginOptions): HttpPlugin {
  return {
    name: 'my-plugin',

    onRequest(config: RequestConfig): RequestConfig {
      // 修改请求配置
      return {
        ...config,
        // 修改
      }
    },

    async onResponse(response) {
      // 处理响应
      return response
    },

    async onError(error) {
      // 处理错误
      console.error('Request failed:', error)
    }
  }
}
```

### 内置插件示例

#### Token 插件

自动管理认证 Token：

```typescript
export interface TokenPluginOptions {
  /**
   * 获取 Token 的函数
   */
  getToken: () => string | null | Promise<string | null>

  /**
   * Token 的 Header 名称
   */
  headerName?: string

  /**
   * Token 前缀（如 "Bearer "）
   */
  prefix?: string
}

export function tokenPlugin(options: TokenPluginOptions): HttpPlugin {
  const { getToken, headerName = 'Authorization', prefix = 'Bearer ' } = options

  return {
    name: 'token',

    async onRequest(config) {
      const token = await getToken()
      if (!token) return config

      return {
        ...config,
        headers: {
          ...config.headers,
          [headerName]: `${prefix}${token}`
        }
      }
    }
  }
}
```

#### 方法覆盖插件

用于不支持 PUT/DELETE 等方法的服务器：

```typescript
export function methodOverridePlugin(): HttpPlugin {
  return {
    name: 'method-override',

    onRequest(config) {
      const method = config.method?.toUpperCase()
      if (method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
        return {
          ...config,
          method: 'POST',
          headers: {
            ...config.headers,
            'X-HTTP-Method-Override': method
          }
        }
      }
      return config
    }
  }
}
```

## 开发引擎

### 引擎模板

```typescript
import type { HttpEngine, RequestConfig, Response } from '../types'

export class MyEngine implements HttpEngine {
  async request<T = any>(config: RequestConfig): Promise<Response<T>> {
    const { url, method = 'GET', headers, data, params } = config

    // 1. 构建完整 URL（包含查询参数）
    const fullUrl = this.buildUrl(url, params)

    // 2. 执行请求
    const result = await this.executeRequest(fullUrl, method, headers, data)

    // 3. 返回标准化响应
    return {
      data: result.data,
      status: result.status,
      statusText: result.statusText,
      headers: result.headers,
      config
    }
  }

  private buildUrl(url: string, params?: Record<string, any>): string {
    // 实现 URL 构建逻辑
  }

  private async executeRequest(
    url: string,
    method: string,
    headers?: Record<string, string>,
    data?: any
  ): Promise<any> {
    // 实现实际的请求逻辑
  }
}
```

## 类型定义

### 核心类型

```typescript
/**
 * 请求配置
 */
export interface RequestConfig {
  /** 请求 URL */
  url?: string
  /** HTTP 方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  /** 请求头 */
  headers?: Record<string, string>
  /** 查询参数 */
  params?: Record<string, any>
  /** 请求体数据 */
  data?: any
  /** 超时时间（毫秒） */
  timeout?: number
  /** 响应数据类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
}

/**
 * 响应对象
 */
export interface Response<T = any> {
  /** 响应数据 */
  data: T
  /** HTTP 状态码 */
  status: number
  /** 状态文本 */
  statusText: string
  /** 响应头 */
  headers: Record<string, string>
  /** 请求配置 */
  config: RequestConfig
}

/**
 * HTTP 错误
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public config: RequestConfig,
    public response?: Response,
    public code?: string
  ) {
    super(message)
    this.name = 'HttpError'
  }
}
```

## 使用示例

### 基本使用

```typescript
import { HttpClient, FetchEngine } from '@cat-kit/http'

// 创建客户端
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  engine: new FetchEngine()
})

// 发起请求
const response = await client.get('/users')
console.log(response.data)
```

### 使用插件

```typescript
import { HttpClient, tokenPlugin, methodOverridePlugin } from '@cat-kit/http'

const client = new HttpClient()

// 注册 Token 插件
client.use(tokenPlugin({
  getToken: () => localStorage.getItem('access_token')
}))

// 注册方法覆盖插件
client.use(methodOverridePlugin())

// 请求会自动添加 Token 和处理方法覆盖
await client.delete('/users/123')
```

## 测试规范

测试文件位于 `packages/tests/http/` 目录：

```typescript
// packages/tests/http/client.test.ts
import { describe, it, expect, vi } from 'vitest'
import { HttpClient, type HttpPlugin } from '@cat-kit/http/src'

describe('HttpClient', () => {
  it('should execute GET request', async () => {
    const client = new HttpClient()
    const response = await client.get('/test')
    expect(response.status).toBe(200)
  })

  it('should apply plugin', async () => {
    const plugin: HttpPlugin = {
      name: 'test-plugin',
      onRequest: vi.fn(config => config)
    }

    const client = new HttpClient()
    client.use(plugin)

    await client.get('/test')
    expect(plugin.onRequest).toHaveBeenCalled()
  })
})
```

## 添加新功能

### 添加新插件

1. 在 `src/plugins/` 下创建新文件
2. 定义插件选项接口
3. 实现插件工厂函数
4. 在 `src/plugins/index.ts` 中导出
5. 在 `src/index.ts` 中导出
6. 添加测试

### 添加新引擎

1. 在 `src/engine/` 下创建新文件
2. 实现 `HttpEngine` 接口
3. 在 `src/engine/index.ts` 中导出
4. 添加测试

## 构建配置

构建配置位于 `build/pkgs.ts`：

```typescript
{
  dir: pkg('http'),
  deps: ['@cat-kit/core'],
  build: {
    input: 'src/index.ts',
    external: ['@cat-kit/core']
  }
}
```

## 常见任务

### 添加认证插件
→ 在 `src/plugins/` 下创建新插件，处理认证逻辑

### 添加重试插件
→ 实现 `onError` 钩子，处理请求重试

### 添加新的请求引擎
→ 在 `src/engine/` 下实现 `HttpEngine` 接口

### 优化错误处理
→ 编辑 `types.ts`，扩展 `HttpError` 类

## 设计考虑

### 性能

- 避免在每次请求时创建新对象
- 缓存常用配置
- 使用连接池（如果引擎支持）

### 安全

- 验证 URL
- 防止 CSRF（可通过插件实现）
- 安全存储 Token

### 扩展性

- 插件系统应该足够灵活
- 引擎应该易于替换
- 配置应该支持继承和覆盖
