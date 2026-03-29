# AskUserQuestion 从预定义模板改为动态生成规范

## 补丁内容

移除 patch-1 引入的 20 个预定义问题模板（Q1-Q20），改为在 SKILL.md 中定义提问质量规范（通俗易懂、标注推荐项、选项编号从 1 开始、动态生成）。各 action 协议文件中的 `→ Q{N}` 引用全部替换为描述性指令，使提问内容始终基于协议上下文和用户需求动态生成，而非引用固定模板。

## 影响范围

- 修改文件: `packages/agent-context/src/content/index.ts`
- 修改文件: `packages/agent-context/src/content/actions/init.ts`
- 修改文件: `packages/agent-context/src/content/actions/plan.ts`
- 修改文件: `packages/agent-context/src/content/actions/replan.ts`
- 修改文件: `packages/agent-context/src/content/actions/implement.ts`
- 修改文件: `packages/agent-context/src/content/actions/patch.ts`
- 修改文件: `packages/agent-context/src/content/actions/rush.ts`
