---
title: 维护工具包
description: '@cat-kit/maintenance 是 Cat-Kit 的 monorepo 维护工具包'
outline: deep
---

# Maintenance 维护工具包

`@cat-kit/maintenance` 是 Cat-Kit 的 monorepo 维护工具包，提供依赖管理、版本控制、构建和发布的完整解决方案。

## 特性

- 🔍 **依赖分析** - 检测循环依赖、版本不一致等问题
- 📊 **依赖可视化** - 生成 Mermaid 格式的依赖关系图
- 🔢 **版本管理** - 符合 semver 规范的版本解析、比较和递增
- 📦 **Monorepo 管理** - 统一管理工作区，按依赖关系分批并行构建
- 🚀 **发布辅助** - git 提交/tag/push 与 npm publish

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

## 快速开始

### 基本用法

```typescript
import { Monorepo } from '@cat-kit/maintenance'

const repo = new Monorepo()

// 验证 monorepo
const validation = repo.validate()
if (!validation.valid) {
  console.error('循环依赖:', validation.circularChains)
  console.error('版本不一致:', validation.inconsistentDeps)
}

// 查看依赖关系图
console.log(repo.buildDependencyGraph().mermaid)
```

### 构建和发布

```typescript
import { Monorepo } from '@cat-kit/maintenance'

const repo = new Monorepo()
const group = repo.group(['@cat-kit/core', '@cat-kit/fe', '@cat-kit/http'])

// 按依赖关系分批并行构建
await group.build()

// 批量更新版本
await group.bumpVersion({ type: 'minor' })

// 批量发布
await group.publish({ skipPrivate: true })
```

### 独立函数用法

```typescript
import {
  checkCircularDependencies,
  parseSemver,
  incrementVersion,
  createGitTag,
  publishPackage
} from '@cat-kit/maintenance'

// 检查循环依赖
const result = checkCircularDependencies(packages)

// 版本操作
parseSemver('1.2.3-alpha.1')
incrementVersion('1.2.3', 'minor') // '1.3.0'

// 发布流程
await createGitTag({ cwd: '/repo', tag: 'v1.2.3', push: true })
await publishPackage({ cwd: '/pkg', access: 'public' })
```

## 模块概览

### 📦 [Monorepo 管理](./monorepo)

统一的 monorepo 管理类，提供工作区管理、批量构建、版本更新和发布。

- `Monorepo` - 管理类，自动发现工作区
- `WorkspaceGroup` - 分组操作（build、bumpVersion、publish）

### 🔍 [依赖管理](./deps)

分析和管理 monorepo 中的依赖关系。

- `checkCircularDependencies()` - 检测循环依赖（Tarjan 算法）
- `checkVersionConsistency()` - 检查版本一致性
- `buildDependencyGraph()` - 构建依赖关系图
- `visualizeDependencyGraph()` - 生成 Mermaid 依赖图

### 🔢 [版本管理](./version)

语义化版本管理功能。

- `parseSemver()` / `compareSemver()` - 解析和比较版本号
- `incrementVersion()` - 递增版本号
- `bumpVersion()` - 更新单个包版本
- `syncPeerDependencies()` / `syncDependencies()` - 同步依赖版本

### 🔨 [构建工具](./build)

基于 tsdown 的库构建工具。

- `buildLib()` - 构建单个库

### 🚀 [发布与 Git](./release)

发布流程自动化。

- `createGitTag()` - 创建/推送 git tag
- `commitAndPush()` - 执行 add/commit/push
- `publishPackage()` - npm 发布封装

## 错误处理

所有错误继承自 `MaintenanceError`：

| 错误类 | 场景 |
|-------|------|
| `ConfigError` | 配置无效 |
| `SemverError` | 版本号格式无效 |
| `ValidationError` | 验证失败 |
| `GitError` | Git 命令执行失败 |
| `PublishError` | npm 发布失败 |

```typescript
import { SemverError, parseSemver } from '@cat-kit/maintenance'

try {
  parseSemver('invalid')
} catch (e) {
  if (e instanceof SemverError) {
    console.error(e.message, e.version)
  }
}
```

## 下一步

- [Monorepo 管理](./monorepo) - 统一管理类 API
- [依赖管理](./deps) - 依赖分析 API
- [版本管理](./version) - 版本操作 API
- [构建工具](./build) - 构建配置 API
- [发布与 Git](./release) - 发布流程 API
- [库构建指南](./guide) - 依赖类型与构建最佳实践
