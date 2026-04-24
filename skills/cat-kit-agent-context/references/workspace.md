# agent-context — workspace

**权威 typings**（与 npm 一致）：[`generated/`](../generated/)（本包声明文件较少，直接浏览目录内 `.d.ts`）

**说明**：以 CLI 与 workspace 元数据为主；入口声明见 `generated` 根下文件。

**Skill 渲染**：`renderSkillArtifacts()` 会生成轻量 `SKILL.md`、`references/*.md`、`scripts/get-context-info.js` 和 `scripts/validate-context.js`。修改 `packages/agent-context/src/skill/render.ts` 或协议渲染器后，同步更新文档、本技能说明，以及 `packages/agent-context/test/` 下的触发回归样例。

**安装模型**：`.agents/skills/ac-workflow/` 是 canonical source；`install --tools` 只刷新可选兼容入口，优先 symlink / junction，已有普通目录按 copy fallback 同步。`sync` 从源码重渲染 canonical source，再刷新已检测到的兼容入口。

**CLI 补充**：`skill-eval` 输出当前 description、长度和 trigger fixture 覆盖；`prompt-gen` 默认用通用模板，个人模板通过 `--profile whj` 选择。
