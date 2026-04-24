---
name: ac-workflow
description: >
  代理上下文工作流。用于管理 .agent-context 计划与协作流程。
metadata:
  version: 2.0.0
---

# ac-workflow

这是协议路由入口。不要预先读取所有协议文件；只在确定动作后读取需要的 `references/*.md`。

## 启动步骤

在执行任何协议或决策前，先从项目根目录运行：

```sh
node <SKILL_DIR>/scripts/get-context-info.js
agent-context validate
```

其中 `<SKILL_DIR>` 是本 `SKILL.md` 所在目录；若运行时提供技能目录变量，先替换为实际路径。

若不在项目根目录，脚本追加 `--cwd <project-root>`。若 `agent-context validate` 命令不存在，改用 `npx @cat-kit/agent-context validate`；CLI 不可用时再运行 `node <SKILL_DIR>/scripts/validate-context.js`。任一校验报告错误时，先按错误修正，再重跑到通过。

只使用脚本返回的 `scope`、`currentPlanStatus`、`currentPlanNumber`、`currentPlanDir`、`currentPlanFile`、`nextPlanNumber`、`nextPatchNumber`；不要自行扫描目录推断状态或编号。

## 路由

确定一个动作后，完整读取对应协议文件并按顺序执行。若协议引用其他协议，再读取被引用文件；不要凭记忆执行。

| 状态       | 用户意图                       | 动作                            |
| ---------- | ------------------------------ | ------------------------------- |
| `null`     | 初始化上下文、补全项目指导文件 | 读 `references/init.md`         |
| `null`     | 创建计划、拆分需求             | 读 `references/plan.md`         |
| `null`     | 明确任务直接计划并实施         | 读 `references/rush.md`         |
| `"未执行"` | 开始执行当前计划               | 读 `references/implement.md`    |
| `"未执行"` | 调整、重做、替换当前计划       | 读 `references/replan.md`       |
| `"未执行"` | 审查计划                       | 读 `references/review.md`       |
| `"已执行"` | 修补、补遗漏、追加相关增量     | 读 `references/patch.md`        |
| `"已执行"` | 审查实现                       | 读 `references/review.md`       |
| `"已执行"` | 完成并归档                     | 运行 `agent-context done --yes` |

用户明确点名 `init`、`plan`、`replan`、`implement`、`patch`、`rush`、`review` 时，仍必须先完成启动步骤，再读取 `references/<protocol>.md`。当协议需要澄清或选择时，优先使用当前运行环境提供的交互式提问工具；使用前先读 `references/ask-user-question.md`。如果当前环境没有交互式提问工具，直接用一条简短文本问题询问用户并暂停，不要伪造工具调用。

## 硬约束

- 计划状态只允许 `未执行` 或 `已执行`。
- 任意时刻最多一个当前计划：`.agent-context/{scope}/plan-{number}`。
- 创建计划使用 `nextPlanNumber`；创建补丁使用 `nextPatchNumber`。
- 在 `plan` 或 `rush` 创建计划前，不改业务代码。
- 代码变更只发生在 `implement` 或 `patch` 协议中。
- `## 影响范围` 不记录 `.agent-context/` 内文件。
