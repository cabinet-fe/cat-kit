---
name: ac-workflow
description: 用于处理 `.agent-context/` 计划生命周期：初始化项目上下文、创建或重做计划、按当前计划实施、为已执行计划打补丁、审查计划或结果、归档已完成计划；也用于“按当前计划继续”“rush 一下”“看当前该做什么”这类需要先读取 `.agent-context/` 状态再决策的请求。
metadata:
  version: 1.3.5
---


# 代理上下文工作流（ac-workflow）

统一管理仓库根目录 `.agent-context/` 下的计划：`init` → `plan` / `replan` → `implement` → `patch` → `review` → `done`；也可用 `rush` 在一条流程内完成 `plan` + `implement`。

## 何时使用

- 用户要初始化项目上下文，或补全 / 重写 CLAUDE.md
- 用户要创建计划、重做计划、按当前计划实施、补丁、review 或 done
- 用户提到“当前计划”“继续做”“重新规划”“rush”“patch”“归档”“下一步该做什么”等，需要先读取 `.agent-context/` 当前状态再决定动作

## 不要用于

- 纯一次性问答、代码解释或小修小补，且不需要维护 `.agent-context/` 状态
- 用户只是要一个直接答案，不涉及当前计划的创建、推进、修补或归档

## 执行纪律（摘要）

完整步骤始终以 `references/<动作>.md` 为准；此处仅作索引，**不可替代协议全文**。

- **状态先查**：任何操作前先查看 `.agent-context/{scope}/`，判定：无当前计划 / 当前 **未执行** / 当前 **已执行**
- **单文件加载**：选定动作后，**只读取对应的** `references/<动作>.md`；不要一次性加载全部 `references/`
- **协议先行**：读取动作协议全文后再逐步执行；禁止凭记忆、摘要或猜测跳过协议步骤
- **前置检查**：各协议中的「前置检查」逐条执行；协议要求运行 `agent-context validate` 时必须执行
- **按需提问**：只有在需要用户做真实决策、且无法从仓库、当前计划或上下文可靠推断时，才读取 `references/ask-user-question.md` 并使用 AskUserQuestion
- **禁止直接改动**：在 **plan** / **rush** 创建计划之前，不得修改业务代码；代码变更仅在 **implement** 或 **patch** 上下文中进行
- **顺序执行**：协议内步骤按编号顺序执行；若协议未明确允许，不跳步、不合并、不并行

## 路由决策

> **必须先确定当前计划状态，再按下表选择动作。禁止跳过状态判断直接匹配动作。**

### 状态 A：无当前计划

| 用户意图 | 动作 | 协议文件 |
|----------|------|----------|
| 初始化项目上下文、补全 CLAUDE.md | init | `references/init.md` |
| 给需求出计划、拆分任务 | plan | `references/plan.md` |
| 快速出计划并实施 | rush | `references/rush.md` |

### 状态 B：当前计划状态为「未执行」

| 用户意图 | 动作 | 协议文件 |
|----------|------|----------|
| 按计划开始做、实现当前计划 | implement | `references/implement.md` |
| 重做计划、调整方案 | replan | `references/replan.md` |
| 审查当前计划 | review | `references/review.md` |
| 用户提出新需求且与当前计划**相关** | replan | `references/replan.md` |
| 用户提出新需求且与当前计划**无关** | → AskUserQuestion | 选项：1) 归档当前计划后创建新计划（推荐） 2) 终止操作 |

### 状态 C：当前计划状态为「已执行」

| 用户意图 | 动作 | 协议文件 |
|----------|------|----------|
| 实施后不满意、追加需求、修补问题 | patch | `references/patch.md` |
| 审查实施结果 | review | `references/review.md` |
| 任务彻底完成、归档当前计划 | done | 运行 `agent-context done` |
| 用户提出新需求且与当前计划**相关** | patch | `references/patch.md` |
| 用户提出新需求且与当前计划**无关** | → AskUserQuestion | 选项：1) 归档后创建新计划（推荐） 2) 终止操作 |

> **关联性判断**：当用户提出变更需求时，对照当前 `plan.md` 的 `## 目标` 判断关联性。若无法确定 → 通过 AskUserQuestion 让用户确认。

## 全局约束

- 状态机两态：`未执行`、`已执行`。
- 任意时刻最多一个当前计划：`.agent-context/{scope}/plan-{number}`。
- 多个当前计划 → 拒绝执行，提示恢复单活跃状态。
- 计划编号全局递增，不复用。补丁编号在单计划目录内递增，不复用。
- 影响范围（`## 影响范围`）不得包含 `.agent-context/` 目录下的文件。

## 目录结构

```text
.agent-context/
├── .env               # SCOPE 配置（SCOPE=<name>）
├── .gitignore
└── {scope}/           # 作用域目录（按协作者隔离）
    ├── plan-{N}/      # 当前计划（最多一个）
    │   ├── plan.md
    │   └── patch-{N}.md
    ├── preparing/     # 待执行计划队列
    │   └── plan-{N}/
    └── done/          # 已归档计划
        └── plan-{N}-{YYYYMMDD}/
```

编号规则：在当前 scope 内扫描全部 `plan-N` 目录取 `max(N)+1`。
