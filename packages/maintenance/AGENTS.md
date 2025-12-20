# @cat-kit/maintenance

Monorepo 维护工具包，提供依赖管理、版本控制、构建和发布的完整解决方案。

## 安装

```bash
bun add @cat-kit/maintenance
```

## 快速开始

```typescript
import { Monorepo } from '@cat-kit/maintenance'

const repo = new Monorepo('/path/to/monorepo')

// 验证 monorepo 有效性
const validation = repo.validate()
if (!validation.valid) {
  console.log('循环依赖:', validation.circularChains)
  console.log('版本不一致:', validation.inconsistentDeps)
}

// 对指定包进行批量操作
const group = repo.group(['@cat-kit/core', '@cat-kit/fe'])
await group.build()
await group.bumpVersion({ type: 'patch' })
await group.publish()
```

## API 参考

### Monorepo 类

统一管理入口，自动解析 `package.json` 中的 `workspaces` 字段。

```typescript
const repo = new Monorepo(rootDir?: string)
```

| 属性/方法 | 说明 |
|----------|------|
| `root` | 根目录信息（`MonorepoRoot`） |
| `workspaces` | 工作区列表（`MonorepoWorkspace[]`） |
| `group(names)` | 创建工作区分组，返回 `WorkspaceGroup` |
| `validate()` | 验证循环依赖和版本一致性 |
| `buildDependencyGraph(options?)` | 构建依赖关系图，支持 Mermaid 输出 |

#### WorkspaceGroup

```typescript
const group = repo.group(['@cat-kit/core', '@cat-kit/fe'])
```

| 方法 | 说明 |
|------|------|
| `build(configs?)` | 按拓扑顺序分批并行构建 |
| `bumpVersion(options)` | 批量更新版本，自动同步 peer/deps |
| `publish(options?)` | 批量发布到 npm，自动检测预发布 tag |

---

### deps 模块

#### checkCircularDependencies

使用 Tarjan 算法检测循环依赖。

```typescript
import { checkCircularDependencies } from '@cat-kit/maintenance'

const packages = [
  { name: '@my/core', pkg: corePackageJson },
  { name: '@my/utils', pkg: utilsPackageJson }
]

const result = checkCircularDependencies(packages)
// { hasCircular: boolean, cycles: CircularChain[] }
```

#### checkVersionConsistency

检测多个包中相同依赖的版本是否一致。

```typescript
import { checkVersionConsistency } from '@cat-kit/maintenance'

const result = checkVersionConsistency(packages, { ignore: ['lodash'] })
// { consistent: boolean, inconsistent: InconsistentDependency[] }
```

#### buildDependencyGraph / visualizeDependencyGraph

构建依赖关系图并生成 Mermaid 可视化。

```typescript
import { buildDependencyGraph, visualizeDependencyGraph } from '@cat-kit/maintenance'

const graph = buildDependencyGraph(packages)
const mermaid = visualizeDependencyGraph(graph, {
  includeExternal: false,
  distinguishTypes: true  // --> dependencies, ---> devDeps, -..-> peerDeps
})
```

---

### version 模块

#### parseSemver / compareSemver / isValidSemver

```typescript
import { parseSemver, compareSemver, isValidSemver } from '@cat-kit/maintenance'

parseSemver('1.2.3-alpha.1')
// { major: 1, minor: 2, patch: 3, prerelease: ['alpha', '1'], raw: '1.2.3-alpha.1' }

compareSemver('2.0.0', '1.0.0')  // 1
compareSemver('1.0.0-alpha', '1.0.0')  // -1 (预发布 < 正式)

isValidSemver('1.2.3')  // true
```

#### incrementVersion

```typescript
import { incrementVersion } from '@cat-kit/maintenance'

incrementVersion('1.2.3', 'major')      // '2.0.0'
incrementVersion('1.2.3', 'minor')      // '1.3.0'
incrementVersion('1.2.3', 'patch')      // '1.2.4'
incrementVersion('1.2.3', 'premajor')   // '2.0.0-alpha.0'
incrementVersion('1.2.3', 'prerelease') // '1.2.3-alpha.0'
incrementVersion('1.2.3-alpha.0', 'prerelease') // '1.2.3-alpha.1'
```

#### bumpVersion

更新单个包的版本号，支持智能推断递增类型。

```typescript
import { bumpVersion } from '@cat-kit/maintenance'

// 智能推断：预发布版本自动 prerelease，稳定版本自动 patch
await bumpVersion('/path/to/pkg', {})

// 显式指定
await bumpVersion('/path/to/pkg', { type: 'minor' })
await bumpVersion('/path/to/pkg', { version: '2.0.0' })
```

