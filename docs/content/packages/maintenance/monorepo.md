---
title: Monorepo 管理
description: '统一的 monorepo 管理类，提供工作区管理、批量构建、版本更新和发布'
outline: deep
---

# Monorepo 管理

## 介绍

本页介绍 `@cat-kit/maintenance` 的 `Monorepo` 与 `WorkspaceGroup`，用于统一管理工作区、构建、版本与发布流程。

## 快速使用

```typescript
import { Monorepo } from '@cat-kit/maintenance'

const repo = new Monorepo('/path/to/repo')
const validation = repo.validate()

const group = repo.group(['@cat-kit/core', '@cat-kit/http'])
await group.build()
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## 特性

- **自动工作区发现** - 根据 `package.json` 的 `workspaces` 字段
- **依赖验证** - 检测循环依赖和版本不一致
- **依赖图可视化** - 生成 Mermaid 格式
- **依赖感知构建** - 按正确顺序分批并行构建
- **批量操作** - 版本更新和发布

## Monorepo 类

### 构造函数

```typescript
class Monorepo {
  constructor(rootDir?: string)
}
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `rootDir` | `string` | `process.cwd()` | 根目录（必须是绝对路径） |

```typescript
import { Monorepo } from '@cat-kit/maintenance'

const repo = new Monorepo()
const repoWithRoot = new Monorepo('/path/to/monorepo')
```

### root 属性

获取根目录信息。

```typescript
interface MonorepoRoot {
  dir: string              // 绝对路径
  pkg: PackageJson         // package.json 内容
  workspacePatterns: string[]  // 工作区 glob 模式
}
```

```typescript
console.log(repo.root.dir)
console.log(repo.root.workspacePatterns) // ['packages/*']
```

### workspaces 属性

获取所有工作区列表。

```typescript
interface MonorepoWorkspace {
  name: string
  dir: string      // 绝对路径
  version: string
  pkg: PackageJson
  private: boolean
}
```

```typescript
repo.workspaces.forEach(ws => {
  console.log(`${ws.name}@${ws.version}`)
})

// 过滤非私有包
const publicPackages = repo.workspaces.filter(ws => !ws.private)
```

### group()

创建工作区分组，用于批量操作。

```typescript
group<const T extends readonly string[]>(names: T): WorkspaceGroup<T[number]>
```

```typescript
const group = repo.group(['@cat-kit/core', '@cat-kit/fe', '@cat-kit/http'])
```

### validate()

验证 monorepo 有效性（循环依赖和版本一致性）。

```typescript
interface MonorepoValidationResult {
  valid: boolean
  hasCircular: boolean
  circularChains: string[][]
  inconsistentDeps: Array<{
    name: string
    versions: Array<{ version: string; usedBy: string[] }>
  }>
}
```

```typescript
const result = repo.validate()

if (!result.valid) {
  if (result.hasCircular) {
    console.error('循环依赖:', result.circularChains)
  }
  if (result.inconsistentDeps.length > 0) {
    console.error('版本不一致:', result.inconsistentDeps)
  }
  process.exit(1)
}
```

### buildDependencyGraph()

构建依赖关系图。

```typescript
buildDependencyGraph(options?: { includeExternal?: boolean }): DependencyGraphResult
```

```typescript
interface DependencyGraphResult {
  nodes: Array<{ id: string; version: string; external: boolean }>
  edges: Array<{ from: string; to: string; type: string }>
  mermaid: string
}
```

```typescript
const graph = repo.buildDependencyGraph({ includeExternal: false })
console.log(graph.mermaid)
```

## WorkspaceGroup 类

通过 `Monorepo.group()` 创建，用于批量操作。

### build()

按依赖关系分批并行构建。

```typescript
async build(configs?: Partial<Record<WorkspaceName, WorkspaceBuildConfig>>): Promise<void>
```

```typescript
interface WorkspaceBuildConfig {
  entry?: string                          // 入口文件
  dts?: boolean                           // 生成 d.ts，默认 true
  external?: string[]                     // 外部依赖
  platform?: 'neutral' | 'node' | 'browser'
  output?: { dir?: string; sourcemap?: boolean }
}
```

**示例：**

```typescript
await repo.group(['@cat-kit/core', '@cat-kit/fe', '@cat-kit/http']).build({
  '@cat-kit/fe': { external: ['@cat-kit/core'] },
  '@cat-kit/http': { external: ['@cat-kit/core'], platform: 'neutral' }
})
```

**构建流程：**

```
1. 依赖分析 → 确定构建顺序，分成多个批次
2. 分批构建 → 第一批：无内部依赖的包 → 第二批：依赖已满足的包 → ...
3. 并行执行 → 每批内并行构建
```

**控制台输出：**

