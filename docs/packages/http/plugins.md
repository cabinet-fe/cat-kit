---
title: 插件系统
description: HTTP 客户端插件系统的完整文档
outline: deep
---

# 插件系统

HTTP 客户端的插件系统提供了强大的扩展能力，可以在请求的不同阶段插入自定义逻辑。

## 插件接口

```typescript
interface ClientPlugin {
  /**
   * 请求前钩子
   * @param url 请求 URL
   * @param config 请求配置
   * @returns 修改后的 URL 和配置
   */
  beforeRequest?(
    url: string,
    config: RequestConfig
  ): Promise<PluginHookResult | void> | PluginHookResult | void

  /**
   * 响应后钩子
   * @param response 响应对象
   * @param url 请求 URL
   * @param config 请求配置
   * @returns 修改后的响应对象
   */
  afterRespond?(
    response: HTTPResponse,
    url: string,
    config: RequestConfig
  ): Promise<HTTPResponse | void> | HTTPResponse | void
}

interface PluginHookResult {
  /** 修改后的 URL */
  url?: string
  /** 修改后的请求配置 */
  config?: RequestConfig
}
```

## 插件执行顺序

插件按照在 `plugins` 数组中的顺序执行：

1. 按顺序执行所有插件的 `beforeRequest` 钩子
2. 发送实际的 HTTP 请求
3. 按顺序执行所有插件的 `afterRespond` 钩子

```typescript
const http = new HTTPClient('', {
  plugins: [
    pluginA, // 先执行
    pluginB, // 后执行
    pluginC // 最后执行
  ]
})
```

## 内置插件

### TokenPlugin

令牌插件用于自动在请求头中添加认证令牌。

**用法：**

```typescript
import { HTTPClient, TokenPlugin } from '@cat-kit/http'

const http = new HTTPClient('', {
  plugins: [
    TokenPlugin({
      getter: () => localStorage.getItem('token'),
      authType: 'Bearer',
      headerName: 'Authorization'
    })
  ]
})
```

**配置选项：**

```typescript
interface TokenPluginOptions {
  /**
   * 获取令牌的方法
   * - 可以返回 string、null、undefined
   * - 可以是同步或异步函数
   */
  getter: () => string | null | undefined | Promise<string | null | undefined>

  /**
   * 请求头名称
   * @default 'Authorization'
   */
  headerName?: string

  /**
   * 授权类型
   * - 'Bearer': 格式化为 'Bearer <token>'
   * - 'Basic': 格式化为 'Basic <token>'
   * - 'Custom': 使用自定义格式化函数
   * @default 'Bearer'
   */
  authType?: 'Bearer' | 'Basic' | 'Custom'

  /**
   * 自定义格式化方法
   * - 仅在 authType 为 'Custom' 时使用
   */
  formatter?: (token: string) => string
}
```

**示例：**

```typescript
// Bearer 令牌（最常见）
TokenPlugin({
  getter: () => localStorage.getItem('access_token')
  // 默认使用 Bearer，会添加请求头：Authorization: Bearer <token>
})

// 从异步存储获取令牌
TokenPlugin({
  getter: async () => {
    const token = await AsyncStorage.getItem('token')
    return token
  }
})

// Basic 认证
TokenPlugin({
  getter: () => btoa('username:password'),
  authType: 'Basic'
  // 添加请求头：Authorization: Basic <encoded>
})

// 自定义格式
TokenPlugin({
  getter: () => 'my-secret-token',
  authType: 'Custom',
  formatter: token => `Token ${token}`
  // 添加请求头：Authorization: Token my-secret-token
})

// 自定义请求头名称
TokenPlugin({
  getter: () => localStorage.getItem('api_key'),
  headerName: 'X-API-Key',
  authType: 'Custom',
  formatter: token => token
  // 添加请求头：X-API-Key: <token>
})
```

#### 交互示例

::: demo http/token.vue
:::

