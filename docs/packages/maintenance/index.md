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
# import 语句被保留,不打包 peerDependencies
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

**默认行为** (来源: [tsdown Dependencies](https://tsdown.dev/options/dependencies)):

- `peerDependencies` 自动视为 external,不会被打包
- `devDependencies` 只在被实际导入时才会打包
- 类型声明文件(.d.ts)中,默认不打包任何依赖

### package.json 中的依赖类型

在库开发中,正确使用三种依赖类型非常重要。

#### dependencies

**定义**: 库运行时必须的依赖,会随库一起安装。

**在库构建中**:
- 默认情况下**会被打包**到产物中(除非配置为 external)
- 使用方安装你的库时,这些依赖会自动安装
- 适合小型、专用的工具库

**示例**:
```json
{
  "name": "@cat-kit/maintenance",
  "dependencies": {
    "picocolors": "^1.1.1",      // 小型工具,打包进产物
    "tsdown": "^0.17.0"           // 库运行时需要
  }
}
```

#### devDependencies

**定义**: 仅在开发、测试、构建阶段需要的依赖。

**在库构建中**:
- **不会被打包**到产物中
- 发布库后,使用方**不会**安装这些依赖
- 即使在代码中 import,也只会在被实际导入时打包

**示例**:
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",      // 构建工具
    "vitest": "^1.0.0",          // 测试框架
    "@types/node": "^20.0.0"     // 类型定义
  }
}
```

**Monorepo 特殊用法**:

在 monorepo 中,内部包依赖也放在 `devDependencies`:

```json
{
  "name": "@cat-kit/fe",
  "devDependencies": {
    "@cat-kit/core": "workspace:*"  // 开发时使用工作区版本
  },
  "peerDependencies": {
    "@cat-kit/core": ">=1.0.0"      // 声明对外的依赖要求
  }
}
```

#### peerDependencies

**定义**: 要求使用方安装的依赖,用于声明"我的库需要与某个包配合使用"。

**在库构建中** (来源: [tsdown Dependencies](https://tsdown.dev/options/dependencies)):
- **tsdown 自动将 peerDependencies 视为 external**
- 不会被打包,保留 import 语句
- 避免重复安装大型库(如 React、Vue)

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

**为什么使用 peerDependencies?**

假设你开发了一个 React 组件库:

```
❌ 使用 dependencies:
用户项目:
  └─ react 18.2.0
  └─ your-lib
      └─ react 18.2.0 (重复!)
结果: 两份 React,可能导致 Hook 错误

✅ 使用 peerDependencies:
用户项目:
  └─ react 18.2.0 (共享)
  └─ your-lib (使用用户的 react)
结果: 只有一份 React,正常工作
```

### 构建配置中的 external 字段

`external` 字段告诉构建工具**哪些导入应该保留,不打包进产物**。

#### 作用原理

```typescript
// 源代码 src/index.ts
import { someUtil } from '@my-org/core'
import colors from 'picocolors'

export function log(msg: string) {
  console.log(colors.blue(someUtil(msg)))
}
```

**配置 external: ['@my-org/core']**:

```javascript
// 产物 dist/index.js
import { someUtil } from '@my-org/core'  // ← 保留导入
// picocolors 的代码被打包进来了
const colors = { blue: (str) => `\x1b[34m${str}\x1b[0m` }

export function log(msg) {
  console.log(colors.blue(someUtil(msg)))
}
```

#### tsdown 的 external 配置

参考 [tsdown external 配置](https://tsdown.dev/options/dependencies):

```typescript
import { defineConfig } from 'tsdown'

export default defineConfig({
  // 标记为外部依赖,不打包
  external: [
    '@my-org/core',
    'react',
    'react/jsx-runtime'
  ],

  // 强制打包(即使在 peerDependencies 中)
  noExternal: ['some-package'],

  // 跳过所有 node_modules 的打包
  skipNodeModulesBundle: true
})
```

#### 何时使用 external

**必须 external**:
1. **peerDependencies** - tsdown 自动处理,但也可显式配置
2. **Monorepo 内部包** - 避免重复打包,保持独立性
3. **Node.js 内置模块** - 如 `fs`、`path`、`http`

**建议 external**:
1. **大型库** - React、Vue、Lodash 等,让使用方管理版本
2. **插件系统** - 如果你的库是某个系统的插件

**可以打包**:
1. **小型工具库** - 如 `picocolors`、`clsx`(几 KB)
2. **专用依赖** - 只有你的库使用,不太可能重复安装

### Monorepo 库构建最佳实践

基于本项目的实际配置:

#### 1. package.json 配置

```json
{
  "name": "@cat-kit/fe",
  "dependencies": {
    // 空 - 不依赖外部运行时包
  },
  "devDependencies": {
    "@cat-kit/core": "workspace:*"  // 开发时引用
  },
  "peerDependencies": {
    "@cat-kit/core": ">=1.0.0-alpha.1"  // 声明给使用方
  }
}
```

#### 2. 构建配置

```typescript
{
  dir: '/path/to/packages/fe',
  build: {
    input: 'src/index.ts',
    external: ['@cat-kit/core']  // 不打包内部依赖
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

- ✅ Monorepo 内部依赖在 `peerDependencies` 中声明
- ✅ Monorepo 内部依赖在 `devDependencies` 中引用(`workspace:*`)
- ✅ 构建配置的 `external` 包含所有内部依赖
- ✅ `dependencies` 只包含要打包进产物的小型库
- ✅ 大型第三方库(如框架)在 `peerDependencies` 中
- ✅ 构建工具、测试工具在 `devDependencies` 中

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
