# agent-context — workspace

**权威 typings**（与 npm 一致）：[`generated/`](../generated/)（本包声明文件较少，直接浏览目录内 `.d.ts`）

**说明**：以 CLI 与 workspace 元数据为主；入口声明见 `generated` 根下文件。

**Skill 渲染**：`renderSkillArtifacts()` 会生成轻量 `SKILL.md`、`references/*.md`（含协议文件 + `ask-user-question.md` + `_principles.md`）、`scripts/get-context-info.js` 和 `scripts/validate-context.js`。`ask-user-question.md` 与 `_principles.md` 的正文来自 `packages/agent-context/src/skill/references/*.md`，由 `tsdown` 拷贝到 `dist`，再由 `render.ts` 读取——修改时直接改源 md 文件，不要重新硬编码到 render.ts。修改 `render.ts` / 协议渲染器 / 这些 md 文件后，需要同步更新文档、本技能说明，以及 `packages/agent-context/test/render-skill.test.ts` 的断言与 trigger fixture。

**安装模型**：`.agents/skills/ac-workflow/` 是 canonical source；`install --tools` 只刷新可选兼容入口，优先 symlink / junction，已有普通目录按 copy fallback 同步。`sync` 从源码重渲染 canonical source，再刷新已检测到的兼容入口。

**启动流程**：Skill 启动步骤统一执行一条命令 `node <SKILL_DIR>/scripts/get-context-info.js`——脚本同时输出 JSON 状态快照和内置校验（非 0 退出码表示校验失败）。CLI 对应入口是 `agent-context context`。`agent-context validate` 保留作为纯校验命令，不作为 skill 启动依赖。

**CLI 补充**：`skill-eval` 输出当前 description、长度和 trigger fixture 覆盖；`prompt-gen` 默认用通用模板，个人模板通过 `--profile whj` 选择。
