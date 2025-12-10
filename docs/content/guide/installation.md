---
title: 安装
description: Cat Kit 安装指南
outline: deep
---

# 安装

## 选择合适的安装方式

Cat Kit 支持多种安装方式,根据你的项目需求选择最合适的方案。

## 场景 1: 快速开始新项目

**适用**: 刚开始新项目,想快速引入工具包

**推荐**: 使用 bun (最快的包管理器)

```bash
bun add @cat-kit/core
```

**为什么用 bun?**

- 安装速度比 npm 快 20-30 倍
- Cat Kit 本身就是用 bun 开发的,兼容性最好
- 内置 TypeScript 支持,无需额外配置

如果你的团队还在使用其他包管理器:

::: code-group

```bash [pnpm]
pnpm add @cat-kit/core
```

```bash [npm]
npm install @cat-kit/core
```

:::

## 场景 2: 按需安装 - 减小项目体积

**痛点**: 不想引入用不到的功能,保持项目轻量

**解决方案**: 只安装你需要的包

### 只需要基础工具

```bash
# 仅安装核心包 - 数组、对象、字符串、日期等通用工具
npm install @cat-kit/core
```

**适用场景**:
- 后端服务,只需要数据处理
- 工具脚本,不涉及 HTTP 或文件操作
- 需要最小依赖的项目

### 需要发送 HTTP 请求

```bash
# 核心包 + HTTP 客户端
npm install @cat-kit/core @cat-kit/http
```

**适用场景**:
- 全栈项目,需要在前后端共享 API 调用逻辑
- 微服务之间的 HTTP 通信
- 爬虫、数据采集工具

### 浏览器环境的 Web 应用

```bash
# 核心包 + 前端工具
npm install @cat-kit/core @cat-kit/fe
```

**适用场景**:
- React/Vue/Svelte 等前端项目
- 需要处理文件上传下载
- 需要使用 localStorage/IndexedDB/Cookie

### Node.js 环境的后端服务

```bash
# 核心包 + 后端工具
npm install @cat-kit/core @cat-kit/be
```

**适用场景**:
- Express/Koa 等后端框架
- CLI 工具开发
- 构建脚本和自动化任务

### 全栈项目

```bash
# 安装所有包
npm install @cat-kit/core @cat-kit/http @cat-kit/fe @cat-kit/be
```

**适用场景**:
- Next.js/Nuxt.js 等全栈框架
- Monorepo 项目,前后端共享代码
- 同时开发 Web 应用和后端 API

## 场景 3: Monorepo 项目

**痛点**: Monorepo 中多个包需要共享工具函数,希望避免重复安装

**解决方案**: 在根 package.json 中安装,所有子包共享

```json
{
  "workspaces": ["packages/*"],
  "devDependencies": {
    "@cat-kit/core": "^1.0.0",
    "@cat-kit/http": "^1.0.0"
  }
}
```

这样所有子包都可以直接使用:

```typescript
// packages/frontend/src/utils.ts
import { $arr } from '@cat-kit/core'

// packages/backend/src/utils.ts
import { $arr } from '@cat-kit/core' // 使用同一个包
```

## TypeScript 配置

### 场景: 项目没有类型提示

**原因**: TypeScript 配置不当

**解决方案**: 确保 `tsconfig.json` 配置正确

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

**关键配置说明**:

- `target: "ES2020"` - Cat Kit 使用现代 JavaScript 特性
- `moduleResolution: "node"` - 正确解析 node_modules 中的类型
- `strict: true` - 开启严格模式,获得最佳类型检查体验

### 类型导入最佳实践

```typescript
// ✅ 推荐: 类型和值分开导入
import type { HTTPResponse, ClientConfig } from '@cat-kit/http'
import { HTTPClient } from '@cat-kit/http'

// ✅ 也可以: 一起导入
import { HTTPClient, type HTTPResponse } from '@cat-kit/http'
```

## 模块系统

### 场景: 项目使用 CommonJS

**问题**: Cat Kit 只提供 ES 模块

**解决方案**: 迁移到 ES 模块或使用动态导入

```javascript
// ❌ 不支持: CommonJS
const { $arr } = require('@cat-kit/core')

// ✅ 方案 1: 改用 ES 模块
import { $arr } from '@cat-kit/core'

// ✅ 方案 2: 动态导入 (Node.js 环境)
const { $arr } = await import('@cat-kit/core')
```

**为什么不支持 CommonJS?**

- ES 模块是现代标准,支持 tree-shaking,减小打包体积
- 浏览器原生支持 ES 模块
- Node.js 已全面支持 ES 模块

### 在 Node.js 中启用 ES 模块

在 `package.json` 中添加:

```json
{
  "type": "module"
}
```

## 系统要求

### 为什么需要这些版本?

Cat Kit 使用现代 JavaScript 特性来保证代码简洁和性能:

**浏览器要求**:
- Chrome >= 90 (2021 年 4 月)
- Firefox >= 88 (2021 年 4 月)
- Safari >= 14 (2020 年 9 月)
- Edge >= 90 (2021 年 4 月)

这些版本支持:
- ES2020+ 语法
- 原生 ES 模块
- Promise、async/await
- Optional chaining、Nullish coalescing

**Node.js 要求**:
- Node.js >= 16 (LTS)

这个版本支持:
- 稳定的 ES 模块系统
- 现代 JavaScript 特性
- 良好的性能

### 如何检查当前版本

```bash
# 检查 Node.js 版本
node --version

# 检查包管理器版本
npm --version
pnpm --version
bun --version
```

## 常见问题

### Q: 为什么没有 CDN 版本?

A: Cat Kit 设计用于构建工具链(Vite、Webpack 等),通过 tree-shaking 只打包使用的代码。CDN 版本会包含全部代码,体积较大。

如果你确实需要在浏览器直接引入,可以使用 ESM CDN:

```html
<script type="module">
  import { $arr } from 'https://esm.sh/@cat-kit/core'
  console.log($arr.unique([1, 2, 2, 3]))
</script>
```

### Q: 安装后导入报错怎么办?

**常见原因**:

1. **TypeScript 配置问题** - 检查 `tsconfig.json` 中的 `moduleResolution`
2. **Node.js 版本过低** - 升级到 Node.js 16+
3. **使用 CommonJS** - 改用 ES 模块或动态导入

### Q: 可以只安装某个工具函数吗?

A: Cat Kit 的包已经很轻量,且支持 tree-shaking。打包时只会包含你使用的代码:

```typescript
// 只导入一个函数
import { $arr } from '@cat-kit/core'
$arr.unique([1, 2, 2, 3])

// 最终打包时只会包含 $arr.unique 的代码
```

## 验证安装

安装完成后,创建一个测试文件验证:

```typescript
// test.ts
import { $arr, $str, $date } from '@cat-kit/core'

console.log($arr.unique([1, 2, 2, 3])) // [1, 2, 3]
console.log($str.capitalize('hello')) // 'Hello'
console.log($date.format(new Date(), 'YYYY-MM-DD'))
```

运行测试:

```bash
# 如果使用 bun
bun test.ts

# 如果使用 Node.js + tsx
npx tsx test.ts
```

## 下一步

- [快速开始](/guide/getting-started) - 了解使用场景和示例
- [Core 核心包](/packages/core/) - 学习核心工具
- [HTTP 包](/packages/http/) - 掌握 HTTP 客户端
