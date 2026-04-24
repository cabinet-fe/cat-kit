# 优化 agent-context Skill 上下文

> 状态: 已执行

## 目标

降低 `@cat-kit/agent-context` 安装后生成的 `SKILL.md` 激活上下文占用，使其符合 Agent Skills 渐进式披露方式：用精确 description 负责触发，用短小 `SKILL.md` 负责上下文检查与协议路由，把完整协议细节保留到按需读取的 `references/` 文件中，同时保持现有协议行为不退化。

## 内容

1. 调整 `packages/agent-context/src/skill/render.ts` 的 `SKILL_DESCRIPTION`，改为以 “Use this skill when...” 开头，覆盖 `init`、`plan`、`replan`、`implement`、`patch`、`rush`、`review`、`done`、`.agent-context` 与协作流程关键词，且不超过 Agent Skills 规范的 description 长度限制。
2. 重写 `renderNavigator` 输出的 `SKILL.md` 正文，使其只包含：执行上下文脚本、运行 `agent-context validate`、使用脚本返回字段、选择并读取单个协议文件、状态到协议的紧凑路由、全局不可破坏约束、`request_user_input` 或对应提问工具的引用位置。
3. 保留 `references/*.md`、`references/ask-user-question.md` 与 `scripts/get-context-info.js` 的产物布局，不把完整协议正文重新内联到 `SKILL.md`。
4. 更新 `docs/content/packages/agent-context/` 中涉及 Skill 触发、路由和安装产物说明的文档，说明 `SKILL.md` 已改为轻量导航入口，完整协议按需读取。
5. 更新 `skills/cat-kit-agent-context/` 中供真实项目使用的技能说明，补充安装产物采用渐进式披露与短导航 `SKILL.md` 的约定。
6. 运行 `bun --cwd packages/agent-context run typecheck`，再运行 `bun --cwd packages/agent-context run build` 验证渲染代码与发布脚本复制路径。

## 影响范围

- `.agents/skills/ac-workflow/SKILL.md`
- `.agents/skills/ac-workflow/references/ask-user-question.md`
- `.agents/skills/ac-workflow/references/implement.md`
- `.agents/skills/ac-workflow/references/init.md`
- `.agents/skills/ac-workflow/references/patch.md`
- `.agents/skills/ac-workflow/references/plan.md`
- `.agents/skills/ac-workflow/references/replan.md`
- `.agents/skills/ac-workflow/references/review.md`
- `.agents/skills/ac-workflow/references/rush.md`
- `.agents/skills/ac-workflow/scripts/validate-context.js`
- `packages/agent-context/src/skill/render.ts`
- `packages/agent-context/src/skill/installer.ts`
- `packages/agent-context/src/skill/targets.ts`
- `packages/agent-context/src/skill/scripts/validate-context.js`
- `packages/agent-context/src/skill/protocols/index.ts`
- `packages/agent-context/src/skill/protocols/init.ts`
- `packages/agent-context/src/skill/protocols/plan.ts`
- `packages/agent-context/src/skill/protocols/replan.ts`
- `packages/agent-context/src/skill/protocols/implement.ts`
- `packages/agent-context/src/skill/protocols/patch.ts`
- `packages/agent-context/src/skill/protocols/rush.ts`
- `packages/agent-context/src/skill/protocols/review.ts`
- `packages/agent-context/src/commands/install.ts`
- `packages/agent-context/src/commands/prompt-gen.ts`
- `packages/agent-context/src/commands/skill-eval.ts`
- `packages/agent-context/src/cli.ts`
- `packages/agent-context/src/types.ts`
- `packages/agent-context/tsdown.config.ts`
- `packages/agent-context/README.md`
- `docs/content/packages/agent-context/index.md`
- `docs/content/packages/agent-context/cli.md`
- `docs/content/packages/agent-context/protocols.md`
- `docs/content/packages/agent-context/collaboration.md`
- `skills/cat-kit-agent-context/SKILL.md`
- `skills/cat-kit-agent-context/examples.md`
- `skills/cat-kit-agent-context/references/workspace.md`
- `.changeset/light-agent-context-skill.md`
- `packages/agent-context/test/render-skill.test.ts`
- `packages/agent-context/test/installer.test.ts`
- `packages/agent-context/test/fixtures/trigger-prompts.json`

## 历史补丁

- patch-1: 修复 Skill 触发边界与回归测试
- patch-2: 抽象提问工具并改为 canonical Skill 安装模型
