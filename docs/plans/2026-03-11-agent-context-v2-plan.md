# agent-context v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 `@cat-kit/agent-context` 新增 CLI 子命令（validate/status/done）和 rush action，将机械性操作下沉到 CLI 以减少 token 消耗。

**Architecture:** 新增 `src/context/` 模块负责 `.agent-context/` 目录的读取、校验和归档操作。CLI 注册三个新子命令调用这些模块。action 模板中 done 替换为 rush，所有模板前置 validate 调用。

**Tech Stack:** TypeScript, Node.js (fs/promises, path), Commander.js, @inquirer/prompts

---

### Task 1: 新增 context 类型定义

**Files:**
- Modify: `packages/agent-context/src/types.ts`

**Step 1: 在 `types.ts` 末尾追加 context 相关类型**

```typescript
// ── Context types ────────────────────────────────────

export type PlanStatus = '未执行' | '已执行'

export interface PlanInfo {
  number: number
  status: PlanStatus
  dir: string
}

export interface ContextSnapshot {
  root: string
  currentPlan: PlanInfo | null
  preparing: PlanInfo[]
  doneCount: number
}

export interface ValidateResult {
  valid: boolean
  errors: string[]
  context: ContextSnapshot | null
}

export interface ArchiveResult {
  archivedTo: string
  promoted: number | null
  remainingPreparing: number
}
```

**Step 2: Commit**

```bash
git add packages/agent-context/src/types.ts
git commit -m "feat(agent-context): add context types for validate/status/done"
```

---

### Task 2: 实现 context/reader.ts

**Files:**
- Create: `packages/agent-context/src/context/reader.ts`

**Step 1: 创建 reader 模块**

读取 `.agent-context/` 目录结构，解析为 `ContextSnapshot`。

关键逻辑：
- 扫描根目录下匹配 `plan-{N}` 的目录 → 当前计划候选
- 扫描 `preparing/plan-{N}` → 待执行队列
- 扫描 `done/` 子目录数量
- 对每个计划目录读取 `plan.md` 第一个 `> 状态: xxx` 行解析状态
- `preparing` 按编号升序排列

```typescript
import { readdir, readFile, stat } from 'node:fs/promises'
import { resolve, basename } from 'node:path'
import { existsSync } from 'node:fs'
import type { ContextSnapshot, PlanInfo, PlanStatus } from '../types'

const CONTEXT_DIR = '.agent-context'
const PLAN_DIR_PATTERN = /^plan-(\d+)$/
const STATUS_LINE_PATTERN = /^>\s*状态:\s*(未执行|已执行)\s*$/m

export async function readContext(cwd: string): Promise<ContextSnapshot | null> {
  const root = resolve(cwd, CONTEXT_DIR)
  if (!existsSync(root)) return null

  const entries = await readdir(root, { withFileTypes: true })
  const currentPlans: PlanInfo[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const match = entry.name.match(PLAN_DIR_PATTERN)
    if (!match) continue
    const num = parseInt(match[1], 10)
    const dir = resolve(root, entry.name)
    const status = await readPlanStatus(dir)
    currentPlans.push({ number: num, status, dir })
  }

  const preparing = await readPreparingQueue(root)
  const doneCount = await countDone(root)

  return {
    root,
    currentPlan: currentPlans.length === 1 ? currentPlans[0] : null,
    preparing,
    doneCount
  }
}

export async function readPlanStatus(planDir: string): Promise<PlanStatus> {
  const planFile = resolve(planDir, 'plan.md')
  if (!existsSync(planFile)) return '未执行'
  const content = await readFile(planFile, 'utf-8')
  const match = content.match(STATUS_LINE_PATTERN)
  return match ? (match[1] as PlanStatus) : '未执行'
}

async function readPreparingQueue(root: string): Promise<PlanInfo[]> {
  const preparingDir = resolve(root, 'preparing')
  if (!existsSync(preparingDir)) return []

  const entries = await readdir(preparingDir, { withFileTypes: true })
  const plans: PlanInfo[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const match = entry.name.match(PLAN_DIR_PATTERN)
    if (!match) continue
    const num = parseInt(match[1], 10)
    const dir = resolve(preparingDir, entry.name)
    const status = await readPlanStatus(dir)
    plans.push({ number: num, status, dir })
  }

  return plans.sort((a, b) => a.number - b.number)
}

async function countDone(root: string): Promise<number> {
  const doneDir = resolve(root, 'done')
  if (!existsSync(doneDir)) return 0
  const entries = await readdir(doneDir, { withFileTypes: true })
  return entries.filter(e => e.isDirectory()).length
}
```

