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

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0 或 pnpm >= 6.0.0

## 包管理器

Cat Kit 支持所有主流的 Node.js 包管理器。

### npm

```bash
npm install @cat-kit/core
npm install @cat-kit/http
npm install @cat-kit/fe
npm install @cat-kit/be
```

### yarn

```bash
yarn add @cat-kit/core
yarn add @cat-kit/http
yarn add @cat-kit/fe
yarn add @cat-kit/be
```

### pnpm

```bash
pnpm add @cat-kit/core
pnpm add @cat-kit/http
pnpm add @cat-kit/fe
pnpm add @cat-kit/be
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

推荐使用 ES 模块：

```typescript
import { HTTPClient } from '@cat-kit/http'
import { $arr, $str } from '@cat-kit/core'
```

### CommonJS

也支持 CommonJS：

```javascript
const { HTTPClient } = require('@cat-kit/http')
const { $arr, $str } = require('@cat-kit/core')
```

## 构建工具集成

### Vite

Vite 开箱即用，无需额外配置。

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // Cat Kit 开箱即用
})
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
}
```

### Rollup

```javascript
// rollup.config.js
import typescript from '@rollup/plugin-typescript'

export default {
  plugins: [typescript()]
}
```

## CDN 使用

::: warning
目前不提供 CDN 版本，请使用 npm 安装。
:::

## 开发环境设置

### 编辑器配置

推荐使用 VS Code，并安装以下扩展：

- [TypeScript](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### VS Code 设置

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 验证安装

创建一个测试文件验证安装是否成功：

```typescript
// test.ts
import { HTTPClient } from '@cat-kit/http'
import { $arr, $str, isInBrowser } from '@cat-kit/core'

console.log('环境检测:', isInBrowser() ? '浏览器' : 'Node.js')
console.log('数组操作:', $arr.chunk([1, 2, 3, 4], 2))
console.log('字符串操作:', $str.joinUrlPath('/api', 'users'))

const http = new HTTPClient()
console.log('HTTP 客户端创建成功')
```

运行测试：

```bash
# 使用 ts-node
npx ts-node test.ts

# 或先编译再运行
npx tsc test.ts && node test.js
```

## 常见问题

### 类型定义找不到

确保安装了完整的包和类型定义：

```bash
npm install --save @cat-kit/core @cat-kit/http
```

### 模块解析错误

检查 `tsconfig.json` 中的 `moduleResolution` 设置：

```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

### 浏览器环境报错

确保在浏览器环境中使用：

```typescript
import { isInBrowser } from '@cat-kit/core'

if (!isInBrowser()) {
  throw new Error('此功能仅在浏览器环境可用')
}
```

### Vite 开发服务器警告

某些警告可以忽略，或在 `vite.config.ts` 中配置：

```typescript
export default defineConfig({
  optimizeDeps: {
    include: ['@cat-kit/core', '@cat-kit/http']
  }
})
```

## 更新

### 检查更新

```bash
npm outdated @cat-kit/core @cat-kit/http
```

### 更新到最新版本

```bash
npm update @cat-kit/core @cat-kit/http
```

### 更新到特定版本

```bash
npm install @cat-kit/core@1.0.0 @cat-kit/http@1.0.0
```

## 卸载

```bash
npm uninstall @cat-kit/core @cat-kit/http @cat-kit/fe @cat-kit/be
```

## 下一步

- [快速开始](/guide/getting-started) - 开始使用 Cat Kit
- [Core 核心包](/packages/core/) - 核心功能文档
- [HTTP 包](/packages/http/) - HTTP 客户端文档
