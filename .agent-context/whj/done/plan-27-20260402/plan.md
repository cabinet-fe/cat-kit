# 优化 review 协议

> 状态: 已执行

## 目标

重构 review 协议，支持审查范围选择（当前计划 / preparing 队列）、禁止审查已归档计划、按计划状态自动分支审查逻辑、子代理启动可选询问。

## 内容

### 步骤 1：修改 `packages/agent-context/src/content/actions/review.ts`

重写 `renderReview` 函数生成的协议文本，变更点如下：

**前置检查**：
- 保留 validate 检查
- 将「当前计划不存在 → 终止」改为：无当前计划且 preparing 队列为空 → 提示无可审查内容，终止
- 新增：明确声明不得 review 已归档（done）计划，若用户要求则拒绝并说明
- 保留多当前计划处理

**新增步骤「确定审查范围」**（位于前置检查之后）：
- 若用户明确指定了审查对象 → 按指定执行
- 若存在 preparing 计划且存在当前计划 → 通过提问工具引导选择：1) 仅当前计划 2) 当前计划 + preparing 计划（推荐）3) 所有未执行计划
- 若存在 preparing 计划但无当前计划 → 直接审查 preparing 中的全部计划
- 若仅有当前计划（无 preparing）→ 直接审查当前计划

**新增步骤「询问子代理模式」**：
- 通过提问工具询问：1) 不使用子代理，在当前会话中审查（推荐，适用于新会话或短上下文）2) 启动独立子代理审查（适用于长对话历史，避免上下文污染）

**修改审查逻辑为「逐计划审查」**：
- 对范围内每个计划自动判断状态：未执行 → 计划审查（使用计划审查清单），已执行 → 代码审查（读取影响范围 + git diff，使用代码审查清单）
- 审查清单内容保持不变
- 子代理模式：启动独立子代理含完整上下文；非子代理模式：在当前会话中执行审查

**修改「提供行动选项」**：
- 根据审查结果按计划状态分别给出选项
- 未执行：replan（推荐）/ 忽略 / 终止
- 已执行：patch（推荐）/ 忽略 / 终止
- 混合场景：分别列出各计划建议

**调整子代理隔离要求**：
- 标注仅在选择子代理模式时适用

### 步骤 2：同步生成的协议文件

在项目根目录运行 `bun run packages/agent-context/src/cli.ts sync` 将 review.ts 的输出同步到 `.agents/skills/ac-workflow/actions/review.md`。

## 影响范围

- `packages/agent-context/src/content/actions/review.ts`
- `.agents/skills/ac-workflow/actions/review.md`（sync 生成）
- `.claude/skills/ac-workflow/actions/review.md`（sync 生成）

## 历史补丁
