---
title: Monorepo 管理
sidebarTitle: Monorepo 管理
order: 3
---

# Monorepo 管理 (monorepo)

`Monorepo` 类是一个统一的 monorepo 管理工具，提供工作区管理、依赖验证、批量构建、版本更新和发布等功能。基于 [tsdown](https://tsdown.dev/)（Rolldown 的 TypeScript 打包工具）实现高性能构建。

## 特性

- **自动工作区发现** - 根据 `package.json` 的 `workspaces` 字段自动发现所有工作区
- **依赖验证** - 检测循环依赖和版本不一致
- **依赖图可视化** - 生成 Mermaid 格式的依赖关系图
- **分组操作** - 对指定包进行批量构建、版本更新和发布
- **依赖感知构建** - 自动分析包之间的依赖关系，按正确顺序构建
- **并行构建** - 同一批次内的包并行构建，充分利用多核性能

## Monorepo 类

### 构造函数

```typescript
class Monorepo {
  constructor(rootDir?: string)
}
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `rootDir` | `string` | `process.cwd()` | monorepo 根目录（必须是绝对路径） |

**示例：**

```typescript
import { Monorepo } from '@cat-kit/maintenance'

// 使用当前目录
const repo = new Monorepo()

// 指定目录
const repo = new Monorepo('/path/to/monorepo')
```

### 属性

#### root

获取 monorepo 根目录信息。

```typescript
get root(): MonorepoRoot
```

**返回值：**

```typescript
interface MonorepoRoot {
  /** 根目录（绝对路径） */
  dir: string
  /** package.json 内容 */
  pkg: PackageJson
  /** 工作区 glob 模式 */
  workspacePatterns: string[]
}
```

**示例：**

```typescript
const repo = new Monorepo()

console.log(repo.root.dir)
// '/path/to/monorepo'

console.log(repo.root.workspacePatterns)
// ['packages/*']
```

#### workspaces

获取所有工作区列表。

```typescript
get workspaces(): MonorepoWorkspace[]
```

**返回值：**

```typescript
interface MonorepoWorkspace {
  /** 包名称 */
  name: string
  /** 包目录（绝对路径） */
  dir: string
  /** 包版本 */
  version: string
  /** package.json 内容 */
  pkg: PackageJson
  /** 是否为私有包 */
  private: boolean
}
```

**示例：**

```typescript
const repo = new Monorepo()

// 列出所有工作区
repo.workspaces.forEach(ws => {
  console.log(`${ws.name}@${ws.version} - ${ws.dir}`)
})

// 过滤非私有包
const publicPackages = repo.workspaces.filter(ws => !ws.private)
```

### 方法

#### group()

创建工作区分组，用于对指定的包进行批量操作。

```typescript
group<const T extends readonly string[]>(names: T): WorkspaceGroup<T[number]>
```

**参数：**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `names` | `string[]` | 工作区名称列表 |

**返回值：**

返回 `WorkspaceGroup` 实例，支持 `build()`、`bumpVersion()` 和 `publish()` 操作。

**示例：**

```typescript
const repo = new Monorepo()

// 创建分组
const group = repo.group(['@cat-kit/core', '@cat-kit/fe', '@cat-kit/http'])

// 链式调用
await repo.group(['@cat-kit/core']).build()
```

#### validate()

验证 monorepo 的有效性，包括检测循环依赖和版本不一致。

```typescript
validate(): MonorepoValidationResult
```

**返回值：**

```typescript
interface MonorepoValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 是否有循环依赖 */
  hasCircular: boolean
  /** 循环依赖链 */
  circularChains: string[][]
  /** 版本不一致的依赖 */
  inconsistentDeps: Array<{
    name: string
    versions: Array<{ version: string; usedBy: string[] }>
  }>
}
```

**示例：**

```typescript
const repo = new Monorepo()
const result = repo.validate()

