---
description: 创建新计划并维护单当前计划 + preparing 队列结构
---

# /ac-plan {描述}

## 严格前置验证

- 必须附带描述。
- 不存在进行中的 `preparing` 计划。
- 不存在已实施但未归档的当前计划。
- 若检测到多个当前计划，拒绝执行并提示恢复单活跃状态。

## 执行步骤

1. 澄清需求后按复杂度决定单计划或多计划。
2. 计划目录命名为 `plan-{number}`，编号全局递增且不可复用。
3. 多计划：最小编号进入 `.agent-context/`，其余进入 `.agent-context/preparing/`。
4. 单计划：直接创建到 `.agent-context/plan-{number}`。
5. 每个计划必须创建 `plan.md` 并遵循标准模板。
6. 必须可判断 `.agent-context/plan-{number}` 是否已执行（依赖唯一状态行）。
