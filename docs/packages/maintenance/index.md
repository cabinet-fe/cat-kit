---
title: Maintenance 维护包
sidebarTitle: 概览
order: -1
---

# Maintenance 维护包

`@cat-kit/maintenance` 是 Cat-Kit 的 monorepo 维护工具包，提供依赖管理、版本管理和打包构建等功能。

## 特性

- 🔍 **依赖分析** - 检测循环依赖、版本不一致等问题
- 📊 **依赖可视化** - 生成 Mermaid 格式的依赖关系图
- 🔢 **版本管理** - 符合 semver 规范的版本解析、比较和递增
- 📦 **批量构建** - 按依赖关系分批并行构建 monorepo 中的包

## 安装

::: code-group

```bash [bun]
bun add @cat-kit/maintenance -D
```

```bash [pnpm]
pnpm add @cat-kit/maintenance -D
```

```bash [npm]
npm install @cat-kit/maintenance -D
```

:::

## 前置知识

在使用构建工具之前,了解以下概念将帮助你更好地理解库构建的配置和最佳实践。

### package.json 中的依赖类型

#### 为什么要区分三种依赖类型?

npm 将依赖分为 `dependencies`、`devDependencies` 和 `peerDependencies` 三种类型,这种设计并非随意的,而是为了解决以下核心问题:

1. **安装时机问题**: 哪些包需要在生产环境安装?哪些只在开发时需要?
2. **版本冲突问题**: 如何避免同一个库被安装多次导致的问题?
3. **包体积问题**: 如何让使用方只安装必需的依赖?

对于**应用开发者**来说,这三种依赖的区别主要体现在安装行为上。但对于**库开发者**来说,这三种依赖直接决定了打包工具的行为 - 哪些代码会被打包进产物,哪些会保留为外部引用。

#### dependencies

**定义**: 项目运行时必须的依赖。

**安装行为**:
- 运行 `npm install` 时会被安装
- 当其他项目安装你的库时,这些依赖**也会被自动安装**

**适用场景**:
- 库在运行时直接使用的外部包
- 你希望使用方无需额外安装即可使用的功能依赖

**示例**:
```json
{
  "name": "my-date-lib",
  "dependencies": {
    "dayjs": "^1.11.0"  // 库在运行时需要 dayjs
  }
}
```

#### devDependencies

**定义**: 仅在开发、测试、构建阶段需要的依赖。

**安装行为**:
- 运行 `npm install` 时会被安装
- 当其他项目安装你的库时,这些依赖**不会被安装**

