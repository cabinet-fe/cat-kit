# agent-context：references 布局、安装横幅与 SKILL 渐进披露

> 状态: 已执行

## 目标

1. 生成分发的协议 Markdown 改为写入 `references/`，替代原 `actions/`。
2. `agent-context install` 执行时（含 `--check` 同命令）在终端打印含「Agent Context Workflow」的品牌横幅。
3. 优化生成的 `SKILL.md`：强化可被模型匹配的摘要与触发场景；路由与纪律指向 `references/*.md`；将冗长提问规范移至 `references/ask-user-question.md`，主 SKILL 仅保留指针，符合渐进式披露。

## 内容

1. 修改 `packages/agent-context/src/content/index.ts`：协议产物路径改为 `references/<动作>.md`；新增 `references/ask-user-question.md`；重写 `renderNavigator` 与 `SKILL_DESCRIPTION`（及 `renderOpenAIMetadata` 中与描述相关的字段）；抽出完整提问规范为独立参考文档内容。
2. 修改 `packages/agent-context/src/commands/install.ts`：在调用 `runInstall` 之前输出品牌横幅。
3. 确认 `runner.ts` 等对子路径无硬编码依赖；若有测试断言路径则同步修改。
4. 运行 `agent-context validate` 与 `packages/tests` 中与 agent-context 相关的 Vitest（若存在）确保通过。

## 影响范围

- `packages/agent-context/src/content/index.ts`
- `packages/agent-context/src/commands/install.ts`
- 仓库内已安装的 ac-workflow Skill：各 `*/skills/ac-workflow/SKILL.md` 更新；协议与提问规范迁至 `references/`；移除 `.agents/skills/ac-workflow/actions/`、`.claude/skills/ac-workflow/actions/` 旧目录；`.codex` / `.cursor` / `.agent` / `.gemini` / `.github/skills` 下 ac-workflow 为 install 写入或更新的产物
- `packages/agent-context/src/content/actions/implement.ts`
- `.agents/skills/ac-workflow/references/implement.md`
- `.claude/skills/ac-workflow/references/implement.md`
- `.agents/skills/ac-workflow/SKILL.md`
- `.claude/skills/ac-workflow/SKILL.md`

## 历史补丁

- patch-1: 修正 implement 协议步骤编号
