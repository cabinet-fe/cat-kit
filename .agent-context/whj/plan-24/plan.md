# 按工具类型动态生成提问工具名称

> 状态: 已执行

## 目标

将协议源码中硬编码的 `AskUserQuestion` 工具名改为按 `ToolTarget` 动态生成：Claude Code 使用 `AskUserQuestion`，Codex 使用 `request_user_input`。同时在 Codex 协议中增加 `default_mode_request_user_input=true` 配置检查提示。

## 内容

### 步骤 1：在 `ToolTarget` 接口新增 `askToolName` 字段

- 文件：`packages/agent-context/src/types.ts`
- 在 `ToolTarget` 接口中添加 `askToolName: string`

### 步骤 2：在 `TOOL_TARGET_MAP` 为每个工具设置 `askToolName`

- 文件：`packages/agent-context/src/tools.ts`
- `claude` → `'AskUserQuestion'`
- `codex` → `'request_user_input'`
- `cursor` → `'AskUserQuestion'`
- `antigravity` → `'AskUserQuestion'`
- `agents` → `'AskUserQuestion'`
- `gemini` → `'AskUserQuestion'`
- `copilot` → `'AskUserQuestion'`

### 步骤 3：更新 `content/index.ts` 的导航器和提问规范

3a. `renderNavigator(target)`：将模板字符串中的 3 处 `AskUserQuestion`（第 60、70、72 行）替换为 `${target.askToolName}`

3b. `renderAskQuestionGuidelines()`：改为接受 `target: ToolTarget` 参数，将模板内的 2 处 `AskUserQuestion`（标题和正文各 1 处）替换为 `${target.askToolName}`；注释行 `// ── AskUserQuestion Guidelines` 保持不变（注释不影响生成产物）

3c. `renderNavigator()` 内部调用 `renderAskQuestionGuidelines()` 的地方同步改为 `renderAskQuestionGuidelines(target)`

3d. 当 `target.id === 'codex'` 时，在提问规范末尾追加以下配置检查说明：

```
> **Codex 配置要求**：`request_user_input` 需要启用 `default_mode_request_user_input` 配置才能在默认编码模式下使用。首次调用前请检查：
> 1. 项目配置 `.codex/config.toml` 中是否包含 `default_mode_request_user_input: true`
> 2. 若项目配置不存在或未启用，检查用户配置 `~/.codex/config.toml`
> 3. 若均未启用，提醒用户在任一配置文件中添加 `default_mode_request_user_input: true`
```

### 步骤 4：更新 7 个 action 渲染函数

将模板字符串中所有 `AskUserQuestion` 替换为 `${target.askToolName}`，同时将未使用参数的 `_target` 改为 `target`。以下 7 个文件可按任意顺序修改：

- `actions/init.ts`：`renderInit(target)` — 已使用 `target` 参数，7 处替换（第 15、16、23、27、33、34、38 行）
- `actions/plan.ts`：`renderPlan(_target)` → `renderPlan(target)` — 6 处替换（第 14、15、16、20、37、38 行）
- `actions/replan.ts`：`renderReplan(_target)` → `renderReplan(target)` — 5 处替换（第 14、15、16、17、28 行）
- `actions/implement.ts`：`renderImplement(_target)` → `renderImplement(target)` — 5 处替换（第 13、14、15、17、18 行）
- `actions/patch.ts`：`renderPatch(_target)` → `renderPatch(target)` — 5 处替换（第 14、15、16、17、18 行）
- `actions/rush.ts`：`renderRush(_target)` → `renderRush(target)` — 4 处替换（第 14、15、16、25 行）
- `actions/review.ts`：`renderReview(target)` — 已使用 `target` 参数，2 处替换（第 15、52 行）

### 步骤 5：构建验证

- 运行 `bun run lint` 确认代码风格通过
- 运行 `npx agent-context sync --tools codex --check`，然后在生成产物中 grep `AskUserQuestion` 确认无匹配
- 运行 `npx agent-context sync --tools claude --check`，然后在生成产物中 grep `request_user_input` 确认无匹配

## 影响范围

- `packages/agent-context/src/tools.ts`
- `packages/agent-context/src/content/index.ts`
- `packages/agent-context/src/content/actions/init.ts`
- `packages/agent-context/src/content/actions/plan.ts`
- `packages/agent-context/src/content/actions/replan.ts`
- `packages/agent-context/src/content/actions/implement.ts`
- `packages/agent-context/src/content/actions/patch.ts`
- `packages/agent-context/src/content/actions/rush.ts`
- `packages/agent-context/src/content/actions/review.ts`

## 历史补丁
