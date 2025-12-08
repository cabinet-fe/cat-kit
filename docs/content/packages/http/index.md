---
title: HTTP 请求包
description: '@cat-kit/http 是一个符合人体工学的跨端 HTTP 请求客户端'
outline: deep
---

# HTTP 请求包

## 概述

`@cat-kit/http` 提供了一个跨平台的 HTTP 请求客户端，支持浏览器环境。

**主要特性：**

- ✅ 支持浏览器环境
- ✅ 插件系统
- ✅ TypeScript 类型支持
- ✅ 请求分组管理
- ✅ 多引擎支持（Fetch API 和 XMLHttpRequest）
- ✅ 自动处理查询参数
- ✅ 请求和响应拦截

## 安装

::: code-group

```bash [npm]
npm install @cat-kit/http
```

```bash [yarn]
yarn add @cat-kit/http
```

```bash [pnpm]
pnpm add @cat-kit/http
```

:::

## 快速开始

### 基础用法

```typescript
import { HTTPClient } from '@cat-kit/http'

// 创建客户端实例
const http = new HTTPClient('', {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 发送 GET 请求
const response = await http.get('/api/users')
console.log(response.data)

// 发送 POST 请求
const createResponse = await http.post('/api/users', {
  name: '张三',
  age: 18
})
```

### 使用请求前缀

```typescript
// 创建带前缀的客户端
const api = new HTTPClient('/api', {
  headers: {
    'Content-Type': 'application/json'
  }
})

// 实际请求地址为 /api/users
await api.get('/users')
```

## 核心概念

### 请求生命周期

HTTP 请求的完整生命周期如下：

1. **创建请求** - 调用请求方法（get、post 等）
2. **URL 处理** - 拼接前缀、处理查询参数
3. **配置合并** - 合并全局配置和请求配置
4. **插件前置钩子** - 执行 `beforeRequest` 钩子
5. **发送请求** - 通过引擎发送实际请求
6. **插件后置钩子** - 执行 `afterRespond` 钩子
7. **返回响应** - 返回最终响应对象

### 引擎系统

HTTP 包支持两种请求引擎：

- **FetchEngine** - 基于 Fetch API，现代浏览器默认使用
- **XHREngine** - 基于 XMLHttpRequest，用于不支持 Fetch 的环境

引擎会自动根据环境选择，无需手动配置。

## 下一步

- [HTTP 客户端](/packages/http/client) - 了解详细的 API
- [插件系统](/packages/http/plugins) - 学习如何使用和编写插件
- [类型定义](/packages/http/types) - 查看完整的类型定义