注意：`readContext` 返回的 `currentPlan` 在有多个当前计划时为 `null`，具体错误由 validator 报告。需要额外暴露原始 `currentPlans` 给 validator。调整：内部返回 `_currentPlans` 数组，对外 snapshot 只保留单个 `currentPlan`。具体实现时可将 `readContext` 拆为内部 `readRawContext` + 对外 `readContext`。

**Step 2: Commit**

```bash
git add packages/agent-context/src/context/reader.ts
git commit -m "feat(agent-context): implement context reader"
```

---

### Task 3: 实现 context/validator.ts

**Files:**
- Create: `packages/agent-context/src/context/validator.ts`

**Step 1: 创建 validator 模块**

基于 reader 的结果进行校验。

校验规则：
1. 当前计划数量 ≤ 1
2. plan.md 存在（当有 plan 目录时）
3. 状态行合法
4. 编号无冲突

```typescript
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ValidateResult, ContextSnapshot } from '../types'

export function validate(context: ContextSnapshot, currentPlanCount: number): ValidateResult {
  const errors: string[] = []

  if (currentPlanCount > 1) {
    errors.push(`存在 ${currentPlanCount} 个当前计划，应最多 1 个。`)
  }

  if (context.currentPlan) {
    const planFile = resolve(context.currentPlan.dir, 'plan.md')
    if (!existsSync(planFile)) {
      errors.push(`当前计划 plan-${context.currentPlan.number} 缺少 plan.md。`)
    }
  }

  // 编号冲突检查
  const allNumbers = new Set<number>()
  const duplicates: number[] = []

  if (context.currentPlan) {
    allNumbers.add(context.currentPlan.number)
  }

  for (const p of context.preparing) {
    if (allNumbers.has(p.number)) {
      duplicates.push(p.number)
    }
    allNumbers.add(p.number)
  }

  if (duplicates.length > 0) {
    errors.push(`计划编号冲突: ${duplicates.join(', ')}。`)
  }

  return { valid: errors.length === 0, errors, context }
}
```

**Step 2: Commit**

```bash
git add packages/agent-context/src/context/validator.ts
git commit -m "feat(agent-context): implement context validator"
```

---

### Task 4: 实现 context/archiver.ts

**Files:**
- Create: `packages/agent-context/src/context/archiver.ts`

**Step 1: 创建 archiver 模块**

归档当前计划 + 晋升 preparing 队列。

```typescript
import { rename, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { ContextSnapshot, ArchiveResult } from '../types'

export async function archive(context: ContextSnapshot): Promise<ArchiveResult> {
  const plan = context.currentPlan
  if (!plan) throw new Error('无当前计划')
  if (plan.status !== '已执行') throw new Error('当前计划尚未执行')

  const today = formatDate(new Date())
  const doneDir = resolve(context.root, 'done')
  const archiveName = `plan-${plan.number}-${today}`
  const archivePath = resolve(doneDir, archiveName)

  await mkdir(doneDir, { recursive: true })
  await rename(plan.dir, archivePath)

  let promoted: number | null = null
  if (context.preparing.length > 0) {
    const next = context.preparing[0]
    const promotedDir = resolve(context.root, `plan-${next.number}`)
    await rename(next.dir, promotedDir)
    promoted = next.number
  }

  return {
    archivedTo: archivePath,
    promoted,
    remainingPreparing: Math.max(0, context.preparing.length - 1)
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}
```

**Step 2: Commit**

```bash
git add packages/agent-context/src/context/archiver.ts
git commit -m "feat(agent-context): implement context archiver"
```

---

### Task 5: 创建 context/index.ts barrel 导出

**Files:**
- Create: `packages/agent-context/src/context/index.ts`

**Step 1: 创建导出文件**

```typescript
export { readContext, readPlanStatus } from './reader'
export { validate } from './validator'
export { archive } from './archiver'
```

**Step 2: Commit**

```bash
git add packages/agent-context/src/context/index.ts
git commit -m "feat(agent-context): add context module barrel export"
```

---

### Task 6: 实现 validate CLI 命令

**Files:**
- Create: `packages/agent-context/src/commands/validate.ts`

**Step 1: 创建 validate 命令**