```
⚡ 第1轮构建 (1 个包)
  ✓ @cat-kit/core 123ms

⚡ 第2轮构建 (2 个包)
  ✓ @cat-kit/fe 89ms
  ✓ @cat-kit/http 102ms

✨ 构建完成: 3 成功, 0 失败 314ms
```

### bumpVersion()

批量更新版本号。

```typescript
async bumpVersion(options: GroupBumpOptions): Promise<BumpResult>
```

```typescript
interface GroupBumpOptions {
  type: BumpType
  version?: string
  preid?: string
  syncPeer?: boolean  // 同步 peerDependencies，默认 true
  syncDeps?: boolean  // 同步 workspace:*，默认 true
}
```

**示例：**

```typescript
const result = await group.bumpVersion({
  type: 'minor',
  syncPeer: true,
  syncDeps: true
})

console.log(`新版本: ${result.version}`)
```

### publish()

批量发布到 npm。

```typescript
async publish(options?: GroupPublishOptions): Promise<void>
```

```typescript
interface GroupPublishOptions {
  skipPrivate?: boolean                   // 跳过私有包，默认 true
  registry?: string
  tag?: string                            // 默认 'latest'
  otp?: string                            // 2FA 验证码
  dryRun?: boolean
  access?: 'public' | 'restricted'
  provenance?: boolean                    // npm 9+
}
```

**示例：**

```typescript
// 发布到 npm 镜像
await group.publish({
  registry: 'https://registry.npmmirror.com',
  access: 'public'
})

// 预发布版本
await group.publish({ tag: 'next' })

// Dry run 测试
await group.publish({ dryRun: true })
```

## 完整工作流示例

### 标准发布流程

```typescript
import { Monorepo, createGitTag, commitAndPush } from '@cat-kit/maintenance'

async function release(type: 'major' | 'minor' | 'patch' = 'patch') {
  const repo = new Monorepo()

  // 1. 验证
  const validation = repo.validate()
  if (!validation.valid) process.exit(1)

  // 2. 选择包
  const group = repo.group(['@cat-kit/core', '@cat-kit/fe', '@cat-kit/http'])

  // 3. 构建
  await group.build({
    '@cat-kit/fe': { external: ['@cat-kit/core'] },
    '@cat-kit/http': { external: ['@cat-kit/core'] }
  })

  // 4. 更新版本
  const result = await group.bumpVersion({ type, syncPeer: true, syncDeps: true })

  // 5. 提交并打标签
  const tag = `v${result.version}`
  await commitAndPush({ cwd: repo.root.dir, message: `chore: release ${tag}` })
  await createGitTag({ cwd: repo.root.dir, tag, push: true })

  // 6. 发布
  await group.publish({ skipPrivate: true, access: 'public' })

  console.log(`✨ 发布完成: ${tag}`)
}
```

### CI 检查脚本

```typescript
import { Monorepo } from '@cat-kit/maintenance'

async function ciCheck() {
  const repo = new Monorepo()

  // 验证
  const validation = repo.validate()
  if (!validation.valid) {
    console.error('❌ 验证失败')
    process.exit(1)
  }

  // 构建
  const publicPackages = repo.workspaces.filter(ws => !ws.private).map(ws => ws.name)
  await repo.group(publicPackages).build()

  console.log('✅ CI 检查完成')
}
```

## 类型定义

```typescript
interface MonorepoWorkspace {
  name: string
  dir: string
  version: string
  pkg: PackageJson
  private: boolean
}

interface MonorepoRoot {
  dir: string
  pkg: PackageJson
  workspacePatterns: string[]
}

interface WorkspaceBuildConfig {
  entry?: string
  dts?: boolean
  external?: string[]
  platform?: 'neutral' | 'node' | 'browser'
  output?: { dir?: string; sourcemap?: boolean }
}

interface GroupBumpOptions {
  type: BumpType
  version?: string
  preid?: string
  syncPeer?: boolean
  syncDeps?: boolean
}

interface GroupPublishOptions {
  skipPrivate?: boolean
  registry?: string
  tag?: string
  otp?: string
  dryRun?: boolean
  access?: 'public' | 'restricted'
  provenance?: boolean
}
```

## 构建产物

每个包构建后输出到 `dist` 目录：

| 文件 | 说明 |
| --- | --- |
| `index.js` | ES 模块（压缩） |
| `index.d.ts` | TypeScript 类型声明 |
| `index.js.map` | Sourcemap（可选） |
| `stats.html` | Bundle 分析报告 |

## 常见错误

| 错误 | 可能原因 |
| --- | --- |
| `rootDir 必须是绝对路径` | 传入了相对路径 |
| `未找到 package.json` | 指定目录不存在 |
| `检测到循环依赖，无法完成构建` | 存在循环依赖 |
