# 最佳实践

本指南介绍使用 CatKit 的推荐做法和常见模式。

## 按需导入

始终使用按需导入来减小打包体积：

```typescript
// ✅ 推荐：只导入需要的函数
import { chunk, unique, group } from '@cat-kit/core'

// ❌ 不推荐：导入整个模块
import * as core from '@cat-kit/core'
```

## 类型安全

充分利用 TypeScript 的类型系统：

```typescript
import { chunk } from '@cat-kit/core'

interface User {
  id: number
  name: string
}

// 类型会自动推断为 User[][]
const users: User[] = [...]
const chunks = chunk(users, 10)
```

## 错误处理

### 同步函数

```typescript
import { safeExec } from '@cat-kit/core'

// 使用 safeExec 包装可能出错的代码
const [error, result] = safeExec(() => {
  return JSON.parse(jsonString)
})

if (error) {
  console.error('解析失败:', error)
} else {
  console.log('解析成功:', result)
}
```

### 异步函数

```typescript
import { safeExecAsync } from '@cat-kit/core'

// 异步错误处理
const [error, data] = await safeExecAsync(async () => {
  return await fetch('/api/data').then(r => r.json())
})

if (error) {
  // 处理错误
  console.error('请求失败:', error)
} else {
  // 使用数据
  console.log('数据:', data)
}
```

## 性能优化

### 防抖和节流

```typescript
import { debounce, throttle } from '@cat-kit/core'

// 搜索输入防抖
const handleSearch = debounce((query: string) => {
  // 执行搜索
}, 300)

// 滚动事件节流
const handleScroll = throttle(() => {
  // 处理滚动
}, 100)
```

### 并行执行

```typescript
import { parallel } from '@cat-kit/core'

// 并行执行多个异步任务（限制并发数）
const urls = ['url1', 'url2', 'url3', ...]

const results = await parallel(
  urls,
  async (url) => {
    return await fetch(url).then(r => r.json())
  },
  { concurrency: 3 } // 最多同时执行 3 个
)
```

## 数据处理

### 数组操作

```typescript
import { chunk, group, unique, sortBy } from '@cat-kit/core'

const users = [
  { id: 1, name: '张三', age: 25, role: 'admin' },
  { id: 2, name: '李四', age: 30, role: 'user' },
  { id: 3, name: '王五', age: 25, role: 'user' }
]

// 分组
const byRole = group(users, user => user.role)
// { admin: [...], user: [...] }

// 排序
const sorted = sortBy(users, 'age')

// 分块
const pages = chunk(users, 10)
```

### 对象操作

```typescript
import { pick, omit, deepClone } from '@cat-kit/core'

const user = {
  id: 1,
  name: '张三',
  password: 'secret',
  profile: { age: 25 }
}

// 选择字段
const publicUser = pick(user, ['id', 'name'])
// { id: 1, name: '张三' }

// 排除字段
const safeUser = omit(user, ['password'])
// { id: 1, name: '张三', profile: { age: 25 } }

// 深拷贝
const cloned = deepClone(user)
```

## 加密操作

### AES 加密

```typescript
import { encryptAES, decryptAES } from '@cat-kit/crypto/symmetric/aes'

// 使用密码加密
async function encryptSensitiveData(data: string, password: string) {
  try {
    return await encryptAES(data, password)
  } catch (error) {
    console.error('加密失败:', error)
    throw error
  }
}

// 解密
async function decryptSensitiveData(encrypted: string, password: string) {
  try {
    return await decryptAES(encrypted, password)
  } catch (error) {
    console.error('解密失败:', error)
    throw error
  }
}
```

### 数据完整性校验

```typescript
import { md5 } from '@cat-kit/crypto/digest/md5'

// 生成文件哈希
function getFileHash(content: string): string {
  return md5(content)
}

// 验证数据完整性
function verifyIntegrity(data: string, expectedHash: string): boolean {
  return md5(data) === expectedHash
}
```

## 存储管理

### LocalStorage 封装

```typescript
import { Storage } from '@cat-kit/fe'

// 创建存储实例
const userStorage = new Storage({
  prefix: 'myapp',
  storage: localStorage
})

// 存储对象（自动序列化）
userStorage.set('user', {
  id: 1,
  name: '张三',
  settings: { theme: 'dark' }
})

// 读取对象（自动反序列化）
const user = userStorage.get('user')

// 带过期时间
userStorage.set('token', 'abc123', { ttl: 3600 * 1000 }) // 1小时后过期
```

### Cookie 操作

```typescript
import { Cookie } from '@cat-kit/fe'

// 设置 Cookie
Cookie.set('session', 'xyz789', {
  expires: 7, // 7天后过期
  path: '/',
  secure: true,
  sameSite: 'strict'
})

// 读取 Cookie
const session = Cookie.get('session')

// 删除 Cookie
Cookie.remove('session')
```

## HTTP 请求

### 创建客户端

```typescript
import { createClient } from '@cat-kit/http'

// 创建客户端实例
const api = createClient({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 处理未授权
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### RESTful API

```typescript
// GET 请求
const users = await api.get('/users', {
  params: { page: 1, size: 10 }
})

// POST 请求
const newUser = await api.post('/users', {
  name: '张三',
  email: 'zhangsan@example.com'
})

// PUT 请求
const updated = await api.put(`/users/${id}`, {
  name: '李四'
})

// DELETE 请求
await api.delete(`/users/${id}`)
```

## 代码组织

### 工具函数模块化

```typescript
// utils/array.ts
export { chunk, unique, group } from '@cat-kit/core'

// utils/crypto.ts
export { md5 } from '@cat-kit/crypto/digest/md5'
export { encryptAES, decryptAES } from '@cat-kit/crypto/symmetric/aes'

// utils/storage.ts
import { Storage } from '@cat-kit/fe'
export const appStorage = new Storage({ prefix: 'myapp' })

// 在其他文件中使用
import { chunk } from './utils/array'
import { md5 } from './utils/crypto'
import { appStorage } from './utils/storage'
```

## 测试

### 单元测试

```typescript
import { describe, it, expect } from 'vitest'
import { chunk, unique } from '@cat-kit/core'

describe('数组工具', () => {
  it('应该正确分块', () => {
    const result = chunk([1, 2, 3, 4], 2)
    expect(result).toEqual([
      [1, 2],
      [3, 4]
    ])
  })

  it('应该去重', () => {
    const result = unique([1, 2, 2, 3, 3, 3])
    expect(result).toEqual([1, 2, 3])
  })
})
```

## 常见问题

### 避免不必要的计算

```typescript
import { memoize } from '@cat-kit/core'

// 缓存计算结果
const expensiveCalculation = memoize((n: number) => {
  // 复杂计算
  return n * n
})

// 第一次调用会执行计算
const result1 = expensiveCalculation(10)

// 第二次调用使用缓存
const result2 = expensiveCalculation(10) // 立即返回
```

### 处理大量数据

```typescript
import { chunk, parallel } from '@cat-kit/core'

// 分批处理大量数据
async function processBigData(items: any[]) {
  const batches = chunk(items, 100)

  return await parallel(
    batches,
    async batch => {
      return await processBatch(batch)
    },
    { concurrency: 3 }
  )
}
```

## 下一步

- 浏览 [核心工具](/core/data/array) 学习具体 API
- 查看 [加密工具](/crypto/symmetric/aes) 了解安全实践
- 探索 [前端工具](/fe/storage/storage) 学习浏览器 API