读取 context → 校验 → 格式化输出。内部需要同时拿到 raw currentPlans 数量和 snapshot。

```typescript
import { readContext } from '../context'
import { validate } from '../context'

export async function validateCommand(): Promise<void> {
  // 实现：调用 readContext，调用 validate，输出结果
  // 退出码：valid ? 0 : 1
}
```

**Step 2: Commit**

```bash
git add packages/agent-context/src/commands/validate.ts
git commit -m "feat(agent-context): add validate CLI command"
```

---

### Task 7: 实现 status CLI 命令

**Files:**
- Create: `packages/agent-context/src/commands/status.ts`

**Step 1: 创建 status 命令**

读取 context → 格式化输出状态摘要。

输出格式：
```
Agent Context Status
────────────────────
当前计划:  plan-3 (已执行)
待执行队列: plan-4, plan-5
已归档:    2 个
```

**Step 2: Commit**

```bash
git add packages/agent-context/src/commands/status.ts
git commit -m "feat(agent-context): add status CLI command"
```

---

### Task 8: 实现 done CLI 命令

**Files:**
- Create: `packages/agent-context/src/commands/done.ts`

**Step 1: 创建 done 命令**

流程：validate → 检查状态 → 确认（除非 --yes）→ archive → 输出结果。

使用 `@inquirer/prompts` 的 `confirm` 做交互确认。

**Step 2: Commit**

```bash
git add packages/agent-context/src/commands/done.ts
git commit -m "feat(agent-context): add done CLI command"
```

---

### Task 9: 注册新 CLI 子命令

**Files:**
- Modify: `packages/agent-context/src/cli.ts`

**Step 1: 在 cli.ts 中注册 validate、status、done 命令**

在现有 `install` 和 `sync` 注册之后添加三个新命令：

```typescript
program.command('validate').description('校验 .agent-context 目录结构').action(validateCommand)
program.command('status').description('查看当前 agent-context 状态').action(statusCommand)
program.command('done').description('归档当前已执行计划').option('--yes', '跳过确认').action(doneCommand)
```

**Step 2: 运行 `npm run build` 验证编译通过**

```bash
cd packages/agent-context && npm run build
```

**Step 3: Commit**

```bash
git add packages/agent-context/src/cli.ts
git commit -m "feat(agent-context): register validate/status/done in CLI"
```

---

### Task 10: 更新 action 模板 - rush 替换 done

**Files:**
- Modify: `packages/agent-context/src/content/actions.ts`

**Step 1: 修改 ACTION_NAMES 和 ACTION_RENDERERS**

将 `'done'` 替换为 `'rush'`，删除 `renderDone`，新增 `renderRush`。

**Step 2: 新增 `renderRush()` 函数**

模板内容参照设计文档中的 rush action 规范。

**Step 3: 修改 `renderPlan()` 和 `renderImplement()` 前置检查**

- 所有非 init 模板前置检查第一步：`运行 agent-context validate`。
- `renderPlan()`：已执行当前计划 → 提示运行 `agent-context done`。
- `renderImplement()`：已执行 → 提示 patch 或 `agent-context done`。

**Step 4: Commit**

```bash
git add packages/agent-context/src/content/actions.ts
git commit -m "feat(agent-context): replace done with rush action, add validate to templates"
```

---

### Task 11: 更新 navigator (SKILL.md) 模板

**Files:**
- Modify: `packages/agent-context/src/content/index.ts`

**Step 1: 修改 `renderNavigator` 中的意图匹配表**

添加 rush 行，done 行改为指向 CLI 命令：

```
| 快速出计划并实施 | rush | `actions/rush.md` |
| 任务彻底完成、归档当前计划 | done | 运行 `agent-context done` |
```

**Step 2: Commit**

```bash
git add packages/agent-context/src/content/index.ts
git commit -m "feat(agent-context): update navigator with rush action and CLI done"
```

---

### Task 12: 最终验证

**Step 1: 完整构建**

```bash
cd packages/agent-context && npm run clean && npm run build
```

**Step 2: 手动测试 CLI 命令**

```bash
# 在项目根目录测试
node packages/agent-context/dist/cli.js status
node packages/agent-context/dist/cli.js validate
```

**Step 3: 测试 install/sync 仍正常**

```bash
node packages/agent-context/dist/cli.js sync --check
```

**Step 4: Commit 任何修复**

如果有修复，额外提交。
