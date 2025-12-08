---
title: 版本管理
sidebarTitle: 版本管理
order: 2
---

# 版本管理 (version)

版本管理模块提供符合 [语义化版本 (semver)](https://semver.org/lang/zh-CN/) 规范的版本号解析、比较、递增等功能，以及批量更新 monorepo 中包版本的工具。

## 版本号解析

### parseSemver

解析 semver 版本号字符串为结构化对象。

**函数签名：**

```typescript
function parseSemver(version: string): SemverVersion
```

**参数：**

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `version` | `string` | 版本字符串，如 `"1.2.3-alpha.1+build.123"` |

**返回值：**

```typescript
interface SemverVersion {
  /** 主版本号 */
  major: number
  /** 次版本号 */
  minor: number
  /** 修订号 */
  patch: number
  /** 预发布标识（如 ['alpha', '1']） */
  prerelease?: string[]
  /** 构建元数据 */
  build?: string
  /** 原始版本字符串 */
  raw: string
}
```

**示例：**

```typescript
import { parseSemver } from '@cat-kit/maintenance'

// 基础版本
const v1 = parseSemver('1.2.3')
// { major: 1, minor: 2, patch: 3, raw: '1.2.3' }

// 带预发布标识
const v2 = parseSemver('2.0.0-alpha.1')
// { major: 2, minor: 0, patch: 0, prerelease: ['alpha', '1'], raw: '2.0.0-alpha.1' }

// 带构建元数据
const v3 = parseSemver('1.0.0+build.123')
// { major: 1, minor: 0, patch: 0, build: 'build.123', raw: '1.0.0+build.123' }

// 支持 v 前缀
const v4 = parseSemver('v1.2.3')
// { major: 1, minor: 2, patch: 3, raw: 'v1.2.3' }
```

**错误处理：**

```typescript
import { parseSemver, SemverError } from '@cat-kit/maintenance'

try {
  parseSemver('invalid')
} catch (error) {
  if (error instanceof SemverError) {
    console.error('无效的版本号:', error.message)
  }
}
```

### isValidSemver

验证版本号格式是否有效。

**函数签名：**

```typescript
function isValidSemver(version: string): boolean
```

**示例：**

```typescript
import { isValidSemver } from '@cat-kit/maintenance'

isValidSemver('1.2.3')           // true
isValidSemver('1.2.3-alpha.1')   // true
isValidSemver('v2.0.0')          // true
isValidSemver('1.0.0+build')     // true
isValidSemver('invalid')         // false
isValidSemver('1.2')             // false
isValidSemver('1.2.3.4')         // false
```

## 版本号比较

### compareSemver

比较两个版本号的大小。

**函数签名：**

```typescript
function compareSemver(
  v1: string | SemverVersion,
  v2: string | SemverVersion
): number
```

**返回值：**

| 返回值 | 说明 |
| --- | --- |
| `1` | v1 > v2 |
| `-1` | v1 < v2 |
| `0` | v1 = v2 |

**比较规则：**

1. 先比较主版本号
2. 再比较次版本号
3. 再比较修订号
4. 有预发布标识的版本小于没有的（`1.0.0-alpha < 1.0.0`）
5. 预发布标识按照 semver 规范比较

**示例：**

```typescript
import { compareSemver } from '@cat-kit/maintenance'

// 基础比较
compareSemver('2.0.0', '1.0.0')         // 1
compareSemver('1.0.0', '2.0.0')         // -1
compareSemver('1.0.0', '1.0.0')         // 0

// 次版本号比较
compareSemver('1.2.0', '1.1.0')         // 1
compareSemver('1.0.1', '1.0.0')         // 1

// 预发布版本比较
compareSemver('1.0.0-alpha', '1.0.0')   // -1 (预发布版本更小)
compareSemver('1.0.0-beta', '1.0.0-alpha')  // 1 (beta > alpha)
compareSemver('1.0.0-alpha.2', '1.0.0-alpha.1')  // 1

// 用于排序
const versions = ['1.0.0', '2.0.0', '1.5.0', '1.0.0-alpha']
versions.sort((a, b) => compareSemver(a, b))
// ['1.0.0-alpha', '1.0.0', '1.5.0', '2.0.0']
```

## 版本号递增

### incrementVersion

按照指定类型递增版本号。

**函数签名：**

```typescript
function incrementVersion(
  version: string,
  type: BumpType,
  preid?: string
): string
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `version` | `string` | - | 当前版本号 |
| `type` | `BumpType` | - | 递增类型 |
| `preid` | `string` | `'pre'` | 预发布标识前缀 |

**递增类型 (BumpType)：**

| 类型 | 说明 | 示例 |
| --- | --- | --- |
| `major` | 主版本号递增 | `1.2.3` → `2.0.0` |
| `minor` | 次版本号递增 | `1.2.3` → `1.3.0` |
| `patch` | 修订号递增 | `1.2.3` → `1.2.4` |
| `premajor` | 主版本预发布 | `1.2.3` → `2.0.0-alpha.0` |
| `preminor` | 次版本预发布 | `1.2.3` → `1.3.0-alpha.0` |
| `prepatch` | 修订号预发布 | `1.2.3` → `1.2.4-alpha.0` |
| `prerelease` | 递增预发布版本号 | `1.0.0-alpha.0` → `1.0.0-alpha.1` |

**示例：**

```typescript
import { incrementVersion } from '@cat-kit/maintenance'

// 标准递增
incrementVersion('1.2.3', 'major')   // '2.0.0'
incrementVersion('1.2.3', 'minor')   // '1.3.0'
incrementVersion('1.2.3', 'patch')   // '1.2.4'

// 预发布版本
incrementVersion('1.2.3', 'premajor', 'alpha')  // '2.0.0-alpha.0'
incrementVersion('1.2.3', 'preminor', 'beta')   // '1.3.0-beta.0'
incrementVersion('1.2.3', 'prepatch', 'rc')     // '1.2.4-rc.0'

// 递增预发布号
incrementVersion('1.0.0-alpha.0', 'prerelease') // '1.0.0-alpha.1'
incrementVersion('1.0.0-alpha.5', 'prerelease') // '1.0.0-alpha.6'

// 从正式版创建预发布
incrementVersion('1.0.0', 'prerelease', 'alpha') // '1.0.0-alpha.0'
```

## 批量版本更新

### bumpVersion

批量更新 monorepo 中所有（或指定）包的版本号。

**函数签名：**

```typescript
function bumpVersion(
  config: MonorepoConfig,
  options: BumpOptions
): Promise<BumpResult>
```

**参数：**

```typescript
interface BumpOptions {
  /** 更新类型 */
  type: BumpType
  /** 新版本号（如果指定则忽略 type） */
  version?: string
  /** 预发布标识（如 'alpha', 'beta'，用于 pre* 类型） */
  preid?: string
  /** 要更新的包（不指定则更新所有非私有包） */
  packages?: string[]
  /** 是否同步 peerDependencies（默认 true） */
  syncPeer?: boolean
}
```

**返回值：**

```typescript
interface BumpResult {
  /** 新版本号 */
  version: string
  /** 已更新的包列表 */
  updated: Array<{
    /** 包名称 */
    name: string
    /** 旧版本 */
    oldVersion: string
    /** 新版本 */
    newVersion: string
  }>
}
```

**示例：**

```typescript
import { bumpVersion } from '@cat-kit/maintenance'

// 递增所有包的 minor 版本
const result = await bumpVersion(
  { rootDir: '/path/to/monorepo' },
  { type: 'minor', syncPeer: true }
)

console.log(`新版本: ${result.version}`)
result.updated.forEach(pkg => {
  console.log(`  ${pkg.name}: ${pkg.oldVersion} → ${pkg.newVersion}`)
})
```

**指定版本号：**

```typescript
// 设置特定版本号
const result = await bumpVersion(
  { rootDir: '/path/to/monorepo' },
  {
    type: 'patch', // 会被忽略，因为指定了 version
    version: '2.0.0'
  }
)
```

**只更新部分包：**

```typescript
// 只更新指定的包
const result = await bumpVersion(
  { rootDir: '/path/to/monorepo' },
  {
    type: 'patch',
    packages: ['@my-org/core', '@my-org/utils']
  }
)
```

**创建预发布版本：**

```typescript
// 创建 alpha 预发布版本
const result = await bumpVersion(
  { rootDir: '/path/to/monorepo' },
  {
    type: 'prerelease',
    preid: 'alpha'
  }
)
// 1.0.0 → 1.0.0-alpha.0
// 1.0.0-alpha.0 → 1.0.0-alpha.1
```

### syncPeerDependencies

同步 `peerDependencies` 中的版本约束。

**函数签名：**

```typescript
function syncPeerDependencies(
  config: MonorepoConfig,
  version: string
): Promise<void>
```

**说明：**

此函数会遍历所有包，将 `peerDependencies` 中的内部包版本更新为 `>=version` 格式。

**示例：**

```typescript
import { syncPeerDependencies } from '@cat-kit/maintenance'

// 将所有包的 peerDependencies 中的 cat-kit 包版本更新为 >=1.2.3
await syncPeerDependencies(
  { rootDir: '/path/to/monorepo' },
  '1.2.3'
)
```

**更新前：**

```json
{
  "name": "@my-org/utils",
  "peerDependencies": {
    "@my-org/core": ">=1.0.0"
  }
}
```

**更新后：**

```json
{
  "name": "@my-org/utils",
  "peerDependencies": {
    "@my-org/core": ">=1.2.3"
  }
}
```

### syncDependencies

同步 `dependencies` 中的工作空间版本约束。

**函数签名：**

```typescript
function syncDependencies(
  config: MonorepoConfig,
  version: string
): Promise<void>
```

**说明：**

此函数会将 `dependencies` 中使用 `workspace:*` 的包替换为具体版本号 `^version`。

**示例：**

```typescript
import { syncDependencies } from '@cat-kit/maintenance'

await syncDependencies(
  { rootDir: '/path/to/monorepo' },
  '1.2.3'
)
```

**更新前：**

```json
{
  "dependencies": {
    "@my-org/core": "workspace:*"
  }
}
```

**更新后：**

```json
{
  "dependencies": {
    "@my-org/core": "^1.2.3"
  }
}
```

## 类型定义

### SemverVersion

```typescript
interface SemverVersion {
  major: number
  minor: number
  patch: number
  prerelease?: string[]
  build?: string
  raw: string
}
```

### BumpType

```typescript
type BumpType =
  | 'major'
  | 'minor'
  | 'patch'
  | 'premajor'
  | 'preminor'
  | 'prepatch'
  | 'prerelease'
```

### BumpOptions

```typescript
interface BumpOptions {
  type: BumpType
  version?: string
  preid?: string
  packages?: string[]
  syncPeer?: boolean
}
```

### BumpResult

```typescript
interface BumpResult {
  version: string
  updated: Array<{
    name: string
    oldVersion: string
    newVersion: string
  }>
}
```

## 实际应用

### 发布脚本

```typescript
// scripts/release.ts
import { bumpVersion, compareSemver } from '@cat-kit/maintenance'

type ReleaseType = 'major' | 'minor' | 'patch' | 'alpha' | 'beta' | 'rc'

async function release(type: ReleaseType) {
  const config = { rootDir: process.cwd() }

  let options: Parameters<typeof bumpVersion>[1]

  switch (type) {
    case 'alpha':
    case 'beta':
    case 'rc':
      options = { type: 'prerelease', preid: type, syncPeer: true }
      break
    default:
      options = { type, syncPeer: true }
  }

  const result = await bumpVersion(config, options)

  console.log(`\n🚀 发布 v${result.version}\n`)
  console.log('已更新的包:')
  result.updated.forEach(pkg => {
    console.log(`  📦 ${pkg.name}: ${pkg.oldVersion} → ${pkg.newVersion}`)
  })

  return result
}

// 使用: bun run scripts/release.ts minor
const type = process.argv[2] as ReleaseType || 'patch'
release(type)
```

### 版本验证

```typescript
import { isValidSemver, compareSemver, parseSemver } from '@cat-kit/maintenance'

function validateVersion(
  currentVersion: string,
  newVersion: string
): { valid: boolean; error?: string } {
  // 检查格式
  if (!isValidSemver(newVersion)) {
    return { valid: false, error: '版本号格式无效' }
  }

  // 确保新版本大于当前版本
  if (compareSemver(newVersion, currentVersion) <= 0) {
    return {
      valid: false,
      error: `新版本 (${newVersion}) 必须大于当前版本 (${currentVersion})`
    }
  }

  // 检查主版本号是否跳跃过大
  const current = parseSemver(currentVersion)
  const next = parseSemver(newVersion)
  if (next.major - current.major > 1) {
    return {
      valid: false,
      error: '主版本号不能跳跃超过 1'
    }
  }

  return { valid: true }
}
```

### 版本排序

```typescript
import { compareSemver } from '@cat-kit/maintenance'

const tags = [
  'v1.0.0',
  'v2.0.0-alpha.1',
  'v1.5.0',
  'v2.0.0',
  'v1.0.0-beta.1',
  'v2.0.0-alpha.2'
]

// 升序排序
const sorted = tags.sort((a, b) =>
  compareSemver(a.replace('v', ''), b.replace('v', ''))
)
// ['v1.0.0-beta.1', 'v1.0.0', 'v1.5.0', 'v2.0.0-alpha.1', 'v2.0.0-alpha.2', 'v2.0.0']

// 获取最新版本
const latest = sorted[sorted.length - 1]
// 'v2.0.0'

// 获取最新稳定版本（排除预发布）
const latestStable = sorted
  .filter(v => !v.includes('-'))
  .pop()
// 'v2.0.0'
```

