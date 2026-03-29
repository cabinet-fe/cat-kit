# AskUserQuestion 模板集中定义

## 补丁内容

将分散在 6 个 action 协议文件中的所有 AskUserQuestion 内联描述提取为 20 个标准化模板（Q1-Q20），集中定义在 SKILL.md 渲染函数中。模板按输入类（Q1-Q7）和选择类（Q8-Q20）分组，每个选择类模板包含从 1 开始的编号选项、★ 推荐选项及推荐理由。各 action 协议通过 `→ Q{N}` 引用模板，不再内联重复选项列表。

## 影响范围

- 修改文件: `packages/agent-context/src/content/index.ts`
- 修改文件: `packages/agent-context/src/content/actions/init.ts`
- 修改文件: `packages/agent-context/src/content/actions/plan.ts`
- 修改文件: `packages/agent-context/src/content/actions/replan.ts`
- 修改文件: `packages/agent-context/src/content/actions/implement.ts`
- 修改文件: `packages/agent-context/src/content/actions/patch.ts`
- 修改文件: `packages/agent-context/src/content/actions/rush.ts`
