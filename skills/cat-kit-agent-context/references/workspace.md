# agent-context — workspace

**权威 typings**（与 npm 一致）：[`generated/`](../generated/)（本包声明文件较少，直接浏览目录内 `.d.ts`）

**说明**：以 CLI 与 workspace 元数据为主；入口声明见 `generated` 根下文件。

**Skill 渲染**：`renderSkillArtifacts` 会生成轻量 `SKILL.md`、`references/*.md` 和 `scripts/get-context-info.js`。修改 `packages/agent-context/src/skill/render.ts` 或协议渲染器后，同步更新文档、本技能说明，以及 `packages/agent-context/test/` 下的触发回归样例。
