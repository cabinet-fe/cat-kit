# 同步 canonical skill、补齐导航与 AGENTS.md

## 补丁内容

针对 plan-47 review 指出的三类遗漏进行集中修补：

### 高优：canonical `.agents/skills/ac-workflow/references/` 未同步源码

patch-3 声明最后执行了 `agent-context sync`，但 canonical 的 4 个协议文件仍残留旧词「反向面试」，与源码 `packages/agent-context/src/skill/protocols/*.ts` 及 `references/ask-user-question.md` 的 `## 反向追问` 标题不一致，代理按 anchor 定位方法会错查。

- `.agents/skills/ac-workflow/references/rush.md`：「禁止触发强制反向面试」→「反向追问」；同段 2 处措辞统一。
- `.agents/skills/ac-workflow/references/plan.md`：步骤 1b 标题「反向面试仅在识别到显著盲区时发起」→「反向追问仅在...」。
- `.agents/skills/ac-workflow/references/replan.md`：步骤 2「反向面试（可选）」→「反向追问（可选）」。
- `.agents/skills/ac-workflow/references/init.md`：新项目步骤 4「反向面试」→「反向追问」（标题与方法名均改）。
- `skills/cat-kit-agent-context/SKILL.md`：rush 注释由「反向面试」→「反向追问」。
- `docs/content/packages/agent-context/protocols.md`：rush 章节同样改名。

### 中优：`packages/agent-context/AGENTS.md` 目录结构漂移

按根 `AGENTS.md` 的同步约定，`packages/<pkg>` 功能变更必须一并更新包级 `AGENTS.md`。本轮新增 `src/commands/context.ts`、`src/commands/skill-eval.ts` 未记入；顺手修正此前已漂移的目录（`commands/index-cmd.ts` → `index.ts`、`context/` → `workspace/` 及相关文件名、缺失的 `skill/` 与 `constants.ts`）。

### 低优：未初始化场景的导航缺口 + CLI vs 脚本差异说明

- `packages/agent-context/src/skill/render.ts` 启动步骤段补一句「特例」：脚本报错 `未找到 .agent-context 目录` 时直接读取 `references/init.md`，避免代理在首次使用项目时无路由可走。同步到 canonical `.agents/skills/ac-workflow/SKILL.md`。
- `docs/content/packages/agent-context/cli.md` 的 `agent-context context` 一节补齐字段列表（加 `cwd`、`acRoot`）并明确与 bundled `scripts/get-context-info.js` 的两点行为差异：未初始化时的退出码与输出、额外的 `runner` 字段。

## 验证

- `bunx vitest run test/render-skill.test.ts`：8/8 通过。
- `bunx tsc -p tsconfig.json --noEmit`：无报错。

## 影响范围

- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/SKILL.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/init.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/plan.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/replan.md`
- 修改文件: `/Users/whj/Codes/cat-kit/.agents/skills/ac-workflow/references/rush.md`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/AGENTS.md`
- 修改文件: `/Users/whj/Codes/cat-kit/packages/agent-context/src/skill/render.ts`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/cli.md`
- 修改文件: `/Users/whj/Codes/cat-kit/docs/content/packages/agent-context/protocols.md`
- 修改文件: `/Users/whj/Codes/cat-kit/skills/cat-kit-agent-context/SKILL.md`
