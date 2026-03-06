---
description: 将当前已执行计划标记为真正完成并归档，必要时晋升 preparing 队列
---

# /ac-done

## 严格前置验证

- 不可附带描述。
- 必须存在且仅存在一个当前计划。
- 当前计划状态必须为 `已执行`。
- 必须得到用户确认“任务已真正完成”。

## 执行步骤

1. 将 `.agent-context/plan-{number}` 归档到 `.agent-context/done/plan-{number}-{YYYYMMDD}`。
2. 若 `.agent-context/preparing` 非空，自动晋升最小编号计划为新的当前计划。
3. 校验归档与晋升结果并反馈。

## 约束

- 归档目录命名格式固定：`plan-{number}-{YYYYMMDD}`。
- 归档后计划编号不可复用。
