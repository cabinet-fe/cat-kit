# 精简 Skill 上下文并收紧提问/路由

## 补丁内容

针对上轮评审指出的「上下文占用、提问工具过触发、协议路由不精准」三类问题，对生成的 `ac-workflow` Skill 做一次集中收敛。

### 上下文与结构

- 新增 `agent-context context` CLI 子命令（`src/commands/context.ts`），一次性输出状态快照 JSON 并内置 `.agent-context/` 格式校验；校验失败时 stderr 打印列表并以非 0 退出码返回。
- 重写 `src/skill/scripts/get-context-info.js`，内联等价 validate 逻辑，将 Skill 启动步骤从原先的「跑脚本 + `agent-context validate` + 降级 `validate-context.js`」三层命令收敛为**单条**：`node <SKILL_DIR>/scripts/get-context-info.js`。`validate-context.js` 仅保留作为主脚本无法启动时的独立 fallback。
- 将原先硬编码在 `render.ts` 中的 `ask-user-question.md` 正文迁到 `src/skill/references/ask-user-question.md`，新增共享 `src/skill/references/_principles.md`；两份 md 由 `tsdown.config.ts` 复制到 `dist/skill/references/`，再由 `render.ts` 使用 `readFileSync` 读取。
- 重写 `render.ts` 的 `SKILL_DESCRIPTION` 为用户意图语言（规划/实施/修补/重规划/审查/归档/初始化 协议名 + 明确 Do not use 边界），并简化 `renderNavigator()`：single-command 启动、rush 补齐为"任意状态"入口、精简路由表与硬约束列表。

### 提问工具

- `references/ask-user-question.md` 新增"何时禁止提问（红线）"段，包含 5 条客观判据（答案已知 / 选项无实质差异 / 已追问过 / 单次协议累计 ≥ 3 次 / 代理自查即可），并允许在纯偏好场景下省略默认推荐。
- 单选推荐项规则从"必须标推荐并说明理由"放宽为"存在客观更优解时必须标；纯偏好时允许不标但必须说明无默认倾向"。
- `plan.md` 步骤 1 拆为 1a 客观歧义检查（5 条可枚举条件）+ 1b 反向面试仅在发现盲区时发起。
- `rush.md` 阶段一明确**禁止触发强制反向面试**，发现需要反向面试即转走 `plan`。
- `patch.md` 前置检查删除"补丁需求与当前计划的关联性不确定"这一主观判据，默认继续 patch；仅当用户明确表达"与之前无关 / 新需求"时才询问是否归档。
- `replan.md` 澄清条件改为 3 条客观条件；反向面试同步改为识别到显著盲区时发起。

### "review 追问"与"专业素养"

- `plan` / `implement` / `patch` / `rush` 的结尾"追问 review"改为复杂度阈值触发（步骤条数、跨 package 数、对外 API / 数据库迁移 / 安全敏感 / 计划外决策 / bugfix 等），小改动静默结束，不再每次弹确认。
- 把原先在 `plan.ts` / `implement.ts` 各自硬编码的「专业素养」段落抽到共享 `_principles.md`，按规划、实施、审查三类角色分节；`plan` / `implement` / `patch` / `replan` / `review` 协议文件开头改为引用 `references/_principles.md`，不再重复正文。

### 路由表

- `SKILL.md` 路由表新增"任意状态"一行覆盖 `rush` 入口：用户明确点名 `rush` 或任务单一、范围明确、可一气呵成时触发；保留其余按状态的精细路由。

### 测试与文档

- `test/render-skill.test.ts` 新增/调整断言：启动步骤仅一条 `sh` 代码块、路由表含"任意状态"行、`_principles.md` 被导出且在 `plan` / `implement` 协议中被引用、`ask-user-question.md` 含"何时禁止提问"。现有 10 个测试全部通过。
- 同步更新 `docs/content/packages/agent-context/cli.md`（新增 `context` 子命令说明 + 更新产物说明）、`index.md`（启动步骤一条化 + `_principles.md` 引入 + review 复杂度阈值）、`protocols.md`（`plan` / `implement` / `patch` / `rush` 的 review 触发条件）。
- 同步更新 `skills/cat-kit-agent-context/SKILL.md` 与 `references/workspace.md`：新增共享原则、ask-user 红线、复杂度阈值、rush 反向面试禁令等要点。
- 更新 `.changeset/light-agent-context-skill.md`，记录本次 Skill 上下文/提问/路由收敛的语义。

最后运行 `agent-context sync` 重新生成 `.agents/skills/ac-workflow/` canonical 产物，新增 `references/_principles.md`，并根据新的 `get-context-info.js` 规范替换主脚本。

## 影响范围

- 新增文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/commands/context.ts`
- 新增文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/references/ask-user-question.md`
- 新增文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/references/_principles.md`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/cli.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/render.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/scripts/get-context-info.js`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/plan.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/implement.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/rush.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/patch.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/replan.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/protocols/review.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/tsdown.config.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/test/render-skill.test.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/cli.md`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/index.md`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/protocols.md`
- 修改文件: `/Users/whj/Codes/cat-kit/skills/cat-kit-agent-context/SKILL.md`
- 修改文件: `/Users/whj/Codes/cat-kit/skills/cat-kit-agent-context/references/workspace.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.changeset/light-agent-context-skill.md`
