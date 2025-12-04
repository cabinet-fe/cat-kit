---
title: 打包器
sidebarTitle: 打包器
order: 3
---

# 打包器 (bundler)

`MonoRepoBundler` 是一个专为 monorepo 设计的打包工具类，支持按依赖关系分批并行构建多个包。基于 [tsdown](https://tsdown.dev/)（Rolldown 的 TypeScript 打包工具）实现，提供高性能的构建体验。

## 特性

- **依赖感知** - 自动分析包之间的依赖关系，按正确顺序构建
- **并行构建** - 同一批次内的包并行构建，充分利用多核性能
- **TypeScript 支持** - 使用 tsdown 构建，自动生成类型声明文件 (`.d.ts`)
- **Bundle 分析** - 每个包自动生成 `stats.html` 可视化分析报告
- **Sourcemap** - 默认生成 sourcemap，便于调试
- **压缩输出** - 默认启用代码压缩，减小产物体积

## 基本用法

```typescript
import { MonoRepoBundler } from '@cat-kit/maintenance'
import type { BundlePackageOption } from '@cat-kit/maintenance'

// 定义包配置
const packages: BundlePackageOption[] = [
  {
    dir: '/path/to/packages/core',
    build: {
      input: 'src/index.ts'
    }
  },
  {
    dir: '/path/to/packages/utils',
    deps: ['@my-org/core'],
    build: {
      input: 'src/index.ts',
      external: ['@my-org/core']
    }
  }
]

// 创建打包器并执行构建
const bundler = new MonoRepoBundler(packages)
const summary = await bundler.build()

console.log(`总耗时: ${summary.totalDuration}ms`)
console.log(`成功: ${summary.totalSuccess}, 失败: ${summary.totalFailed}`)
```

## 配置选项

### BundlePackageOption

包构建选项接口：

```typescript
interface BundlePackageOption {
  /** 包目录，必须是绝对路径 */
  dir: string

  /** 包的构建依赖，用于确定构建顺序 */
  deps?: string[]

  /** 构建配置 */
  build: BundleBuildConfig

  /** 输出配置 */
  output?: BundleOutputConfig
}
```

### BundleBuildConfig

构建配置：

```typescript
interface BundleBuildConfig {
  /** 入口文件路径，相对于 dir */
  input: string
  /** 是否生成 d.ts 文件，默认 true */
  dts?: boolean
  /** 外部依赖，不打包进产物 */
  external?: string[]
}
```

### BundleOutputConfig

输出配置：

```typescript
interface BundleOutputConfig {
  /** 输出目录，默认 'dist' */
  dir?: string
  /** 是否生成 sourcemap，默认 true */
  sourcemap?: boolean
}
```

## 配置示例

### 基础包（无依赖）

```typescript
{
  dir: '/path/to/packages/core',
  build: {
    input: 'src/index.ts'
  }
}
```

### 依赖其他包

```typescript
{
  dir: '/path/to/packages/utils',
  deps: ['@my-org/core'],  // 声明依赖，确保 core 先构建
  build: {
    input: 'src/index.ts',
    external: ['@my-org/core']  // 不打包 core，作为外部依赖
  }
}
```

### 自定义输出配置

```typescript
{
  dir: '/path/to/packages/cli',
  deps: ['@my-org/core', '@my-org/utils'],
  build: {
    input: 'src/index.ts',
    dts: false,  // CLI 工具不需要类型声明
    external: ['@my-org/core', '@my-org/utils']
  },
  output: {
    dir: 'build',  // 输出到 build 目录而非 dist
    sourcemap: false  // 不生成 sourcemap
  }
}
```

### 多入口包

如果一个包有多个入口，需要分别配置：

```typescript
// 主入口
{
  dir: '/path/to/packages/excel',
  build: { input: 'src/index.ts' }
}

// Worker 入口（单独打包）
// 注意：这种情况可能需要自定义处理
```

## 构建结果

`build()` 方法返回 `BuildSummary` 对象，包含完整的构建信息：

```typescript
interface BuildSummary {
  /** 总耗时（毫秒） */
  totalDuration: number
  /** 总成功数量 */
  totalSuccess: number
  /** 总失败数量 */
  totalFailed: number
  /** 各批次的结果 */
  batches: BatchBuildResult[]
}

interface BatchBuildResult {
  /** 批次索引（从 1 开始） */
  batchIndex: number
  /** 批次耗时（毫秒） */
  duration: number
  /** 成功数量 */
  successCount: number
  /** 失败数量 */
  failedCount: number
  /** 各包的构建结果 */
  results: BundleResult[]
}

interface BundleResult {
  /** 包名称 */
  name: string
  /** 是否成功 */
  success: boolean
  /** 构建耗时（毫秒） */
  duration: number
  /** 错误信息（如果失败） */
  error?: Error
}
```

**使用构建结果：**

```typescript
const summary = await bundler.build()

// 检查是否全部成功
if (summary.totalFailed > 0) {
  console.error('部分包构建失败:')

  summary.batches.forEach(batch => {
    batch.results
      .filter(r => !r.success)
      .forEach(r => {
        console.error(`  ${r.name}: ${r.error?.message}`)
      })
  })

  process.exit(1)
}

// 输出构建统计
console.log(`\n构建统计:`)
console.log(`  总耗时: ${summary.totalDuration}ms`)
console.log(`  批次数: ${summary.batches.length}`)
console.log(`  包数量: ${summary.totalSuccess}`)

// 找出最慢的包
const allResults = summary.batches.flatMap(b => b.results)
const slowest = allResults.sort((a, b) => b.duration - a.duration)[0]
console.log(`  最慢: ${slowest?.name} (${slowest?.duration}ms)`)
```

## 构建流程

`MonoRepoBundler` 的构建流程如下：

```
1. 初始化
   └─ 并行读取所有包的 package.json
   └─ 获取包名称等信息

2. 依赖分析
   └─ 根据 deps 配置确定构建顺序
   └─ 将包分成多个批次

3. 分批构建
   └─ 第一批：构建没有依赖的包
   └─ 第二批：构建依赖已满足的包
   └─ ...重复直到所有包构建完成

4. 并行执行
   └─ 每批内的包并行构建
   └─ 使用 tsdown 进行实际构建

5. 生成报告
   └─ 每个包生成 stats.html 分析报告
   └─ 输出构建统计信息
```

**批次示例：**

假设有以下依赖关系：

```
@my-org/core (无依赖)
@my-org/utils → @my-org/core
@my-org/http → @my-org/core
@my-org/cli → @my-org/core, @my-org/utils
```

构建批次将是：

```
批次 1（无依赖）:
  - @my-org/core

批次 2（依赖 core）:
  - @my-org/utils   ← 并行
  - @my-org/http    ← 并行

批次 3（依赖 utils）:
  - @my-org/cli
```

## 构建产物

每个包构建后会在输出目录（默认 `dist`）生成以下文件：

| 文件 | 说明 |
| --- | --- |
| `index.js` | ES 模块（压缩） |
| `index.d.ts` | TypeScript 类型声明 |
| `index.js.map` | Sourcemap（可选） |
| `stats.html` | Bundle 分析报告 |

**输出格式：**

- **模块格式**: ES modules (`format: 'es'`)
- **平台**: neutral（可在浏览器和 Node.js 中使用）
- **压缩**: 启用 (`minify: true`)

## 控制台输出

构建过程会在控制台输出详细信息，使用彩色格式便于阅读：

```
🚀 开始构建...

⚡ 第1轮
  ├─ ✓ @my-org/core          123ms
  └─ 123ms ✓ 1

⚡ 第2轮
  ├─ ✓ @my-org/utils         89ms
  ├─ ✓ @my-org/http          102ms
  └─ 102ms ✓ 2

⚡ 第3轮
  ├─ ✓ @my-org/cli           156ms
  └─ 156ms ✓ 1

✨ 总耗时: 381ms ✓ 4

📊 Bundle 分析报告已生成
  运行 bun run analyze 启动服务查看可视化分析
```

**构建失败时：**

```
⚡ 第2轮
  ├─ ✓ @my-org/utils         89ms
  ├─ ✗ @my-org/http
Error: Cannot find module 'xxx'
    at ...
  └─ 102ms ✓ 1 ✗ 1
```

## Bundle 分析

每个包的 `dist` 目录下会生成 `stats.html` 文件，可以可视化分析 bundle 的组成：

**查看分析报告：**

1. 直接在浏览器中打开 `stats.html` 文件
2. 或者使用 HTTP 服务器：

```bash
# 使用 Python
python -m http.server 8080 -d packages/core/dist

# 使用 Node.js
npx serve packages/core/dist
```

**分析报告内容：**

- 各模块占用体积
- 依赖关系树状图
- 重复代码检测
- 压缩前后体积对比

## 实际应用

### 完整的构建脚本

```typescript
// build/index.ts
import { MonoRepoBundler } from '@cat-kit/maintenance'
import { resolve } from 'node:path'

const ROOT = process.cwd()

// 定义包配置
const packages = [
  // 基础包
  {
    dir: resolve(ROOT, 'packages/core'),
    build: { input: 'src/index.ts' }
  },

  // 依赖 core 的包
  {
    dir: resolve(ROOT, 'packages/fe'),
    deps: ['@cat-kit/core'],
    build: {
      input: 'src/index.ts',
      external: ['@cat-kit/core']
    }
  },
  {
    dir: resolve(ROOT, 'packages/http'),
    deps: ['@cat-kit/core'],
    build: {
      input: 'src/index.ts',
      external: ['@cat-kit/core']
    }
  },
  {
    dir: resolve(ROOT, 'packages/be'),
    deps: ['@cat-kit/core'],
    build: {
      input: 'src/index.ts',
      external: ['@cat-kit/core']
    }
  },

  // 依赖 core 和 be 的包
  {
    dir: resolve(ROOT, 'packages/maintenance'),
    deps: ['@cat-kit/core', '@cat-kit/be'],
    build: {
      input: 'src/index.ts',
      external: ['@cat-kit/core', '@cat-kit/be']
    }
  }
]

// 执行构建
async function main() {
  const bundler = new MonoRepoBundler(packages)
  const summary = await bundler.build()

  if (summary.totalFailed > 0) {
    process.exit(1)
  }
}

main()
```

### 在 package.json 中配置脚本

```json
{
  "scripts": {
    "build": "bun run build/index.ts",
    "analyze": "bun run build/analyze.ts"
  }
}
```

### 分析脚本

```typescript
// build/analyze.ts
import { serve } from 'bun'
import { join } from 'node:path'

// 启动静态文件服务器
serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url)
    const filepath = join(process.cwd(), url.pathname)

    return new Response(Bun.file(filepath))
  }
})

console.log('📊 分析服务器运行在 http://localhost:3000')
console.log('\n访问各包的分析报告:')
console.log('  - http://localhost:3000/packages/core/dist/stats.html')
console.log('  - http://localhost:3000/packages/fe/dist/stats.html')
console.log('  - ...')
```

### CI/CD 集成

```yaml
# .github/workflows/build.yml
name: Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - run: bun install

      - run: bun run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: packages/*/dist
```

## 错误处理

构建失败时，`BundleResult.error` 会包含具体错误信息：

```typescript
const summary = await bundler.build()

const failures = summary.batches
  .flatMap(b => b.results)
  .filter(r => !r.success)

if (failures.length > 0) {
  console.error('\n构建失败的包:')
  failures.forEach(f => {
    console.error(`\n❌ ${f.name}`)
    console.error(f.error?.stack || f.error?.message)
  })
}
```

**常见错误：**

| 错误 | 可能原因 |
| --- | --- |
| `Cannot find module` | 依赖未安装或路径错误 |
| `Type error` | TypeScript 类型错误 |
| `Circular dependency` | 存在循环引用 |
| `Missing name in package.json` | package.json 中缺少 name 字段 |

## 类型导出

```typescript
import type {
  BundlePackageOption,
  BundleBuildConfig,
  BundleOutputConfig,
  BundlePackageConfig,
  BundleResult,
  BatchBuildResult,
  BuildSummary
} from '@cat-kit/maintenance'
```
