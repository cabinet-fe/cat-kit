---
title: 构建工具
description: '基于 tsdown 的库构建工具'
outline: deep
---

# 构建工具

## 介绍

本页介绍 `@cat-kit/maintenance` 的构建能力，核心函数为 `buildLib`，用于单包构建与产物输出控制。

## 快速使用

```typescript
import { buildLib } from '@cat-kit/maintenance'

await buildLib({
  dir: '/abs/path/to/package',
  entry: 'src/index.ts',
  output: { dir: 'dist' }
})
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## buildLib

构建单个库。

```typescript
function buildLib(config: BuildConfig): Promise<BuildResult>
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dir` | `string` | - | 包目录（必须是绝对路径） |
| `entry` | `string` | `'src/index.ts'` | 入口文件路径 |
| `dts` | `boolean` | `true` | 是否生成 d.ts 文件 |
| `external` | `string[]` | - | 外部依赖，不打包进产物 |
| `platform` | `'neutral' \| 'node' \| 'browser'` | `'neutral'` | 构建平台 |
| `output.dir` | `string` | `'dist'` | 输出目录 |
| `output.sourcemap` | `boolean` | `true` | 是否生成 sourcemap |

**返回值：**

```typescript
interface BuildResult {
  success: boolean
  duration: number   // 毫秒
  error?: Error
}
```

**示例：**

```typescript
import { buildLib } from '@cat-kit/maintenance'
import { resolve } from 'node:path'

const result = await buildLib({
  dir: resolve(process.cwd(), 'packages/core'),
  entry: 'src/index.ts',
  dts: true,
  external: ['vue', 'react'],
  platform: 'neutral',
  output: {
    dir: 'dist',
    sourcemap: true
  }
})

if (result.success) {
  console.log(`✓ 构建完成 ${result.duration}ms`)
} else {
  console.error('✗ 构建失败:', result.error)
}
```

## 入口文件查找

如果未指定 `entry`，按以下顺序查找：

1. `{dir}/src/index.ts`
2. `{dir}/index.ts`

## 平台选项

| 值 | 说明 |
| --- | --- |
| `'neutral'` | 浏览器和 Node.js 通用（默认） |
| `'node'` | 仅 Node.js |
| `'browser'` | 仅浏览器 |

## 构建产物

构建后在输出目录生成：

| 文件 | 说明 |
| --- | --- |
| `index.js` | ES 模块（压缩） |
| `index.d.ts` | TypeScript 类型声明 |
| `index.js.map` | Sourcemap（可选） |
| `stats.html` | Bundle 分析报告 |

## 使用 Monorepo 类

推荐使用 `Monorepo` 类进行批量构建：

```typescript
import { Monorepo } from '@cat-kit/maintenance'

const repo = new Monorepo()

await repo.group(['@cat-kit/core', '@cat-kit/fe', '@cat-kit/http']).build({
  '@cat-kit/fe': {
    external: ['@cat-kit/core']
  },
  '@cat-kit/http': {
    external: ['@cat-kit/core'],
    platform: 'neutral'
  }
})
```

`Monorepo.group().build()` 相比直接使用 `buildLib` 的优势：

- **依赖感知** - 自动分析包之间的依赖关系
- **分批构建** - 按正确顺序构建，避免依赖缺失
- **并行执行** - 同一批次内并行构建
- **自动 external** - 自动将 `peerDependencies` 和 `devDependencies` 设为 external

## 类型定义

```typescript
interface BuildConfig {
  dir: string
  entry?: string
  dts?: boolean
  external?: string[]
  platform?: 'neutral' | 'node' | 'browser'
  output?: {
    dir?: string
    sourcemap?: boolean
  }
}

interface BuildResult {
  success: boolean
  duration: number
  error?: Error
}
```

## 相关文档

- [库构建指南](./guide) - 了解依赖类型和构建最佳实践
- [Monorepo 管理](./monorepo) - 批量构建和发布
