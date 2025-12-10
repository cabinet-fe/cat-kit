# 设计文档：完善分组发布流程

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    release/release.ts                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐│
│  │ validate│→ │  test   │→ │ choose  │→ │ releaseGroup()  ││
│  │   ()    │  │   ()    │  │ Group() │  │                 ││
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    releaseGroup() 流程                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  build  │→ │ choose  │→ │  bump   │→ │  git    │        │
│  │   ()    │  │ Version │  │ Version │  │ commit  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                │             │
│                                                ▼             │
│                              ┌─────────────────────────────┐│
│                              │     publish (并行)          ││
│                              │  ┌───┐ ┌───┐ ┌───┐ ┌───┐   ││
│                              │  │pkg│ │pkg│ │pkg│ │pkg│   ││
│                              │  └───┘ └───┘ └───┘ └───┘   ││
│                              └─────────────────────────────┘│
│                                          │                   │
│                              ┌───────────┴───────────┐      │
│                              ▼                       ▼      │
│                         ┌────────┐             ┌────────┐   │
│                         │ 成功   │             │ 失败   │   │
│                         │ 完成   │             │ 回滚?  │   │
│                         └────────┘             └────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 核心设计决策

### 1. 版本选择交互

使用 `@inquirer/prompts` 的 `select` 组件，根据当前版本动态生成选项：

```typescript
// 示例选项（当前版本 1.2.3）
[
  { value: 'patch',      name: 'patch      → 1.2.4' },
  { value: 'minor',      name: 'minor      → 1.3.0' },
  { value: 'major',      name: 'major      → 2.0.0' },
  { value: 'prepatch',   name: 'prepatch   → 1.2.4-alpha.0' },
  { value: 'preminor',   name: 'preminor   → 1.3.0-alpha.0' },
  { value: 'premajor',   name: 'premajor   → 2.0.0-alpha.0' },
  { value: 'prerelease', name: 'prerelease → 1.2.4-alpha.0' },
]

// 如果当前是预发布版本（1.2.3-alpha.0），prerelease 显示为：
{ value: 'prerelease', name: 'prerelease → 1.2.3-alpha.1' }
```

### 2. 并行发布策略

修改 `WorkspaceGroup.publish()` 方法，使用 `Promise.all` 并行执行：

```typescript
async publish(options: GroupPublishOptions = {}): Promise<PublishGroupResult> {
  const results = await Promise.all(
    workspaces
      .filter(ws => !ws.private || !skipPrivate)
      .map(ws => publishPackage({ cwd: ws.dir, ...options })
        .then(() => ({ name: ws.name, success: true }))
        .catch(err => ({ name: ws.name, success: false, error: err }))
      )
  )
  return { results, hasFailure: results.some(r => !r.success) }
}
```

### 3. 回滚机制

采用"保存快照 → 执行 → 失败时恢复"的策略：

```typescript
interface RollbackContext {
  /** 原始版本号 */
  originalVersion: string
  /** 需要回滚的包目录列表 */
  packageDirs: string[]
  /** Git 提交哈希（用于 reset） */
  commitHash?: string
}
```

回滚流程：
1. **版本回滚**：将每个包的 `package.json` 中的 version 字段恢复为原始版本
2. **Git 回滚**：提示用户是否执行 `git reset --hard <commitHash>^`

### 4. 错误处理策略

- 构建失败：直接终止，无需回滚
- 版本更新失败：直接终止，无需回滚（尚未修改文件）
- Git 提交失败：回滚版本号
- 发布失败：提示用户选择是否回滚（版本号 + Git）

## 类型定义

```typescript
/** 发布组结果 */
interface PublishGroupResult {
  results: Array<{
    name: string
    success: boolean
    error?: Error
  }>
  hasFailure: boolean
}

/** 发布流程选项 */
interface ReleaseOptions {
  /** 是否跳过测试 */
  skipTest?: boolean
  /** 是否跳过构建 */
  skipBuild?: boolean
  /** 是否 dry-run 模式 */
  dryRun?: boolean
}
```

## 用户交互流程

```
$ bun run release/release.ts

✓ 验证通过
✓ 测试通过

? 选择要发布的组
  ❯ main        - @cat-kit/core, @cat-kit/fe, @cat-kit/be, @cat-kit/http, @cat-kit/excel
    maintenance - @cat-kit/maintenance
    tsconfig    - @cat-kit/tsconfig

⚡ 第1轮构建 (1 个包)
  ✓ @cat-kit/core 120ms
⚡ 第2轮构建 (4 个包)
  ✓ @cat-kit/fe 90ms
  ✓ @cat-kit/be 85ms
  ✓ @cat-kit/http 110ms
  ✓ @cat-kit/excel 95ms
✨ 构建完成: 5 成功, 0 失败 500ms

当前版本: 1.2.3

? 选择版本类型
  ❯ patch      → 1.2.4
    minor      → 1.3.0
    major      → 2.0.0
    prepatch   → 1.2.4-alpha.0
    preminor   → 1.3.0-alpha.0
    premajor   → 2.0.0-alpha.0
    prerelease → 1.2.4-alpha.0

✓ 版本更新到 1.2.4
✓ Git 提交: chore(release): v1.2.4

发布中...
  ✓ @cat-kit/core
  ✓ @cat-kit/fe
  ✓ @cat-kit/be
  ✓ @cat-kit/http
  ✓ @cat-kit/excel

✨ 发布完成！
```

### 失败时的交互

```
发布中...
  ✓ @cat-kit/core
  ✓ @cat-kit/fe
  ✗ @cat-kit/be (ENEEDAUTH)
  ✗ @cat-kit/http (ENEEDAUTH)
  ✓ @cat-kit/excel

⚠ 发布失败: 2 个包发布失败

? 是否回滚版本变更？
  ❯ 是 - 回滚版本号并重置 Git 提交
    否 - 保留当前状态，稍后手动处理

正在回滚...
✓ 版本已回滚到 1.2.3
✓ Git 已重置
```
