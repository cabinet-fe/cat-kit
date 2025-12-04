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
