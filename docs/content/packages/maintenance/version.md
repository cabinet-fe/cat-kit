---
title: 版本管理
description: '符合 semver 规范的版本号解析、比较、递增等功能'
outline: deep
---

# 版本管理

## 介绍

本页介绍 `@cat-kit/maintenance` 的语义化版本能力，包含版本解析、比较、递增与依赖同步。

## 快速使用

```typescript
import {
  parseSemver,
  compareSemver,
  incrementVersion,
  syncPeerDependencies
} from '@cat-kit/maintenance'

const parsed = parseSemver('1.2.3-alpha.1')
const gt = compareSemver('1.2.3', '1.2.2') > 0
const next = incrementVersion('1.2.3', 'minor')

await syncPeerDependencies([{ dir: '/abs/path/to/packages/fe', name: '@cat-kit/fe' }], '1.3.0')

console.log(parsed, gt, next)
```

## API参考

本节按模块列出 API 签名、参数、返回值与使用示例。

## parseSemver

解析版本号字符串为结构化对象。

```typescript
function parseSemver(version: string): SemverVersion
```

**返回值：**

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

**示例：**

```typescript
import { parseSemver } from '@cat-kit/maintenance'

parseSemver('1.2.3')
// { major: 1, minor: 2, patch: 3, raw: '1.2.3' }

parseSemver('2.0.0-alpha.1')
// { major: 2, minor: 0, patch: 0, prerelease: ['alpha', '1'], raw: '2.0.0-alpha.1' }

parseSemver('v1.0.0+build.123')
// { major: 1, minor: 0, patch: 0, build: 'build.123', raw: 'v1.0.0+build.123' }
```

## isValidSemver

验证版本号格式是否有效。

```typescript
function isValidSemver(version: string): boolean
```

**示例：**

```typescript
import { isValidSemver } from '@cat-kit/maintenance'

isValidSemver('1.2.3') // true
isValidSemver('1.2.3-alpha.1') // true
isValidSemver('v2.0.0') // true
isValidSemver('invalid') // false
isValidSemver('1.2') // false
```

## compareSemver

比较两个版本号的大小。

```typescript
function compareSemver(v1: string | SemverVersion, v2: string | SemverVersion): number
```

**返回值：**

| 值   | 说明    |
| ---- | ------- |
| `1`  | v1 > v2 |
| `-1` | v1 < v2 |
| `0`  | v1 = v2 |

**比较规则：**

1. 先比较主版本号 → 次版本号 → 修订号
2. 有预发布标识的版本更小（`1.0.0-alpha < 1.0.0`）

**示例：**

```typescript
import { compareSemver } from '@cat-kit/maintenance'

compareSemver('2.0.0', '1.0.0') // 1
compareSemver('1.0.0', '2.0.0') // -1
compareSemver('1.0.0-alpha', '1.0.0') // -1

// 排序
const versions = ['1.0.0', '2.0.0', '1.5.0', '1.0.0-alpha']
versions.sort(compareSemver)
// ['1.0.0-alpha', '1.0.0', '1.5.0', '2.0.0']
```

## incrementVersion

按指定类型递增版本号。

```typescript
function incrementVersion(version: string, type: BumpType, preid?: string): string
```

**递增类型：**

| 类型         | 说明         | 示例                              |
| ------------ | ------------ | --------------------------------- |
| `major`      | 主版本号递增 | `1.2.3` → `2.0.0`                 |
| `minor`      | 次版本号递增 | `1.2.3` → `1.3.0`                 |
| `patch`      | 修订号递增   | `1.2.3` → `1.2.4`                 |
| `premajor`   | 主版本预发布 | `1.2.3` → `2.0.0-alpha.0`         |
| `preminor`   | 次版本预发布 | `1.2.3` → `1.3.0-alpha.0`         |
| `prepatch`   | 修订号预发布 | `1.2.3` → `1.2.4-alpha.0`         |
| `prerelease` | 递增预发布号 | `1.0.0-alpha.0` → `1.0.0-alpha.1` |

**示例：**

```typescript
import { incrementVersion } from '@cat-kit/maintenance'

incrementVersion('1.2.3', 'major') // '2.0.0'
incrementVersion('1.2.3', 'minor') // '1.3.0'
incrementVersion('1.2.3', 'patch') // '1.2.4'
incrementVersion('1.2.3', 'premajor', 'alpha') // '2.0.0-alpha.0'
incrementVersion('1.0.0-alpha.0', 'prerelease') // '1.0.0-alpha.1'
```

