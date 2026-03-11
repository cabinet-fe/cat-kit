# agent-context v2 改进设计

## 背景

`@cat-kit/agent-context` 当前的工作流完全依赖 AI 按模板执行文件操作，存在以下痛点：

- **无快速通道**：每次都需 plan → 确认 → implement 分步走，轻量任务效率低。
- **done 操作浪费 token**：归档是纯机械性文件操作，AI 逐步执行无创造性价值。
- **无状态查询**：用户和 AI 无法快速了解当前 `.agent-context/` 的状态。
- **无结构校验**：目录结构异常时 AI 无法感知，可能在错误状态上继续操作。

## 方案

采用 **CLI 子命令统一** 方案：将机械性操作下沉到 CLI，保留 AI 擅长的创造性工作为 action 模板。

## 设计

### 1. 新增 CLI 子命令

#### `agent-context validate`

校验 `.agent-context/` 目录结构合法性。

```typescript
interface ValidateResult {
  valid: boolean
  errors: string[]
  context: ContextSnapshot | null
}

interface ContextSnapshot {
  currentPlan: { number: number; status: '未执行' | '已执行' } | null
  preparing: number[]
  doneCount: number
}
```

校验规则：
- `.agent-context/` 不存在时返回 `context: null`，不算错误。
- 当前计划数量 ≤ 1。
- `plan.md` 存在且状态行合法（`未执行` / `已执行`）。
- 编号无冲突（current、preparing、done 之间不重叠）。

退出码：0 = 通过，1 = 有错误。

#### `agent-context status`

基于 validate 的 `ContextSnapshot` 格式化输出当前状态。

```text
Agent Context Status
────────────────────
当前计划:  plan-3 (已执行)
待执行队列: plan-4, plan-5
已归档:    2 个
```

无 `.agent-context/` 时输出「无活跃上下文」。

#### `agent-context done`

执行归档操作：

1. 调用 validate，不通过则中止。
2. 检查当前计划状态为 `已执行`，否则报错退出。
3. 移动 `plan-{N}/` → `done/plan-{N}-{YYYYMMDD}/`。
4. 若 `preparing/` 非空，晋升最小编号计划到根。
5. 输出归档结果。

选项：`--yes` 跳过确认（AI 调用时使用），默认需用户确认。

### 2. 新增 rush action

新 action 模板 `actions/rush.md`，合并 plan + implement：

- 接受描述（必须），创建单计划后立即实施。
- 不停顿、不等用户确认计划内容。
- 保留 implement 的完整验证循环。
- 前置检查包含 validate 和归档提醒。

### 3. action 模板更新

#### 去除 done action

- `ACTION_NAMES` 从 `[init, plan, replan, implement, patch, done]` 变为 `[init, plan, replan, implement, patch, rush]`。
- navigator (SKILL.md) 中 done 行改为直接指向 CLI 命令。

#### validate 前置

所有 action 模板（init 除外）的前置检查第一步统一为：运行 `agent-context validate`，不通过则中止。

#### 归档提醒

- `plan`：存在未归档的已执行当前计划 → 提示先运行 `agent-context done`。
- `implement`：当前计划已执行 → 提示使用 patch 或运行 `agent-context done`。

### 4. 代码组织

```text
src/
├── context/           # 新增：.agent-context 读写逻辑
│   ├── reader.ts      # 读取目录结构 → ContextSnapshot
│   ├── validator.ts   # 校验逻辑
│   └── archiver.ts    # 归档 + 晋升操作
├── commands/
│   ├── status.ts      # 新增
│   ├── done.ts        # 新增
│   ├── validate.ts    # 新增
│   ├── install.ts
│   ├── sync.ts
│   └── printer.ts
├── content/
│   ├── index.ts       # 修改：navigator 更新
│   └── actions.ts     # 修改：rush 替换 done，模板更新
├── cli.ts             # 修改：注册新子命令
├── runner.ts          # 不变
├── tools.ts           # 不变
└── types.ts           # 修改：新增 context 相关类型
```

## 不变的部分

- `runner.ts`、`tools.ts`：install/sync 逻辑不动。
- init、replan、patch action 模板：仅追加 validate 前置，核心逻辑不变。