if (!result.valid) {
  if (result.hasCircular) {
    console.error('发现循环依赖:')
    result.circularChains.forEach(chain => {
      console.error(`  ${chain.join(' → ')}`)
    })
  }

  if (result.inconsistentDeps.length > 0) {
    console.error('发现版本不一致:')
    result.inconsistentDeps.forEach(dep => {
      console.error(`  ${dep.name}:`)
      dep.versions.forEach(v => {
        console.error(`    ${v.version} @ ${v.usedBy.join(', ')}`)
      })
    })
  }

  process.exit(1)
}

console.log('✅ Monorepo 验证通过')
```

#### buildDependencyGraph()

构建依赖关系图。

```typescript
buildDependencyGraph(options?: {
  /** 是否包含外部依赖 */
  includeExternal?: boolean
}): DependencyGraphResult
```

**返回值：**

```typescript
interface DependencyGraphResult {
  /** 节点列表 */
  nodes: Array<{
    id: string
    version: string
    external: boolean
  }>
  /** 边列表 */
  edges: Array<{
    from: string
    to: string
    type: 'dependencies' | 'devDependencies' | 'peerDependencies'
  }>
  /** Mermaid 格式的依赖图 */
  mermaid: string
}
```

**示例：**

```typescript
const repo = new Monorepo()

// 只包含内部依赖
const graph = repo.buildDependencyGraph({ includeExternal: false })

console.log(`共 ${graph.nodes.length} 个包`)
console.log(`共 ${graph.edges.length} 条依赖关系`)

// 输出 Mermaid 图
console.log(graph.mermaid)
```

## WorkspaceGroup 类

通过 `Monorepo.group()` 创建，用于对一组工作区进行批量操作。

### build()

按依赖关系分批并行构建选中的包。

```typescript
async build(
  configs?: Partial<Record<WorkspaceName, WorkspaceBuildConfig>>
): Promise<void>
```

**参数：**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `configs` | `Record<string, WorkspaceBuildConfig>` | 各工作区的构建配置 |

```typescript
interface WorkspaceBuildConfig {
  /** 入口文件路径，相对于包目录 */
  entry?: string
  /** 是否生成 d.ts 文件，默认 true */
  dts?: boolean
  /** 外部依赖，不打包进产物 */
  external?: string[]
  /** 构建平台：'neutral' | 'node' | 'browser' */
  platform?: 'neutral' | 'node' | 'browser'
  /** 输出配置 */
  output?: {
    /** 输出目录，默认 'dist' */
    dir?: string
    /** 是否生成 sourcemap，默认 true */
    sourcemap?: boolean
  }
}
```

**示例：**

```typescript
const repo = new Monorepo()

await repo.group(['@cat-kit/core', '@cat-kit/fe', '@cat-kit/http']).build({
  '@cat-kit/fe': {
    external: ['@cat-kit/core']  // 不打包 core
  },
  '@cat-kit/http': {
    external: ['@cat-kit/core'],
    platform: 'neutral'
  }
})
```

**构建流程：**

```
1. 依赖分析
   └─ 根据包之间的依赖关系确定构建顺序
   └─ 将包分成多个批次

2. 分批构建
   └─ 第一批：构建没有内部依赖的包
   └─ 第二批：构建依赖已满足的包
   └─ ...重复直到所有包构建完成

3. 并行执行
   └─ 每批内的包并行构建
   └─ 使用 tsdown 进行实际构建
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

批量更新选中包的版本号。

```typescript
async bumpVersion(options: GroupBumpOptions): Promise<BumpResult>
```

**参数：**

```typescript
interface GroupBumpOptions {
  /** 更新类型 */
  type: BumpType
  /** 新版本号（如果指定则忽略 type） */
  version?: string
  /** 预发布标识（如 'alpha', 'beta'） */
  preid?: string
  /** 是否同步 peerDependencies，默认 true */
  syncPeer?: boolean
  /** 是否同步 dependencies 中的 workspace:* 引用，默认 true */
  syncDeps?: boolean
}
```

**返回值：**

```typescript
interface BumpResult {
  /** 新版本号 */
  version: string
  /** 已更新的包列表 */
  updated: Array<{
    name: string
    oldVersion: string
    newVersion: string
  }>
}
```

**示例：**

