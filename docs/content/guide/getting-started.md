---
title: 快速开始
description: 快速开始使用 Cat Kit
outline: deep
---

# 快速开始

## Cat Kit 解决了什么问题?

在日常开发中,我们经常遇到这些痛点:

### 🔄 重复造轮子

每个项目都在写相似的工具函数:数组去重、日期格式化、URL 拼接...这些基础能力需要在不同项目间反复实现。

### 📦 依赖混乱

为了解决简单问题引入大型库,导致项目体积膨胀。例如:仅为了格式化日期而引入整个 moment.js,或者为了一个 HTTP 请求引入 axios 的全部功能。

### 🌐 环境差异

前端代码无法在 Node.js 环境运行,后端工具无法在浏览器使用。同一个业务逻辑需要维护多套实现。

### 🔧 缺乏类型安全

JavaScript 生态的工具函数往往缺少完整的类型定义,导致运行时错误频发,开发体验差。

## Cat Kit 的解决方案

Cat Kit 提供了一套**轻量、类型安全、跨环境**的工具包,让你专注业务逻辑而非重复劳动:

- **按需引入** - 只打包你使用的函数,构建产物最小化
- **完整类型** - 100% TypeScript 编写,提供完整的类型推导和提示
- **跨平台** - 核心功能同时支持浏览器和 Node.js 环境
- **零配置** - 开箱即用,无需额外配置

## 安装

### 使用包管理器

::: code-group

```bash [bun]
bun add @cat-kit/core
```

```bash [npm]
npm install @cat-kit/core
```

```bash [pnpm]
pnpm add @cat-kit/core
```

:::

## 典型使用场景

### 场景 1: 避免重复的数组处理逻辑

**痛点**: 每次需要分组、去重、移动元素时都要写循环逻辑

**解决方案**: 使用 `@cat-kit/core` 的数组工具

```typescript
import { arr, last, union, unionBy } from '@cat-kit/core'

// 获取数组最后一个元素
const items = [1, 2, 3, 4, 5]
const lastItem = last(items) // 5

// 合并多个数组并去重
const arr1 = [1, 2, 3]
const arr2 = [2, 3, 4]
const merged = union(arr1, arr2) // [1, 2, 3, 4]

// 使用链式 API 进行更复杂的操作
const products = [
  { category: 'book', name: 'TypeScript' },
  { category: 'book', name: 'JavaScript' },
  { category: 'food', name: 'Apple' }
]
// 按类别分组
const grouped = arr(products).groupBy(item => item.category)
// { book: [...], food: [...] }

// 移动元素位置
const list = ['a', 'b', 'c', 'd']
const reordered = arr(list).move(0, 2) // ['b', 'c', 'a', 'd']
```

### 场景 2: 统一的日期处理

**痛点**: 原生 Date API 不够直观,需要大量的计算和格式化逻辑

**解决方案**: 使用简洁的日期工具

```typescript
import { date, Dater } from '@cat-kit/core'

// 创建日期实例 - 链式 API 设计
const now = date() // 当前时间
const specific = date('2025-12-10') // 指定日期

// 格式化日期 - 无需记忆复杂的 Date API
now.format('YYYY-MM-DD HH:mm:ss') // '2025-12-10 14:30:00'

// 日期计算 - 不可变操作
const nextWeek = now.addDays(7)
const nextMonth = now.addMonths(1)
const nextYear = now.addYears(1)

// 日期比较和判断
const deadline = date('2025-12-31')
const daysDiff = now.compare(deadline) // 返回天数差

// 判断是否在区间内
const isInRange = now.isBetween('2025-01-01', '2025-12-31')

// 对齐到时间边界
const startOfMonth = now.startOf('month')
const endOfWeek = now.endOf('week')
```

### 场景 3: 跨环境的 HTTP 请求

**痛点**: 浏览器用 fetch,Node.js 用不同的库,无法复用代码

**解决方案**: 使用统一的 HTTP 客户端

