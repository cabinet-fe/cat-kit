# 修复 Skill 触发边界与回归测试

## 补丁内容

修复 review 提出的三项问题：

- 收窄 `SKILL_DESCRIPTION`，去掉宽泛关键词列表，增加 “Do not use” 负触发边界，避免普通 coding、code review、planning、`AGENTS.md` 修改误触发。
- 在生成的 `SKILL.md` 中补回 `<SKILL_DIR>` 含义说明，避免代理把占位符当作可直接执行路径。
- 增加渲染回归测试与触发样例 fixture，覆盖 `SKILL.md` 长度、description 边界、占位符说明，以及 should-trigger / should-not-trigger 样例。

## 影响范围

- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/render.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/package.json`
- 新增文件: `/Users/whj/Codes/cat-kit/packages/agent-context/test/render-skill.test.ts`
- 新增文件: `/Users/whj/Codes/cat-kit/packages/agent-context/test/fixtures/trigger-prompts.json`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/index.md`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/cli.md`
- 修改文件: `/Users/whj/Codes/cat-kit/skills/cat-kit-agent-context/SKILL.md`
- 修改文件: `/Users/whj/Codes/cat-kit/skills/cat-kit-agent-context/references/workspace.md`