```typescript
const repo = new Monorepo()
const group = repo.group(['@cat-kit/core', '@cat-kit/fe', '@cat-kit/http'])

// 递增 minor 版本并同步依赖
const result = await group.bumpVersion({
  type: 'minor',
  syncPeer: true,
  syncDeps: true
})

console.log(`新版本: ${result.version}`)
result.updated.forEach(pkg => {
  console.log(`  ${pkg.name}: ${pkg.oldVersion} → ${pkg.newVersion}`)
})
```

**版本同步说明：**

- `syncPeer: true` - 更新 `peerDependencies` 中的内部包版本为 `>=newVersion`
- `syncDeps: true` - 将 `dependencies` 中的 `workspace:*` 替换为 `^newVersion`

### publish()

批量发布选中的包到 npm。

```typescript
async publish(options?: GroupPublishOptions): Promise<void>
```

**参数：**

```typescript
interface GroupPublishOptions {
  /** 是否跳过私有包，默认 true */
  skipPrivate?: boolean
  /** 自定义 registry */
  registry?: string
  /** 发布 dist-tag，默认 'latest' */
  tag?: string
  /** 2FA 动态验证码 */
  otp?: string
  /** 是否仅做 dry-run */
  dryRun?: boolean
  /** 包访问级别 */
  access?: 'public' | 'restricted'
  /** 启用 provenance（npm 9+） */
  provenance?: boolean
}
```

**示例：**

```typescript
const repo = new Monorepo()
const group = repo.group(['@cat-kit/core', '@cat-kit/fe', '@cat-kit/http'])

// 发布到 npm 镜像
await group.publish({
  skipPrivate: true,
  registry: 'https://registry.npmmirror.com',
  tag: 'latest'
})

// 预发布版本
await group.publish({
  tag: 'next',
  access: 'public'
})

// Dry run 测试
await group.publish({ dryRun: true })
```

## 完整工作流示例

### 标准发布流程

```typescript
// build/release.ts
import { Monorepo } from '@cat-kit/maintenance'
import { createGitTag, commitAndPush } from '@cat-kit/maintenance'

async function release(type: 'major' | 'minor' | 'patch' = 'patch') {
  const repo = new Monorepo()

  // 1. 验证 monorepo
  console.log('🔍 验证 monorepo...')
  const validation = repo.validate()
  if (!validation.valid) {
    console.error('❌ 验证失败')
    process.exit(1)
  }
  console.log('✅ 验证通过')

  // 2. 选择要发布的包
  const packages = [
    '@cat-kit/core',
    '@cat-kit/fe',
    '@cat-kit/http',
    '@cat-kit/be'
  ]
  const group = repo.group(packages)

  // 3. 构建
  console.log('\n📦 构建中...')
  await group.build({
    '@cat-kit/fe': { external: ['@cat-kit/core'] },
    '@cat-kit/http': { external: ['@cat-kit/core'] },
    '@cat-kit/be': { external: ['@cat-kit/core'] }
  })

  // 4. 更新版本
  console.log('\n🔢 更新版本...')
  const result = await group.bumpVersion({
    type,
    syncPeer: true,
    syncDeps: true
  })
  console.log(`版本更新到 ${result.version}`)

  // 5. 提交并打标签
  const cwd = repo.root.dir
  const tag = `v${result.version}`

  console.log('\n📝 提交更改...')
  await commitAndPush({
    cwd,
    message: `chore: release ${tag}`
  })

  console.log(`\n🏷️ 创建标签 ${tag}...`)
  await createGitTag({
    cwd,
    tag,
    message: `Release ${tag}`,
    push: true
  })

  // 6. 发布
  console.log('\n🚀 发布到 npm...')
  await group.publish({
    skipPrivate: true,
    access: 'public'
  })

  console.log(`\n✨ 发布完成: ${tag}`)
}

// 使用: bun run build/release.ts minor
const type = process.argv[2] as 'major' | 'minor' | 'patch' || 'patch'
release(type)
```

### CI 检查脚本

