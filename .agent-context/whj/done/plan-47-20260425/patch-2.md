# 抽象提问工具并改为 canonical Skill 安装模型

## 补丁内容

根据追加反馈补齐 agent-context Skill 的开放标准边界：

- 将协议中的具体提问工具名统一抽象为“交互式提问工具”，`references/ask-user-question.md` 改为通用用户提问规范，并列出常见 host/runtime 工具名作为参考。
- 将安装模型改为 `.agents/skills/ac-workflow/` canonical source；`install --tools` 仅创建兼容入口，优先 symlink / junction，已有普通目录或不支持 symlink 时按 copy fallback 同步；`sync` 从源码重渲染 canonical source 后刷新兼容入口。
- 新增 bundled `scripts/validate-context.js`，生成的 Skill 在全局 CLI 与 `npx @cat-kit/agent-context validate` 不可用时可降级校验。
- 新增 `agent-context skill-eval`，读取触发 fixture 输出 description 长度、should-trigger 与 should-not-trigger 覆盖。
- 将 `prompt-gen` 默认模板改为通用公开模板，个人偏好改为显式 `--profile whj`。
- 将 review 协议调整为 capability-aware：只有 host 支持 subagent 且用户明确同意时才使用子代理，否则在当前会话审查。
- 同步更新 README、docs、仓库内 cat-kit agent-context 技能说明和本仓库 `.agents/skills/ac-workflow` 产物。

## 影响范围

- 新增文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/scripts/validate-context.js`
- 新增文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/commands/skill-eval.ts`
- 新增文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/scripts/validate-context.js`
- 新增文件: `/Users/whj/Codes/cat-kit/packages/agent-context/test/installer.test.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/SKILL.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/ask-user-question.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/implement.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/init.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/patch.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/plan.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/replan.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/review.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/rush.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.changeset/light-agent-context-skill.md`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/cli.md`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/collaboration.md`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/index.md`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/protocols.md`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/README.md`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/cli.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/commands/install.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/commands/prompt-gen.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/installer.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/implement.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/index.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/init.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/patch.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/plan.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/replan.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/review.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/rush.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/render.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/targets.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/types.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/tsdown.config.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/test/render-skill.test.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/skills/cat-kit-agent-context/SKILL.md`
- 修改文件: `/Users/whj/Codes/cat-kit/skills/cat-kit-agent-context/examples.md`
- 修改文件: `/Users/whj/Codes/cat-kit/skills/cat-kit-agent-context/references/workspace.md`