**适用场景**:
- 构建工具(如 TypeScript、tsdown、rollup)
- 测试框架(如 vitest、jest)
- 类型定义(如 @types/*)
- 开发时使用的辅助工具

**示例**:
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",      // 仅构建时需要
    "vitest": "^1.0.0",          // 仅测试时需要
    "@types/node": "^20.0.0"     // 仅类型检查时需要
  }
}
```

#### peerDependencies

**定义**: 声明"我的库需要与某个包配合使用",但由使用方负责安装。

**安装行为**:
- 运行 `npm install` 时**不会自动安装**(npm 7+ 会自动安装,但可配置)
- 包管理器会检查使用方是否已安装兼容版本,若未安装则发出警告

**适用场景**:
- 框架插件(如 React 组件库依赖 react)
- 需要与宿主项目共享同一实例的库
- 避免依赖重复安装导致的问题

**为什么需要 peerDependencies?**

假设你开发了一个 React 组件库:

```
❌ 使用 dependencies:
用户项目:
  └─ react 18.2.0
  └─ your-lib
      └─ react 18.2.0 (重复!)
结果: 两份 React 实例,可能导致 Hook 错误

✅ 使用 peerDependencies:
用户项目:
  └─ react 18.2.0 (共享)
  └─ your-lib (使用用户的 react)
结果: 只有一份 React 实例,正常工作
```

**示例**:
```json
{
  "name": "@my-org/react-components",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### 库构建 vs 应用构建

理解库构建和应用构建的本质区别,有助于你正确配置依赖和 external 选项。

#### 应用构建 (Application Bundling)

**目标**: 生成可直接运行的代码,开箱即用

**特点**:
- 所有依赖都被打包进最终产物(bundle)
- 输出通常是单个或少量 JS 文件
- 用户无需再安装任何依赖
- 典型工具: Webpack、Vite(应用模式)、Parcel

**示例场景**:
```bash
# 构建 Vue/React 应用
npm run build
# 输出: dist/index.html, dist/assets/index-abc123.js
# 所有 node_modules 中的代码都被打包进 index-abc123.js
```

#### 库构建 (Library Bundling)

**目标**: 生成可被其他项目引用的库代码,保持灵活性

**特点**:
- **不打包所有依赖**,而是保留 `import` 语句
- 让使用方决定如何处理依赖(tree-shaking、版本管理)
- 输出 ES Module 格式,支持 tree-shaking
- 生成 TypeScript 类型声明文件(.d.ts)
- 典型工具: tsdown、tsup、Rollup

**示例场景**:
```bash
# 构建库
tsdown
# 输出: dist/index.js, dist/index.d.ts
# import 语句被保留,不打包外部依赖
```

**库构建的产物示例**:
```javascript
// dist/index.js - 库的产物
import { format } from 'date-fns'  // ← 保留导入,不打包
import { myUtil } from '@my-org/core'  // ← 保留导入

export function formatDate(date) {
  return format(date, 'yyyy-MM-dd')
}
```

**为什么不打包所有依赖?**

参考 [How to bundle your library and why](https://tobias-barth.net/blog/How-to-bundle-your-library-and-why):

> 如果库把所有模块都打包成一个 blob,会破坏 tree-shaking 的效果。最终应用的打包工具无法区分哪些代码被使用,只能全部引入。

### tsdown: 专为库构建设计

`MonoRepoBundler` 基于 [tsdown](https://tsdown.dev/) 构建,这是一个专为库作者设计的优雅打包工具。

**tsdown 的核心特性** (来源: [tsdown 官方文档](https://tsdown.dev/guide/)):

- ⚡ **极速构建** - 基于 Rolldown(Rust 编写)和 Oxc
- 📦 **开箱即用** - 零配置即可使用,提供库开发的最佳实践默认值
- 🔤 **类型声明** - 自动生成 TypeScript 类型声明文件
- 📤 **多种输出格式** - 支持 ES Module、CommonJS 等
- 🔌 **插件生态** - 兼容 Rolldown 和大部分 Rollup 插件

#### tsdown 中的依赖处理

在库构建场景下,tsdown 对三种依赖类型有特定的默认处理方式 (来源: [tsdown Dependencies](https://tsdown.dev/zh-CN/options/dependencies)):

| 依赖类型 | 默认行为 | 说明 |
|---------|---------|------|
| **dependencies** | 不打包(external) | 被视为外部依赖,保留 import 语句 |
| **peerDependencies** | 不打包(external) | 被视为外部依赖,保留 import 语句 |
| **devDependencies** | 按需打包 | 只有在源码中实际被 import 时才会打包 |

::: tip 幻影依赖 (Phantom Dependencies)
存在于 `node_modules` 中但未在 `package.json` 中声明的依赖,tsdown 只会在实际使用时才将其打包。这可以帮助发现未声明的依赖问题。
:::

**示例**:

假设 `package.json` 如下:
```json
{
  "dependencies": {
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "lodash-es": "^4.17.21"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

源代码:
```typescript
import dayjs from 'dayjs'        // dependencies → 不打包
import { merge } from 'lodash-es' // devDependencies 且实际使用 → 打包
import React from 'react'        // peerDependencies → 不打包
```

构建产物:
```javascript
// dist/index.js
import dayjs from 'dayjs'        // ← 保留
// lodash-es 的 merge 函数代码被打包进来了
import React from 'react'        // ← 保留
```

### 构建配置中的 external 字段

`external` 字段告诉构建工具**哪些导入应该保留,不打包进产物**。

由于 tsdown 默认将 `dependencies` 和 `peerDependencies` 视为 external,大多数情况下你无需手动配置。但在以下场景中可能需要调整:

#### 何时需要手动配置 external

**使用 `noExternal` 强制打包**:

当你希望将某个 `dependencies` 中的小型工具库打包进产物时:

```typescript
import { defineConfig } from 'tsdown'

export default defineConfig({
  // 强制打包这些依赖(即使在 dependencies/peerDependencies 中)
  noExternal: ['picocolors', 'clsx']
})
```

**使用 `external` 排除额外的包**:

当你需要排除一些 `devDependencies` 中被实际引用的包时:

```typescript
import { defineConfig } from 'tsdown'

export default defineConfig({
  external: [
    '@my-org/core',      // 排除 monorepo 内部包
    'react/jsx-runtime'  // 排除子路径导入
  ]
})
```

#### 配置选项总结

参考 [tsdown external 配置](https://tsdown.dev/zh-CN/options/dependencies):

```typescript
import { defineConfig } from 'tsdown'

export default defineConfig({
  // 额外标记为外部依赖
  external: ['@my-org/core'],

  // 强制打包(覆盖默认的 external 行为)
  noExternal: ['picocolors'],

  // 跳过所有 node_modules 的打包
  skipNodeModulesBundle: true
})
```

#### 打包决策参考

| 场景 | 建议 | 原因 |
|-----|------|------|
| React/Vue 等框架 | peerDependencies | 避免重复实例 |
| Monorepo 内部包 | peerDependencies + external | 保持独立性 |
| 小型工具库(< 10KB) | noExternal 打包 | 减少使用方安装负担 |
| 大型工具库(lodash 等) | dependencies(默认 external) | 让使用方管理版本 |
| 仅类型依赖 | devDependencies | 运行时不需要 |

### Monorepo 库构建最佳实践

基于本项目的实际配置:

#### 1. package.json 配置

```json
{
  "name": "@cat-kit/fe",
  "dependencies": {
    // 运行时依赖 - tsdown 默认不打包,保留 import
  },
  "devDependencies": {
    "@cat-kit/core": "workspace:*"  // 开发时引用工作区版本
  },
  "peerDependencies": {
    "@cat-kit/core": ">=1.0.0-alpha.1"  // 声明给使用方
  }
}
```

::: tip 为什么内部依赖同时在 devDependencies 和 peerDependencies 中?
- `devDependencies` + `workspace:*`: 让开发时能正确解析到本地工作区的包
- `peerDependencies`: 发布后,声明使用方需要安装的版本要求

这是 Monorepo 中处理内部依赖的标准模式。
:::

#### 2. 构建配置

由于 `@cat-kit/core` 在 `devDependencies` 中且被实际导入,tsdown 默认会打包它。需要显式配置 `external`:

```typescript
{
  dir: '/path/to/packages/fe',
  build: {
    input: 'src/index.ts',
    external: ['@cat-kit/core']  // 显式排除内部依赖
  }
}
```

#### 3. 依赖关系图示

```
@cat-kit/core (基础库)
    ↑
    ├── @cat-kit/fe (peerDep: core, external: core)
    ├── @cat-kit/http (peerDep: core, external: core)
    └── @cat-kit/be (peerDep: core, external: core)
```

#### 4. 构建产物

```javascript
// @cat-kit/fe/dist/index.js
import { someUtil } from '@cat-kit/core'  // ← 保留,不打包

export function myFeature() {
  return someUtil()
}
```

### 配置检查清单

- ✅ Monorepo 内部依赖在 `peerDependencies` 中声明(供发布后使用)
- ✅ Monorepo 内部依赖在 `devDependencies` 中引用(`workspace:*`,供开发时使用)
- ✅ 构建配置的 `external` 显式包含 Monorepo 内部依赖
- ✅ 运行时外部依赖放在 `dependencies` 中(tsdown 默认不打包)
- ✅ 框架依赖(React/Vue 等)放在 `peerDependencies` 中
- ✅ 构建工具、测试工具放在 `devDependencies` 中
- ✅ 需要打包进产物的小型工具库,使用 `noExternal` 配置

## 功能模块

### [依赖管理](./deps)

分析和管理 monorepo 中的依赖关系：

- `checkCircularDependencies()` - 检测循环依赖
- `checkVersionConsistency()` - 检查版本一致性
- `buildDependencyGraph()` - 构建依赖关系图
- `visualizeDependencyGraph()` - 生成 Mermaid 依赖图

### [版本管理](./version)

语义化版本管理功能：

- `parseSemver()` / `compareSemver()` - 解析和比较版本号
- `incrementVersion()` - 递增版本号
- `bumpVersion()` - 批量更新包版本
- `syncPeerDependencies()` - 同步 peerDependencies

### [打包器](./bundler)

Monorepo 构建打包工具：

- `MonoRepoBundler` - 按依赖关系分批并行构建
- 基于 tsdown，支持 TypeScript 和类型声明生成
- 自动生成 Bundle 分析报告

## 快速示例

```typescript
import {
  MonoRepoBundler,
  checkCircularDependencies,
  bumpVersion
} from '@cat-kit/maintenance'

// 检查循环依赖
const circular = await checkCircularDependencies({
  rootDir: '/path/to/monorepo'
})

// 批量更新版本
await bumpVersion(
  { rootDir: '/path/to/monorepo' },
  { type: 'minor', syncPeer: true }
)

// 构建 monorepo 包
const bundler = new MonoRepoBundler([
  { dir: '/path/to/packages/core', build: { input: 'src/index.ts' } }
])
await bundler.build()
```
