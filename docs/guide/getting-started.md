# 快速开始

欢迎使用 CatKit！这是一个现代化的 TypeScript 工具库，专为提升开发效率而设计。

## 简介

CatKit 是一个功能丰富的工具库集合，提供以下核心功能：

- **核心工具 (@cat-kit/core)**: 数据处理、日期操作、性能优化、设计模式
- **加密工具 (@cat-kit/crypto)**: AES、MD5、SHA256、ID 生成
- **前端工具 (@cat-kit/fe)**: 存储管理、文件操作、Web API
- **HTTP 工具 (@cat-kit/http)**: 统一的 HTTP 请求客户端

## 安装

使用你喜欢的包管理器安装所需的包：

::: code-group

```bash [npm]
# 安装核心工具
npm install @cat-kit/core

# 安装加密工具
npm install @cat-kit/crypto

# 安装前端工具
npm install @cat-kit/fe

# 安装 HTTP 工具
npm install @cat-kit/http
```

```bash [pnpm]
pnpm add @cat-kit/core
pnpm add @cat-kit/crypto
pnpm add @cat-kit/fe
pnpm add @cat-kit/http
```

```bash [yarn]
yarn add @cat-kit/core
yarn add @cat-kit/crypto
yarn add @cat-kit/fe
yarn add @cat-kit/http
```

```bash [bun]
bun add @cat-kit/core
bun add @cat-kit/crypto
bun add @cat-kit/fe
bun add @cat-kit/http
```

:::

## 基础用法

### 数据处理

```typescript
import { chunk, unique } from '@cat-kit/core'

// 数组分块
const arr = [1, 2, 3, 4, 5, 6]
const chunks = chunk(arr, 2)
console.log(chunks) // [[1, 2], [3, 4], [5, 6]]

// 数组去重
const items = [1, 2, 2, 3, 3, 3]
const uniqueItems = unique(items)
console.log(uniqueItems) // [1, 2, 3]
```

### 加密操作

```typescript
import { encryptAES, decryptAES } from '@cat-kit/crypto/symmetric/aes'
import { md5 } from '@cat-kit/crypto/digest/md5'

// AES 加密
const encrypted = await encryptAES('secret message', 'my-password')
const decrypted = await decryptAES(encrypted, 'my-password')

// MD5 哈希
const hash = md5('hello world')
console.log(hash)
```

### 存储管理

```typescript
import { Storage } from '@cat-kit/fe'

const storage = new Storage({ prefix: 'myapp' })

// 保存数据
storage.set('user', { name: '张三', age: 25 })

// 读取数据
const user = storage.get('user')
console.log(user) // { name: '张三', age: 25 }
```

### HTTP 请求

```typescript
import { createClient } from '@cat-kit/http'

const client = createClient({
  baseURL: 'https://api.example.com',
  timeout: 5000
})

// 发起请求
const response = await client.get('/users')
console.log(response.data)
```

## Tree Shaking

CatKit 完全支持 tree-shaking，只会打包你实际使用的功能：

```typescript
// ✅ 推荐：按需导入
import { chunk, unique } from '@cat-kit/core'

// ❌ 不推荐：导入全部
import * as core from '@cat-kit/core'
```

## TypeScript 支持

所有包都使用 TypeScript 编写，提供完整的类型定义：

```typescript
import { chunk } from '@cat-kit/core'

// 自动类型推断
const numbers = [1, 2, 3, 4, 5]
const chunks = chunk(numbers, 2) // 类型: number[][]

// 泛型支持
interface User {
  id: number
  name: string
}

const users: User[] = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
]
const userChunks = chunk(users, 1) // 类型: User[][]
```

## 下一步

- 查看 [安装指南](/guide/installation) 了解详细安装说明
- 阅读 [最佳实践](/guide/best-practice) 学习推荐用法
- 浏览 [API 文档](/core/data/array) 探索所有功能

::: tip 提示
建议从核心工具包开始，它提供了最常用的工具函数。
:::
