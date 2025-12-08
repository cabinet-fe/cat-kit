---
title: 安装
description: Cat Kit 安装指南
outline: deep
---

# 安装

本指南将帮助你安装和配置 Cat Kit。

## 系统要求

### 浏览器环境

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

### Node.js 环境

- Node.js >= 20.0.0
- Bun >= 1.0.0

## 包管理器

Cat Kit 推荐下面的包管理器。

### bun

```bash
bun i @cat-kit/core
```

### pnpm

```bash
pnpm add @cat-kit/core
```

### npm

```bash
npm i @cat-kit/core
```

## 按需安装

你可以根据项目需要只安装特定的包。

### 仅安装核心包

```bash
npm install @cat-kit/core
```

核心包提供了基础的数据处理功能，不依赖其他包。

### 安装 HTTP 包

```bash
npm install @cat-kit/core @cat-kit/http
```

HTTP 包依赖核心包，需要同时安装。

### 安装前端包

```bash
npm install @cat-kit/core @cat-kit/fe
```

前端包依赖核心包，用于浏览器环境。

### 安装后端包

```bash
npm install @cat-kit/core @cat-kit/be
```

后端包依赖核心包，用于 Node.js 环境。

## TypeScript 配置

Cat Kit 完全使用 TypeScript 编写，包含完整的类型定义。

### tsconfig.json

确保你的 `tsconfig.json` 包含以下配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

### 类型导入

```typescript
// 导入类型
import type { HTTPResponse, ClientConfig } from '@cat-kit/http'

// 导入值
import { HTTPClient } from '@cat-kit/http'
```

## 模块系统

### ES Modules

cat-kit 只提供了 ES 模块：

```typescript
import { HTTPClient } from '@cat-kit/http'
import { $arr, $str } from '@cat-kit/core'
```

## CDN 使用

::: warning
目前不提供 CDN 版本，请使用 npm 安装。
:::

## 下一步

- [快速开始](/guide/getting-started) - 开始使用 Cat Kit
- [Core 核心包](/packages/core/) - 核心功能文档
- [HTTP 包](/packages/http/) - HTTP 客户端文档