### MethodOverridePlugin

方法重写插件用于绕过某些环境对特定 HTTP 方法的限制。

**用法：**

```typescript
import { HTTPClient, MethodOverridePlugin } from '@cat-kit/http'

const http = new HTTPClient('', {
  plugins: [
    MethodOverridePlugin({
      methods: ['DELETE', 'PUT', 'PATCH'],
      overrideMethod: 'POST'
    })
  ]
})
```

**配置选项：**

```typescript
interface MethodOverridePluginOptions {
  /**
   * 需要被重写的请求方法列表
   * @default ['DELETE', 'PUT', 'PATCH']
   */
  methods?: RequestMethod[]

  /**
   * 重写后使用的请求方法
   * @default 'POST'
   */
  overrideMethod?: RequestMethod
}
```

**工作原理：**

1. 检查请求方法是否在 `methods` 列表中
2. 如果是，将实际请求方法改为 `overrideMethod`
3. 在请求头中添加 `X-HTTP-Method-Override` 字段，值为原始方法

**示例：**

```typescript
// 默认配置：重写 DELETE、PUT、PATCH 为 POST
MethodOverridePlugin()

// 自定义重写规则
MethodOverridePlugin({
  methods: ['PUT', 'PATCH'],
  overrideMethod: 'POST'
})

// 使用示例
const http = new HTTPClient('', {
  plugins: [MethodOverridePlugin()]
})

// 发送 DELETE 请求
await http.delete('/users/123')
// 实际发送的是 POST 请求，请求头包含：
// X-HTTP-Method-Override: DELETE
```

**使用场景：**

- 某些网络环境只允许 GET 和 POST 方法
- 代理服务器限制了某些 HTTP 方法
- 需要与不支持 REST 方法的后端兼容

## 自定义插件

### 基础插件

创建一个简单的日志插件：

```typescript
import type { ClientPlugin } from '@cat-kit/http'

function LoggerPlugin(): ClientPlugin {
  return {
    beforeRequest(url, config) {
      console.log(`[请求] ${config.method} ${url}`)
      console.log('请求配置:', config)
    },

    afterRespond(response, url, config) {
      console.log(`[响应] ${config.method} ${url}`)
      console.log('状态码:', response.code)
      console.log('响应数据:', response.data)
      return response
    }
  }
}

// 使用插件
const http = new HTTPClient('', {
  plugins: [LoggerPlugin()]
})
```

### 修改请求

创建一个添加时间戳的插件：

```typescript
function TimestampPlugin(): ClientPlugin {
  return {
    beforeRequest(url, config) {
      // 在查询参数中添加时间戳
      return {
        config: {
          ...config,
          query: {
            ...config.query,
            _t: Date.now()
          }
        }
      }
    }
  }
}
```

### UI 交互插件

创建加载状态插件：

```typescript
import { Snackbar } from '@varlet/ui'

function LoadingPlugin(): ClientPlugin {
  let requestCount = 0

  return {
    beforeRequest() {
      if (requestCount === 0) {
        Snackbar.loading('请求中...')
      }
      requestCount++
    },
    afterRespond(response) {
      requestCount--
      if (requestCount === 0) {
        Snackbar.clear()
      }
      return response
    }
  }
}
```

#### 交互示例

::: demo http/loading.vue
:::

### 交互式拦截

创建删除确认插件：

```typescript
import { Dialog } from '@varlet/ui'

function ConfirmDeletePlugin(): ClientPlugin {
  return {
    async beforeRequest(url, config) {
      if (config.method === 'DELETE') {
        try {
          await Dialog({
            title: '确认删除',
            message: '确定要删除该项吗？此操作不可恢复。'
          })
        } catch {
          throw new Error('用户取消操作')
        }
      }
    }
  }
}
```

#### 交互示例

::: demo http/confirm.vue
:::

### 修改响应

创建一个数据转换插件：

