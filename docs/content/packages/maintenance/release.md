---
title: 发布与 Git
description: 'Git tag、提交推送以及 npm 发布的工具函数'
outline: deep
---

# 发布与 Git

发布模块提供 git tag、提交推送以及 npm 发布的封装，简化发布流水线。

## createGitTag

创建并可选推送带注释的 git tag。

```typescript
function createGitTag(options: GitTagOptions): Promise<GitTagResult>
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cwd` | `string` | - | 仓库根目录 |
| `tag` | `string` | - | tag 名称（必填） |
| `message` | `string` | `tag` | 注释内容 |
| `push` | `boolean` | `false` | 是否推送到远端 |
| `remote` | `string` | `'origin'` | 推送远端 |
| `force` | `boolean` | `false` | 是否覆盖已有 tag |

**示例：**

```typescript
import { createGitTag } from '@cat-kit/maintenance'

await createGitTag({
  cwd: '/path/to/repo',
  tag: 'v1.2.3',
  message: '发布 1.2.3',
  push: true
})

// 强制覆盖
await createGitTag({
  cwd: '/path/to/repo',
  tag: 'v1.2.3',
  force: true,
  push: true
})
```

## commitAndPush

执行 `git add/commit/push`，支持自动检测当前分支。

```typescript
function commitAndPush(options: GitCommitAndPushOptions): Promise<GitCommitResult>
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cwd` | `string` | - | 仓库根目录 |
| `message` | `string` | - | 提交信息（必填） |
| `addAll` | `boolean` | `true` | 是否执行 `git add -A` |
| `allowEmpty` | `boolean` | `false` | 是否允许空提交 |
| `remote` | `string` | `'origin'` | 推送远端 |
| `branch` | `string` | 当前分支 | 推送分支 |
| `pushTags` | `boolean` | `false` | 是否同时推送所有 tag |

**返回值：**

```typescript
interface GitCommitResult {
  commitHash: string
  branch: string
}
```

**示例：**

```typescript
import { commitAndPush } from '@cat-kit/maintenance'

const result = await commitAndPush({
  cwd: '/path/to/repo',
  message: 'chore: release v1.2.3',
  pushTags: true
})

console.log(result.branch)     // 'main'
console.log(result.commitHash) // 'abc123...'
```

## publishPackage

封装 `npm publish`，支持切换 registry、dry-run、2FA 以及 provenance。

```typescript
function publishPackage(options: PublishOptions): Promise<PublishResult>
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cwd` | `string` | - | 包目录 |
| `registry` | `string` | npm 官方源 | 自定义 registry |
| `tag` | `string` | `'latest'` | 发布 dist-tag |
| `otp` | `string` | - | 2FA 动态验证码 |
| `dryRun` | `boolean` | `false` | 只演练，不上传 |
| `access` | `'public' \| 'restricted'` | - | 包访问级别 |
| `provenance` | `boolean` | `false` | 启用 provenance（npm 9+） |
| `workspace` | `string[]` | - | 指定工作区发布 |
| `workspaces` | `boolean` | - | 发布所有工作区 |

**示例：**

```typescript
import { publishPackage } from '@cat-kit/maintenance'

// 单包发布
await publishPackage({
  cwd: '/path/to/pkg',
  registry: 'https://registry.npmmirror.com',
  tag: 'latest',
  access: 'public'
})

// 带 2FA
await publishPackage({
  cwd: '/path/to/pkg',
  otp: '123456'
})

// Dry run
await publishPackage({
  cwd: '/path/to/pkg',
  dryRun: true
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
  workspaces: true
})
```

## 推荐发布流水线

```typescript
import { commitAndPush, createGitTag, publishPackage } from '@cat-kit/maintenance'

const cwd = '/path/to/repo'

// 1. 提交并推送
await commitAndPush({
  cwd,
  message: 'chore: release v1.2.3'
})

// 2. 打 tag 并推送
await createGitTag({
  cwd,
  tag: 'v1.2.3',
  message: '发布 1.2.3',
  push: true
})

// 3. 发布 npm
await publishPackage({
  cwd: '/path/to/pkg',
  access: 'public'
})
```

## 错误处理

所有 git 相关函数抛出 `GitError`，发布函数抛出 `PublishError`：

```typescript
import { createGitTag, publishPackage, GitError, PublishError } from '@cat-kit/maintenance'

try {
  await createGitTag({ cwd: '/repo', tag: 'v1.2.3' })
  await publishPackage({ cwd: '/pkg' })
} catch (error) {
  if (error instanceof GitError) {
    console.error('Git 操作失败:', error.message)
  } else if (error instanceof PublishError) {
    console.error('npm 发布失败:', error.message)
  }
}
```

## 类型定义

```typescript
interface GitTagOptions {
  cwd: string
  tag: string
  message?: string
  push?: boolean
  remote?: string
  force?: boolean
}

interface GitCommitAndPushOptions {
  cwd: string
  message: string
  addAll?: boolean
  allowEmpty?: boolean
  remote?: string
  branch?: string
  pushTags?: boolean
}

interface GitCommitResult {
  commitHash: string
  branch: string
}

interface PublishOptions {
  cwd: string
  registry?: string
  tag?: string
  otp?: string
  dryRun?: boolean
  access?: 'public' | 'restricted'
  provenance?: boolean
  workspace?: string[]
  workspaces?: boolean
}
```
