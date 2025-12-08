---
title: 快速开始
description: 快速开始使用 Cat Kit
outline: deep
---

# 快速开始

Cat Kit 是一个基于 TypeScript 的全环境开发工具包，提供了一系列实用的工具函数和类库。

## 安装

### 使用包管理器

::: code-group

```bash [bun]
bun add @cat-kit/core
bun add @cat-kit/http
bun add @cat-kit/fe
bun add @cat-kit/be
```

```bash [npm]
# 安装核心包
npm install @cat-kit/core

# 安装 HTTP 包
npm install @cat-kit/http

# 安装前端工具包
npm install @cat-kit/fe

# 安装后端工具包
npm install @cat-kit/be
```

```bash [pnpm]
pnpm add @cat-kit/core
pnpm add @cat-kit/http
pnpm add @cat-kit/fe
pnpm add @cat-kit/be
```

:::

### 从源码安装

```bash
git clone https://github.com/cabinet-fe/cat-kit.git
cd cat-kit
pnpm install
pnpm build
```

## 基础使用

### Core 核心包

核心包提供了基础的数据处理、日期处理、环境检测等功能。

```typescript
import { $arr, $str, $date, isInBrowser } from '@cat-kit/core'

// 数组操作
const arr = [1, 2, 3, 4, 5]
const chunks = $arr.chunk(arr, 2) // [[1, 2], [3, 4], [5]]

// 字符串操作
const url = $str.joinUrlPath('/api', 'users', '123') // '/api/users/123'

// 日期处理
const formatted = $date.format(new Date(), 'YYYY-MM-DD') // '2025-11-17'

// 环境检测
if (isInBrowser()) {
  console.log('运行在浏览器环境')
}
```

### HTTP 包

HTTP 包提供了一个功能完整的 HTTP 请求客户端。

```typescript
import { HTTPClient } from '@cat-kit/http'

// 创建客户端
const http = new HTTPClient('/api', {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 发送请求
const response = await http.get('/users')
console.log(response.data)

// POST 请求
const createResponse = await http.post('/users', {
  name: '张三',
  age: 18
})
```

### FE 前端包

前端包提供了文件操作、存储、Web API 封装等功能。

```typescript
import { saveAs, readFile } from '@cat-kit/fe'

// 下载文件
saveAs(blob, 'filename.pdf')

// 读取文件
const content = await readFile(file)
```

### BE 后端包

后端包提供了 Node.js 环境下的工具函数。

```typescript
import /* 后端工具 */ '@cat-kit/be'

// 后端相关功能
```

## 包说明

### @cat-kit/core

核心功能包，提供：

- **数据处理** - 数组、对象、字符串、数字等的操作函数
- **数据结构** - 树、森林等数据结构
- **日期处理** - 日期格式化、计算等
- **环境检测** - 浏览器、Node.js 环境判断
- **性能优化** - 并行处理、安全执行、定时器等
- **设计模式** - 观察者模式等

[查看详细文档 →](/packages/core/)

### @cat-kit/http

HTTP 请求客户端，提供：

- **跨平台支持** - 支持浏览器环境
- **插件系统** - 灵活的扩展机制
- **请求分组** - 方便的 API 组织
- **TypeScript** - 完整的类型定义

[查看详细文档 →](/packages/http/)

### @cat-kit/fe

前端工具包，提供：

- **文件操作** - 文件读取、保存
- **存储** - localStorage、sessionStorage、IndexedDB、Cookie 封装
- **虚拟化** - 虚拟列表等
- **Web API** - 剪贴板、权限等 API 封装

[查看详细文档 →](/packages/fe/)

### @cat-kit/be

后端工具包，提供 Node.js 环境下的实用功能。

[查看详细文档 →](/packages/be/)

## TypeScript 支持

所有包都使用 TypeScript 编写，提供完整的类型定义。

```typescript
import type { HTTPResponse } from '@cat-kit/http'

interface User {
  id: number
  name: string
  email: string
}

const response: HTTPResponse<User> = await http.get('/user/123')
// response.data 的类型为 User
```

## 浏览器兼容性

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## Node.js 兼容性

- Node.js >= 16

## 下一步

- [安装指南](/guide/installation) - 详细的安装说明
- [Core 核心包](/packages/core/) - 核心功能文档
- [HTTP 包](/packages/http/) - HTTP 客户端文档
- [FE 前端包](/packages/fe/) - 前端工具文档
- [BE 后端包](/packages/be/) - 后端工具文档
