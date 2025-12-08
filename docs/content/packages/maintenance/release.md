---
title: 发布与 Git 辅助
sidebarTitle: 发布与 Git
order: 5
---

# 发布与 Git 辅助 (release)

发布模块提供 git tag、提交推送以及 npm 发布的薄封装，简化常见的发布流水线，并支持自定义 registry（如 npm 镜像）与 2FA。

## createGitTag

创建（可选推送）带注释的 git tag。

**函数签名：**

```typescript
function createGitTag(options: GitTagOptions): Promise<GitTagResult>
```

**选项：**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cwd` | `string` | - | 仓库根目录 |
| `tag` | `string` | - | tag 名称，必填 |
| `message` | `string` | `tag` 文本 | 注释内容 |
| `push` | `boolean` | `false` | 是否推送到远端 |
| `remote` | `string` | `'origin'` | 推送远端 |
| `force` | `boolean` | `false` | 是否允许覆盖已有 tag |

**示例：**

```typescript
import { createGitTag } from '@cat-kit/maintenance'

await createGitTag({
  cwd: '/path/to/repo',
  tag: 'v1.2.3',
  message: '发布 1.2.3',
  push: true,
  force: true
})
```

## commitAndPush

执行 `git add/commit/push`，支持自动检测当前分支并可选推送全部 tag。

**函数签名：**

```typescript
function commitAndPush(options: GitCommitAndPushOptions): Promise<GitCommitResult>
```

**选项：**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cwd` | `string` | - | 仓库根目录 |
| `message` | `string` | - | 提交信息，必填 |
| `addAll` | `boolean` | `true` | 是否执行 `git add -A` |
| `allowEmpty` | `boolean` | `false` | 是否允许空提交 |
| `remote` | `string` | `'origin'` | 推送远端 |
| `branch` | `string` | 当前分支 | 推送分支，未填时自动检测 |
| `pushTags` | `boolean` | `false` | 是否同时推送所有 tag |

**示例：**

```typescript
import { commitAndPush } from '@cat-kit/maintenance'

const result = await commitAndPush({
  cwd: '/path/to/repo',
  message: 'chore: release',
  pushTags: true
})

console.log(result.branch) // 当前推送分支
console.log(result.commitHash) // 最新提交哈希
```

## publishPackage

封装 `npm publish`，支持切换 registry、dry-run、2FA 以及 provenance。

**函数签名：**

```typescript
function publishPackage(options: PublishOptions): Promise<PublishResult>
```

**选项：**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cwd` | `string` | - | 包目录（包含 package.json） |
| `registry` | `string` | npm 官方源 | 自定义 registry（如 npm 镜像） |
| `tag` | `string` | `'latest'` | 发布 dist-tag |
| `otp` | `string` | - | 2FA 动态验证码 |
| `dryRun` | `boolean` | `false` | 只演练，不上传 |
| `access` | `'public' \| 'restricted'` | - | 包访问级别 |
| `provenance` | `boolean` | `false` | 启用 provenance（npm 9+） |

**示例：**

```typescript
import { publishPackage } from '@cat-kit/maintenance'

await publishPackage({
  cwd: '/path/to/pkg',
  registry: 'https://registry.npmmirror.com',
  tag: 'next',
  otp: '123456',
  dryRun: true,
  access: 'public',
  provenance: true
})
```

## 推荐发布流水线

```typescript
import {
  commitAndPush,
  createGitTag,
  publishPackage
} from '@cat-kit/maintenance'

const cwd = '/path/to/repo'

// 1. 提交并推送
await commitAndPush({ cwd, message: 'chore: release', pushTags: false })

// 2. 打 tag 并推送
await createGitTag({ cwd, tag: 'v1.2.3', message: '发布 1.2.3', push: true })

// 3. 发布 npm（可切换镜像源）
await publishPackage({
  cwd: '/path/to/pkg',
  registry: 'https://registry.npmmirror.com',
  tag: 'latest'
})
```

## 错误处理

所有 git 相关函数抛出 `GitError`，发布函数抛出 `PublishError`，可用于精确捕获：

```typescript
import { createGitTag, publishPackage, PublishError, GitError } from '@cat-kit/maintenance'

try {
  await createGitTag({ cwd: '/repo', tag: 'v1.2.3' })
  await publishPackage({ cwd: '/pkg' })
} catch (error) {
  if (error instanceof PublishError) {
    console.error('npm 发布失败', error.message)
  } else if (error instanceof GitError) {
    console.error('git 操作失败', error.message)
  }
}
```