```typescript
import { HTTPClient } from '@cat-kit/http'

// 创建客户端 - 浏览器和 Node.js 都能用
const api = new HTTPClient('/api', {
  origin: 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 发送请求 - 简洁的链式调用
const users = await api.get<User[]>('/users')
const user = await api.post<User>('/users', { name: 'Zhang San' })

// 创建请求分组 - 更好的代码组织
const userApi = api.group('/users')
await userApi.get('/profile')  // 实际请求 /api/users/profile
await userApi.put('/settings', { theme: 'dark' })
```

### 场景 4: 前端存储管理

**痛点**: localStorage、sessionStorage API 使用繁琐,缺乏类型安全

**解决方案**: 类型安全的存储封装

```typescript
import { WebStorage, storageKey } from '@cat-kit/fe'

// 定义类型安全的存储键
const THEME_KEY = storageKey<'light' | 'dark'>('user-theme')
const USER_KEY = storageKey<{ name: string; age: number }>('user-info')

// 创建存储实例
const storage = new WebStorage(localStorage)

// 类型安全的读写 - 自动序列化/反序列化
storage.set(THEME_KEY, 'dark')
const theme = storage.get(THEME_KEY) // 类型: 'light' | 'dark' | null
const themeWithDefault = storage.get(THEME_KEY, 'light') // 类型: 'light' | 'dark'

// 支持过期时间（秒）
storage.set(USER_KEY, { name: 'John', age: 25 }, 3600) // 1小时后过期

// 批量获取
const [theme2, user] = storage.get([THEME_KEY, USER_KEY])

// 监听值变化
storage.on('user-theme', (key, value) => {
  console.log(`${key} changed to ${value}`)
})
```

### 场景 5: 文件下载和读取

**痛点**: 浏览器下载文件需要创建临时 `<a>` 元素,代码冗长

**解决方案**: 简化的文件操作

```typescript
import { saveFromBlob, saveFromURL, saveFromStream, readFile } from '@cat-kit/fe'

// 从 Blob 保存文件 - 一行代码
const blob = new Blob(['Hello, World!'], { type: 'text/plain' })
saveFromBlob(blob, 'hello.txt')

// 从 URL 下载文件（带进度）
await saveFromURL('/api/report.pdf', 'report.pdf', {
  onProgress: bytes => console.log(`已下载: ${bytes} 字节`)
})

// 流式下载大文件
const response = await fetch('/api/large-file.zip')
await saveFromStream(response.body!, 'large-file.zip', {
  size: Number(response.headers.get('content-length')),
  onProgress: bytes => updateProgressBar(bytes)
})

// 分块读取用户上传的文件
const input = document.querySelector<HTMLInputElement>('input[type=file]')!
input.addEventListener('change', async e => {
  const file = (e.target as HTMLInputElement).files![0]
  await readFile(file, {
    chunkSize: 10 * 1024 * 1024, // 每块 10MB
    onChunk: (chunk, index) => {
      console.log(`读取第 ${index + 1} 块,大小: ${chunk.byteLength}`)
    }
  })
})
```

## 包说明

Cat Kit 采用模块化设计,按需安装所需的包:

### @cat-kit/core

**解决**: 基础工具函数的重复实现问题

**适用场景**: 任何需要数据处理、日期操作、环境检测的项目

[查看详细文档 →](/packages/core/)

### @cat-kit/http

**解决**: 跨环境 HTTP 请求的复杂性和重复代码

**适用场景**: 需要在前后端共享 API 调用逻辑的全栈项目

[查看详细文档 →](/packages/http/)

### @cat-kit/fe

**解决**: 前端环境特有功能的封装缺失

**适用场景**: 浏览器环境的 Web 应用,需要处理文件、存储、Web API

[查看详细文档 →](/packages/fe/)

### @cat-kit/be

**解决**: Node.js 环境工具的整合

**适用场景**: 后端服务、CLI 工具、构建脚本

[查看详细文档 →](/packages/be/)

## 环境要求

### 浏览器

现代浏览器,支持 ES2020+ 特性:

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

### Node.js

- Node.js >= 16

## 下一步

- [安装指南](/guide/installation) - 了解不同场景下的安装方式
- [Core 核心包](/packages/core/) - 深入了解核心工具
- [HTTP 包](/packages/http/) - 学习跨环境的 HTTP 请求
- [FE 前端包](/packages/fe/) - 探索前端专属工具
- [BE 后端包](/packages/be/) - 使用 Node.js 工具