```typescript
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

function DataTransformPlugin(): ClientPlugin {
  return {
    afterRespond(response) {
      // 假设后端返回的格式是 { code, data, message }
      const apiResponse = response.data as ApiResponse<any>

      // 转换为标准格式
      return {
        ...response,
        code: apiResponse.code,
        data: apiResponse.data
      }
    }
  }
}
```

### 错误处理

创建一个统一的错误处理插件：

```typescript
function ErrorHandlerPlugin(): ClientPlugin {
  return {
    afterRespond(response) {
      if (response.code >= 400) {
        // 处理 HTTP 错误
        if (response.code === 401) {
          console.error('未授权，请重新登录')
          // 可以触发登录流程
        } else if (response.code === 403) {
          console.error('无权访问')
        } else if (response.code === 404) {
          console.error('资源不存在')
        } else if (response.code >= 500) {
          console.error('服务器错误')
        }
      }
      return response
    }
  }
}
```

### 请求重试

创建一个自动重试的插件：

```typescript
function RetryPlugin(
  maxRetries: number = 3,
  delay: number = 1000
): ClientPlugin {
  const retryCount = new WeakMap<any, number>()

  return {
    async afterRespond(response, url, config) {
      // 如果请求成功，返回响应
      if (response.code < 500) {
        return response
      }

      // 获取当前重试次数
      const count = retryCount.get(config) || 0

      // 如果已达到最大重试次数，返回错误响应
      if (count >= maxRetries) {
        console.error(`请求失败，已重试 ${maxRetries} 次`)
        return response
      }

      // 记录重试次数
      retryCount.set(config, count + 1)

      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, delay * (count + 1)))

      console.log(`第 ${count + 1} 次重试: ${url}`)

      // 注意：这里需要直接调用引擎，实际使用中可能需要其他方式
      // 这只是示例，实际实现可能需要访问客户端实例
      return response
    }
  }
}
```

### 请求缓存

创建一个简单的请求缓存插件：

```typescript
function CachePlugin(ttl: number = 60000): ClientPlugin {
  const cache = new Map<string, { data: any; timestamp: number }>()

  return {
    beforeRequest(url, config) {
      // 只缓存 GET 请求
      if (config.method !== 'GET') {
        return
      }

      const cacheKey = url + JSON.stringify(config.query)
      const cached = cache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < ttl) {
        console.log('使用缓存:', cacheKey)
        // 注意：这里无法直接返回缓存的响应
        // 实际实现可能需要在 afterRespond 中处理
      }
    },

    afterRespond(response, url, config) {
      // 只缓存成功的 GET 请求
      if (config.method === 'GET' && response.code === 200) {
        const cacheKey = url + JSON.stringify(config.query)
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        })
      }
      return response
    }
  }
}
```

### 性能监控

创建一个性能监控插件：

```typescript
function PerformancePlugin(): ClientPlugin {
  const timings = new WeakMap<any, number>()

  return {
    beforeRequest(url, config) {
      timings.set(config, Date.now())
      console.log(`[性能] 开始请求: ${url}`)
    },

    afterRespond(response, url, config) {
      const startTime = timings.get(config)
      if (startTime) {
        const duration = Date.now() - startTime
        console.log(`[性能] ${url} 耗时: ${duration}ms`)

        // 可以将性能数据上报到监控系统
        if (duration > 3000) {
          console.warn(`[性能警告] 请求耗时过长: ${url} (${duration}ms)`)
        }
      }
      return response
    }
  }
}
```

## 插件组合

可以组合多个插件来构建强大的功能：

```typescript
import { HTTPClient, TokenPlugin, MethodOverridePlugin } from '@cat-kit/http'

const http = new HTTPClient('/api', {
  plugins: [
    // 1. 添加令牌
    TokenPlugin({
      getter: () => localStorage.getItem('token')
    }),

    // 2. 方法重写
    MethodOverridePlugin(),

    // 3. 性能监控
    PerformancePlugin(),

    // 4. 错误处理
    ErrorHandlerPlugin(),

    // 5. 日志记录（最后执行）
    LoggerPlugin()
  ]
})
```

