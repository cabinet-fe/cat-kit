# agent-context 源码重构：消灭 AI 垃圾代码

> 状态: 已执行

## 目标

对 `packages/agent-context/src/` 进行纯重构：消除重复代码、提取硬编码为常量、统一模式、移除 `.js` 导入后缀。不改变任何外部行为。

## 内容

**执行顺序：1 → 2 → 3 → 4 → 5 → 6 → 7 → 8**

### 1. 移除 import 中的 `.js` 后缀

当前 `moduleResolution: "bundler"`，`.js` 后缀不必要。扫描所有包含 `.js` import 的文件，将 `from '...xxx.js'` 改为 `from '...xxx'`。

### 2. 提取共享常量到 `src/constants.ts`

仅提取**确实在多处重复定义或使用**的常量：

| 常量名 | 值 | 重复位置 |
|--------|-----|----------|
| `SKILL_NAME` | `'ac-workflow'` | `tools.ts` + `content/index.ts` 各定义一次 |
| `AC_ROOT_DIR` | `'.agent-context'` | `reader.ts` + `commands/init.ts` |
| `PLAN_FILE_NAME` | `'plan.md'` | `reader.ts`(2 次) + `validator.ts`(1 次) + `indexer.ts`(1 次) |
| `DONE_DIR` | `'done'` | `archiver.ts` + `reader.ts` |
| `ENV_FILE_NAME` | `'.env'` | `scope.ts`(2 次) + `commands/init.ts`(1 次) |

不提取仅单处使用的常量（`SKILL_FILE_NAME`、`PREPARING_DIR`、`INDEX_FILE_NAME`）。

`SCOPE_RE` 视步骤 4 结果决定：若 `commands/init.ts` 中的正则使用被消除，则 `SCOPE_RE` 仅在 `scope.ts` 内部使用，保留为模块私有常量不提取。

### 3. 消灭 `printRunSummary` / `printCheckResult` 复制粘贴

`commands/install.ts` 和 `commands/sync.ts` 的 `printRunSummary()` 和 `printCheckResult()` 逐行完全相同。提取到 `src/commands/print-result.ts`：

- 导出 `printRunSummary(result: RunResult, cwd: string): void`
- 导出 `printCheckResult(result: RunResult, cwd: string): void`
- 不提取 `printInstallBanner`（仅 install.ts 使用）
- 不通过 `src/index.ts` 对外导出（内部 CLI 打印逻辑）

### 4. 消除 `commands/init.ts` 中重复的 scope 读取逻辑

`commands/init.ts` 第 20-26 行手动读 `.env` + 匹配 `SCOPE=` 正则提取现有 scope。`context/scope.ts` 的 `resolveScope()` 做了类似的事但**语义不同**：`resolveScope` 找到后直接返回，`init.ts` 找到后走"确认覆盖"流程。

方案：从 `scope.ts` 提取一个 `readExistingScope` 函数供两处共用：

```typescript
export async function readExistingScope(acRoot: string): Promise<string | null> {
  const envPath = join(acRoot, ENV_FILE_NAME)
  if (!existsSync(envPath)) return null
  const content = await readFile(envPath, 'utf-8')
  const match = content.match(SCOPE_RE)
  return match?.[1]?.trim() ?? null
}
```

然后 `resolveScope` 内部改为调用 `readExistingScope`，`commands/init.ts` 也调用 `readExistingScope` 检查现有 scope。

### 5. 合并重复的递归文件遍历函数

`skill-metadata.ts` 的 `listFilesRecursive(dir): Promise<string[]>` 和 `skill-prune.ts` 的 `walkFilesRecursive(dir, out): Promise<void>` 功能完全相同。

保留 `(dir): Promise<string[]>` 签名（更函数式），放到 `src/fs-utils.ts` 导出。`skill-prune.ts` 调用处从：

```typescript
const allFiles: string[] = []
await walkFilesRecursive(skillDir, allFiles)
```

改为：

```typescript
const allFiles = await listFilesRecursive(skillDir)
```

### 6. 统一 tool ID 解析的重复管道

`tools.ts` 的 `parseToolIds()` 和 `prompt-gen.ts` 的 `resolvePromptToolIds()` 中的 split→trim→lowercase→validate→dedup 管道相同。仅抽取纯管道部分，不抽取空输入分支逻辑：

```typescript
export function parseCommaSeparatedIds<T extends string>(
  raw: string,
  isValid: (value: string) => value is T,
  validOptions: readonly T[]
): T[] {
  const parsed = raw.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
  const result: T[] = []
  for (const value of parsed) {
    if (!isValid(value)) {
      throw new Error(`不支持的工具标识: ${value}。可选值: ${validOptions.join(', ')}`)
    }
    if (!result.includes(value)) result.push(value)
  }
  return result
}
```

放在 `tools.ts` 中导出。两处调用者各自保留空输入分支逻辑，仅在非空输入时委托此函数。

### 7. 修复 `indexer.ts` 中非惯用路径操作

第 46、51 行的 `planDir.split('/').pop()` 改为 `basename(planDir) || 'unknown'`，保留 fallback 语义。

### 8. 验证

1. TypeScript 类型检查通过（构建时自动检查）
2. `cd release && bun run bundle.ts` 构建通过
3. 构建产物 `dist/cli.js --help` CLI 可执行
4. `npx agent-context validate` 通过

## 影响范围

- `packages/agent-context/src/constants.ts`（新增）
- `packages/agent-context/src/fs-utils.ts`（新增）
- `packages/agent-context/src/commands/print-result.ts`（新增）
- `packages/agent-context/src/cli.ts`
- `packages/agent-context/src/runner.ts`
- `packages/agent-context/src/tools.ts`
- `packages/agent-context/src/skill-metadata.ts`
- `packages/agent-context/src/skill-prune.ts`
- `packages/agent-context/src/content/index.ts`
- `packages/agent-context/src/content/actions/index.ts`
- `packages/agent-context/src/content/actions/init.ts`
- `packages/agent-context/src/content/actions/patch.ts`
- `packages/agent-context/src/content/actions/plan.ts`
- `packages/agent-context/src/content/actions/replan.ts`
- `packages/agent-context/src/content/actions/review.ts`
- `packages/agent-context/src/content/actions/rush.ts`
- `packages/agent-context/src/content/actions/implement.ts`
- `packages/agent-context/src/context/index.ts`
- `packages/agent-context/src/context/archiver.ts`
- `packages/agent-context/src/context/indexer.ts`
- `packages/agent-context/src/context/reader.ts`
- `packages/agent-context/src/context/scope.ts`
- `packages/agent-context/src/context/validator.ts`
- `packages/agent-context/src/commands/done.ts`
- `packages/agent-context/src/commands/index-cmd.ts`
- `packages/agent-context/src/commands/init.ts`
- `packages/agent-context/src/commands/install.ts`
- `packages/agent-context/src/commands/prompt-gen.ts`
- `packages/agent-context/src/commands/status.ts`
- `packages/agent-context/src/commands/sync.ts`
- `packages/agent-context/src/commands/validate.ts`

## 历史补丁

- patch-1: 修复 `print-result.ts` 硬编码 `'ac-workflow'`，`index-cmd.ts` / `validate.ts` 硬编码 `'.agent-context'` 提示文字，统一使用常量