#### syncPeerDependencies / syncDependencies

```typescript
import { syncPeerDependencies, syncDependencies } from '@cat-kit/maintenance'

const packages = [{ dir: '/path/to/pkg1' }, { dir: '/path/to/pkg2' }]

// peerDependencies 更新为 >=version
await syncPeerDependencies(packages, '1.2.3')

// workspace:* 替换为 ^version
await syncDependencies(packages, '1.2.3')
```

---

### build 模块

基于 tsdown 的构建工具。

```typescript
import { buildLib } from '@cat-kit/maintenance'

const result = await buildLib({
  dir: '/absolute/path/to/pkg',  // 必须是绝对路径
  entry: 'src/index.ts',         // 可选，默认 src/index.ts 或 index.ts
  dts: true,                     // 生成 .d.ts
  external: ['vue', 'react'],    // 外部依赖
  platform: 'neutral',           // 'neutral' | 'node' | 'browser'
  output: {
    dir: 'dist',
    sourcemap: true
  }
})
// { success: boolean, duration: number, error?: Error }
```

---

### release 模块

#### createGitTag

```typescript
import { createGitTag } from '@cat-kit/maintenance'

await createGitTag({
  cwd: '/path/to/repo',
  tag: 'v1.2.3',
  message: '发布 1.2.3',  // 可选，有则创建 annotated tag
  push: true,
  remote: 'origin',       // 默认 origin
  force: false            // 是否强制覆盖
})
```

#### commitAndPush

```typescript
import { commitAndPush } from '@cat-kit/maintenance'

await commitAndPush({
  cwd: '/path/to/repo',
  message: 'chore: release',
  addAll: true,      // 默认 true，自动 git add -A
  allowEmpty: false, // 是否允许空提交
  pushTags: true,    // 是否推送所有 tag
  remote: 'origin',
  branch: 'main'     // 可选，默认当前分支
})
// { commitHash: string, branch: string }
```

#### publishPackage

支持单包、指定工作区、全部工作区三种模式。

```typescript
import { publishPackage } from '@cat-kit/maintenance'

// 单包发布
await publishPackage({
  cwd: '/path/to/pkg',
  registry: 'https://registry.npmmirror.com',
  tag: 'next',
  access: 'public'
})

// 指定工作区发布
await publishPackage({
  cwd: '/path/to/monorepo',
  workspace: ['@cat-kit/core', '@cat-kit/fe'],
  access: 'public'
})

// 全部工作区发布
await publishPackage({
  cwd: '/path/to/monorepo',
  workspaces: true,
  dryRun: true  // 模拟发布
})
```

---

## 错误处理

所有错误继承自 `MaintenanceError`：

| 错误类 | 场景 |
|-------|------|
| `ConfigError` | 配置无效（缺少 name 字段等） |
| `SemverError` | 版本号格式无效 |
| `ValidationError` | 验证失败 |
| `GitError` | Git 命令执行失败 |
| `PublishError` | npm 发布失败 |

```typescript
import { SemverError } from '@cat-kit/maintenance'

try {
  parseSemver('invalid')
} catch (e) {
  if (e instanceof SemverError) {
    console.log(e.version)  // 'invalid'
    console.log(e.code)     // 'SEMVER_ERROR'
  }
}
```

---

## 类型定义

### 核心类型

```typescript
interface PackageJson {
  name: string
  version: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  workspaces?: string[]
  // ...
}

interface MonorepoWorkspace {
  name: string
  dir: string      // 绝对路径
  version: string
  pkg: PackageJson
  private: boolean
}

interface BuildConfig {
  dir: string
  entry?: string
  dts?: boolean
  external?: string[]
  platform?: 'neutral' | 'node' | 'browser'
  output?: { dir?: string; sourcemap?: boolean }
}

type BumpType = 'major' | 'minor' | 'patch' | 'premajor' | 'preminor' | 'prepatch' | 'prerelease'

interface BumpOptions {
  type?: BumpType
  version?: string  // 直接指定版本号
  preid?: string    // 预发布标识，默认 'alpha'
}
```

---

## 开发规范

- 所有路径必须使用**绝对路径**
- 错误消息使用**中文**
- 函数必须有 **JSDoc 注释**（含 @param、@returns、@throws、@example）
- 测试文件位于 `packages/tests/maintenance/`
