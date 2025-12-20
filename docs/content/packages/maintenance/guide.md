---
title: 库构建指南
description: '了解 npm 依赖类型、库构建与应用构建的区别，以及 Monorepo 最佳实践'
outline: deep
---

# 库构建指南

在使用构建工具之前，了解以下概念将帮助你更好地理解库构建的配置和最佳实践。

## 依赖类型

npm 将依赖分为三种类型，这种设计解决了以下核心问题：

1. **安装时机** - 哪些包需要在生产环境安装？
2. **版本冲突** - 如何避免同一个库被安装多次？
3. **包体积** - 如何让使用方只安装必需的依赖？

### dependencies

运行时必须的依赖。当其他项目安装你的库时，这些依赖**也会被自动安装**。

```json
{
  "dependencies": {
    "dayjs": "^1.11.0"  // 库在运行时需要
  }
}
```

### devDependencies

仅在开发、测试、构建阶段需要。发布后**不会被安装**。

```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### peerDependencies

声明"我的库需要与某个包配合使用"，由使用方负责安装。避免依赖重复安装导致的问题。

```json
{
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

**为什么需要 peerDependencies？**

```
❌ 使用 dependencies:
用户项目:
  └─ react 18.2.0
  └─ your-lib
      └─ react 18.2.0 (重复!)
结果: 两份 React 实例，Hook 错误

✅ 使用 peerDependencies:
用户项目:
  └─ react 18.2.0 (共享)
  └─ your-lib (使用用户的 react)
结果: 正常工作
```

## 库构建 vs 应用构建

### 应用构建

**目标**: 生成可直接运行的代码

- 所有依赖打包进最终产物
- 输出单个或少量 JS 文件
- 典型工具: Webpack、Vite

### 库构建

**目标**: 生成可被其他项目引用的库代码

- **不打包外部依赖**，保留 `import` 语句
- 让使用方决定如何处理依赖（tree-shaking）
- 生成 TypeScript 类型声明
- 典型工具: tsdown、tsup、Rollup

```javascript
// dist/index.js - 库的产物
import { format } from 'date-fns'  // ← 保留导入，不打包

export function formatDate(date) {
  return format(date, 'yyyy-MM-dd')
}
```

::: tip 为什么不打包所有依赖？
如果库把所有模块都打包成一个 blob，会破坏 tree-shaking 的效果。最终应用的打包工具无法区分哪些代码被使用。
:::

## tsdown 依赖处理

`Monorepo` 类的构建功能基于 [tsdown](https://tsdown.dev/) 实现。tsdown 对三种依赖类型的默认处理：

| 依赖类型 | 默认行为 | 说明 |
|---------|---------|------|
| **dependencies** | 不打包 | 保留 import 语句 |
| **peerDependencies** | 不打包 | 保留 import 语句 |
| **devDependencies** | 按需打包 | 实际被 import 时打包 |

### external 配置

`external` 告诉构建工具哪些导入应该保留，不打包进产物。

**使用 `external` 排除额外的包**:

```typescript
await group.build({
  '@cat-kit/fe': {
    external: ['@cat-kit/core']  // 排除内部依赖
  }
})
```

**打包决策参考**:

| 场景 | 建议 |
|-----|------|
| React/Vue 等框架 | peerDependencies |
| Monorepo 内部包 | peerDependencies + external |
| 小型工具库 (< 10KB) | 打包进产物 |
| 大型工具库 (lodash) | dependencies |

## Monorepo 最佳实践

### package.json 配置

```json
{
  "name": "@cat-kit/fe",
  "devDependencies": {
    "@cat-kit/core": "workspace:*"
  },
  "peerDependencies": {
    "@cat-kit/core": "1.0.0-alpha.1"
  }
}
```

::: tip 为什么内部依赖同时在两处声明？
- `devDependencies` + `workspace:*`: 开发时解析到本地工作区
- `peerDependencies`: 发布后声明版本要求
:::

### 构建配置

```typescript
const repo = new Monorepo()

await repo.group(['@cat-kit/core', '@cat-kit/fe']).build({
  '@cat-kit/fe': {
    external: ['@cat-kit/core']  // 显式排除内部依赖
  }
})
```

### 依赖关系图

```
@cat-kit/core (基础库)
    ↑
    ├── @cat-kit/fe (peerDep: core)
    ├── @cat-kit/http (peerDep: core)
    └── @cat-kit/be (peerDep: core)
```

### 配置检查清单

- ✅ 内部依赖在 `peerDependencies` 中声明
- ✅ 内部依赖在 `devDependencies` 中引用 (`workspace:*`)
- ✅ 构建配置的 `external` 包含内部依赖
- ✅ 框架依赖放在 `peerDependencies` 中
- ✅ 构建工具放在 `devDependencies` 中
