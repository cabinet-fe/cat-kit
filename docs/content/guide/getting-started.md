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

Cat Kit 提供了一套**轻量、类型安全、跨环境**的工具包,让你专注业务���辑而非重复劳动:

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

**痛点**: 每次需要分组、去重、分块时都要写循环逻辑

**解决方案**: 使用 `@cat-kit/core` 的数组工具

```typescript
import { $arr } from '@cat-kit/core'

// 数据分块 - 比如实现分页展示
const items = Array.from({ length: 100 }, (_, i) => i)
const pages = $arr.chunk(items, 10) // 每页 10 条

// 数组去重 - 处理重复数据
const userIds = [1, 2, 2, 3, 3, 3]
const uniqueIds = $arr.unique(userIds) // [1, 2, 3]

// 分组 - 按类别整理数据
const products = [
  { category: 'book', name: 'TypeScript' },
  { category: 'book', name: 'JavaScript' },
  { category: 'food', name: 'Apple' }
]
const grouped = $arr.groupBy(products, 'category')
// { book: [...], food: [...] }
```

### 场景 2: 统一的日期处理

**痛点**: 原生 Date API 不够直观,需要大量的计算和格式化逻辑

**解决方案**: 使用简洁的日期工具

```typescript
import { $date } from '@cat-kit/core'

// 格式化日期 - 无需记忆复杂的 Date API
const now = new Date()
$date.format(now, 'YYYY-MM-DD HH:mm:ss') // '2025-12-10 14:30:00'

// 日期计算 - 比如计算活动结束时间
const endDate = $date.add(now, 7, 'day') // 7 天后

// 日期比较 - 判断是否过期
const isExpired = $date.isBefore(endDate, new Date())
```

### 场景 3: 跨环境的 HTTP 请求

**痛点**: 浏览器用 fetch,Node.js 用不同的库,无法复用代码

**解决方案**: 使用统一的 HTTP 客户端

```typescript
import { HTTPClient } from '@cat-kit/http'

// 创建客户端 - 浏览器和 Node.js 都能用
const api = new HTTPClient('/api', {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 发送请求 - 自动处理错误、超时、重试
const users = await api.get('/users')

// 使用插件系统 - 自动添加 token
api.use(async (context, next) => {
  const token = getToken()
  context.request.headers.set('Authorization', `Bearer ${token}`)
  await next()
})
```

### 场景 4: 前端存储管理

**痛点**: localStorage、sessionStorage、Cookie、IndexedDB API 各不相同,使用繁琐

**解决方案**: 统一的存储接口

```typescript
import { createStorage } from '@cat-kit/fe'

// 创建类型安全的存储
interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
}

const storage = createStorage<UserPreferences>('local', 'user-prefs')

// 读写数据 - 自动序列化/反序列化
await storage.set('theme', 'dark')
const theme = await storage.get('theme') // 类型: 'light' | 'dark'

// 同样的 API 可用于 sessionStorage、IndexedDB、Cookie
const session = createStorage('session', 'temp-data')
const db = createStorage('indexedDB', 'large-data')
```

### 场景 5: 文件下载和处理

**痛点**: 浏览器下载文件需要创建临时 `<a>` 元素,代码冗长

**解决方案**: 简化的文件操作

```typescript
import { saveAs, readFile } from '@cat-kit/fe'

// 下载文件 - 一行代码
const blob = await fetch('/api/report').then(r => r.blob())
saveAs(blob, 'report.pdf')

// 读取用户上传的文件
const input = document.querySelector('input[type=file]')
input.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  const content = await readFile(file, 'text') // 支持 text、base64、arrayBuffer
  console.log(content)
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