```typescript
// scripts/ci-check.ts
import { Monorepo } from '@cat-kit/maintenance'

async function main() {
  const repo = new Monorepo()

  console.log('=== Monorepo CI 检查 ===\n')

  // 1. 显示工作区信息
  console.log('📦 工作区:')
  repo.workspaces.forEach(ws => {
    const flag = ws.private ? '🔒' : '📦'
    console.log(`  ${flag} ${ws.name}@${ws.version}`)
  })

  // 2. 验证
  console.log('\n🔍 验证中...')
  const validation = repo.validate()

  if (validation.hasCircular) {
    console.error('❌ 发现循环依赖:')
    validation.circularChains.forEach(chain => {
      console.error(`   ${chain.join(' → ')}`)
    })
  }

  if (validation.inconsistentDeps.length > 0) {
    console.error('❌ 发现版本不一致:')
    validation.inconsistentDeps.forEach(dep => {
      console.error(`   ${dep.name}`)
    })
  }

  if (!validation.valid) {
    process.exit(1)
  }

  console.log('✅ 验证通过')

  // 3. 构建测试
  console.log('\n🔨 构建中...')
  const publicPackages = repo.workspaces
    .filter(ws => !ws.private)
    .map(ws => ws.name)

  await repo.group(publicPackages).build()

  console.log('\n✅ CI 检查完成')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
```

### 依赖分析脚本

```typescript
// scripts/analyze-deps.ts
import { writeFileSync } from 'node:fs'
import { Monorepo } from '@cat-kit/maintenance'

const repo = new Monorepo()
const graph = repo.buildDependencyGraph({ includeExternal: false })

// 生成 Markdown 文档
const markdown = `# 包依赖关系

## 依赖图

\`\`\`mermaid
${graph.mermaid}
\`\`\`

## 包列表

| 包名 | 版本 | 依赖数 |
|------|------|--------|
${graph.nodes
  .filter(n => !n.external)
  .map(n => {
    const deps = graph.edges.filter(e => e.from === n.id).length
    return `| ${n.id} | ${n.version} | ${deps} |`
  })
  .join('\n')}

_生成时间: ${new Date().toISOString()}_
`

writeFileSync('docs/DEPENDENCIES.md', markdown)
console.log('✅ 依赖文档已生成')
```

## 类型定义

### MonorepoWorkspace

```typescript
interface MonorepoWorkspace {
  name: string
  dir: string
  version: string
  pkg: PackageJson
  private: boolean
}
```

### MonorepoRoot

```typescript
interface MonorepoRoot {
  dir: string
  pkg: PackageJson
  workspacePatterns: string[]
}
```

### WorkspaceBuildConfig

```typescript
interface WorkspaceBuildConfig {
  entry?: string
  dts?: boolean
  external?: string[]
  platform?: 'neutral' | 'node' | 'browser'
  output?: {
    dir?: string
    sourcemap?: boolean
  }
}
```

### GroupBumpOptions

```typescript
interface GroupBumpOptions {
  type: BumpType
  version?: string
  preid?: string
  syncPeer?: boolean
  syncDeps?: boolean
}
```

### GroupPublishOptions

```typescript
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

### MonorepoValidationResult

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

### DependencyGraphResult

```typescript
interface DependencyGraphResult {
  nodes: Array<{
    id: string
    version: string
    external: boolean
  }>
  edges: Array<{
    from: string
    to: string
    type: 'dependencies' | 'devDependencies' | 'peerDependencies'
  }>
  mermaid: string
}
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

## 错误处理

```typescript
import { Monorepo } from '@cat-kit/maintenance'

const repo = new Monorepo()

try {
  const group = repo.group(['@cat-kit/core', '@cat-kit/fe'])
  await group.build()
} catch (error) {
  if (error instanceof Error) {
    console.error('构建失败:', error.message)
  }
  process.exit(1)
}
```

**常见错误：**

| 错误 | 可能原因 |
| --- | --- |
| `rootDir 必须是绝对路径` | 传入了相对路径 |
| `未找到 package.json` | 指定目录不存在或不是有效的 npm 包 |
| `检测到循环依赖，无法完成构建` | 存在循环依赖 |
| `Cannot find module` | 依赖未安装或路径错误 |