## 最佳实践

### 1. 插件职责单一

每个插件应该只负责一个功能：

```typescript
// ✅ 好的做法：职责单一
function TokenPlugin() {
  /* 只处理令牌 */
}
function LoggerPlugin() {
  /* 只处理日志 */
}

// ❌ 不好的做法：功能混杂
function MixedPlugin() {
  return {
    beforeRequest(url, config) {
      // 添加令牌
      // 记录日志
      // 添加时间戳
      // ...太多功能
    }
  }
}
```

### 2. 避免副作用

插件不应该修改原始的配置对象：

```typescript
// ✅ 好的做法：返回新对象
function GoodPlugin(): ClientPlugin {
  return {
    beforeRequest(url, config) {
      return {
        config: {
          ...config,
          headers: {
            ...config.headers,
            'X-Custom': 'value'
          }
        }
      }
    }
  }
}

// ❌ 不好的做法：直接修改
function BadPlugin(): ClientPlugin {
  return {
    beforeRequest(url, config) {
      config.headers!['X-Custom'] = 'value' // 直接修改
      return { config }
    }
  }
}
```

### 3. 处理异步操作

插件可以返回 Promise：

```typescript
function AsyncPlugin(): ClientPlugin {
  return {
    async beforeRequest(url, config) {
      // 异步获取某些数据
      const data = await fetchSomeData()

      return {
        config: {
          ...config,
          headers: {
            ...config.headers,
            'X-Data': data
          }
        }
      }
    }
  }
}
```

### 4. 错误处理

插件应该妥善处理错误：

```typescript
function SafePlugin(): ClientPlugin {
  return {
    beforeRequest(url, config) {
      try {
        // 可能失败的操作
        const token = getToken()
        return {
          config: {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${token}`
            }
          }
        }
      } catch (error) {
        console.error('获取令牌失败:', error)
        // 返回原配置
        return
      }
    }
  }
}
```

## 常见问题

### 插件的执行顺序是怎样的？

插件按照数组顺序依次执行：

```typescript
const http = new HTTPClient('', {
  plugins: [pluginA, pluginB, pluginC]
})

// beforeRequest 执行顺序: A → B → C
// afterRespond 执行顺序: A → B → C
```

### 如何在插件中取消请求？

插件本身不能直接取消请求，但可以抛出错误：

```typescript
function ValidationPlugin(): ClientPlugin {
  return {
    beforeRequest(url, config) {
      if (!isValid(config)) {
        throw new Error('请求配置无效')
      }
    }
  }
}
```

### 插件可以访问其他插件的数据吗？

插件之间不能直接通信，但可以通过配置对象传递数据：

```typescript
function PluginA(): ClientPlugin {
  return {
    beforeRequest(url, config) {
      return {
        config: {
          ...config,
          _pluginAData: 'some data'
        }
      }
    }
  }
}

function PluginB(): ClientPlugin {
  return {
    beforeRequest(url, config) {
      const dataFromA = (config as any)._pluginAData
      // 使用 PluginA 设置的数据
    }
  }
}
```

### 如何调试插件？

使用日志和断点：

```typescript
function DebugPlugin(): ClientPlugin {
  return {
    beforeRequest(url, config) {
      console.log('=== 请求前 ===')
      console.log('URL:', url)
      console.log('Config:', JSON.stringify(config, null, 2))
      debugger // 断点
    },
    afterRespond(response) {
      console.log('=== 响应后 ===')
      console.log('Response:', JSON.stringify(response, null, 2))
      debugger // 断点
      return response
    }
  }
}
```

## 下一步

- [类型定义](/packages/http/types) - 查看完整的类型定义
- [HTTP 客户端](/packages/http/client) - 返回客户端 API 文档