## bumpVersion

更新单个包的版本号。

```typescript
function bumpVersion(pkgPath: string, options: BumpOptions): Promise<BumpResult>
```

**参数：**

| 参数              | 类型       | 说明                        |
| ----------------- | ---------- | --------------------------- |
| `pkgPath`         | `string`   | package.json 路径或所在目录 |
| `options.type`    | `BumpType` | 更新类型                    |
| `options.version` | `string`   | 直接指定版本号（忽略 type） |
| `options.preid`   | `string`   | 预发布标识，默认 `'alpha'`  |

**返回值：**

```typescript
interface BumpResult {
  version: string
  updated: Array<{ name: string; oldVersion: string; newVersion: string }>
}
```

**示例：**

```typescript
import { bumpVersion } from '@cat-kit/maintenance'

// 递增版本
const result = await bumpVersion('packages/core', { type: 'minor' })
console.log(result.version) // '1.3.0'

// 指定版本
await bumpVersion('packages/core', { version: '2.0.0' })

// 预发布
await bumpVersion('packages/core', { type: 'prerelease', preid: 'beta' })
```

## syncPeerDependencies

同步 `peerDependencies` 中的版本约束，更新为 `>=version` 格式。

```typescript
function syncPeerDependencies(
  packages: Array<{ dir: string }>,
  version: string,
  options?: { only?: string[] }
): Promise<void>
```

**示例：**

```typescript
import { syncPeerDependencies } from '@cat-kit/maintenance'

const packages = [{ dir: '/path/to/packages/core' }, { dir: '/path/to/packages/fe' }]

await syncPeerDependencies(packages, '1.2.3')
```

**更新前后：**

```json
// 更新前
{ "peerDependencies": { "@cat-kit/core": ">=1.0.0" } }

// 更新后
{ "peerDependencies": { "@cat-kit/core": ">=1.2.3" } }
```

## syncDependencies

将 `dependencies` 中的 `workspace:*` 替换为具体版本号 `^version`。

```typescript
function syncDependencies(
  packages: Array<{ dir: string }>,
  version: string,
  options?: { only?: string[] }
): Promise<void>
```

**示例：**

```typescript
import { syncDependencies } from '@cat-kit/maintenance'

await syncDependencies(packages, '1.2.3')
```

**更新前后：**

```json
// 更新前
{ "dependencies": { "@cat-kit/core": "workspace:*" } }

// 更新后
{ "dependencies": { "@cat-kit/core": "^1.2.3" } }
```

## 使用 Monorepo 类

推荐使用 `Monorepo` 类进行批量版本更新：

```typescript
import { Monorepo } from '@cat-kit/maintenance'

const repo = new Monorepo()
const group = repo.group(['@cat-kit/core', '@cat-kit/fe', '@cat-kit/http'])

const result = await group.bumpVersion({
  type: 'minor',
  syncPeer: true, // 自动同步 peerDependencies
  syncDeps: true // 自动同步 workspace:*
})

console.log(`新版本: ${result.version}`)
```

## 类型定义

```typescript
type BumpType = 'major' | 'minor' | 'patch' | 'premajor' | 'preminor' | 'prepatch' | 'prerelease'

interface BumpOptions {
  type: BumpType
  version?: string
  preid?: string
}

interface BumpResult {
  version: string
  updated: Array<{ name: string; oldVersion: string; newVersion: string }>
}
```

## 实际应用

### 发布脚本

```typescript
import { Monorepo } from '@cat-kit/maintenance'

type ReleaseType = 'major' | 'minor' | 'patch' | 'alpha' | 'beta'

async function release(type: ReleaseType) {
  const repo = new Monorepo()
  const group = repo.group(['@cat-kit/core', '@cat-kit/fe', '@cat-kit/http'])

  const isPrerelease = ['alpha', 'beta'].includes(type)

  const result = await group.bumpVersion({
    type: isPrerelease ? 'prerelease' : type,
    preid: isPrerelease ? type : undefined,
    syncPeer: true,
    syncDeps: true
  })

  console.log(`🚀 发布 v${result.version}`)
}
```

### 版本验证

```typescript
import { isValidSemver, compareSemver } from '@cat-kit/maintenance'

function validateVersion(current: string, next: string) {
  if (!isValidSemver(next)) {
    return { valid: false, error: '版本号格式无效' }
  }

  if (compareSemver(next, current) <= 0) {
    return { valid: false, error: '新版本必须大于当前版本' }
  }

  return { valid: true }
}
```
