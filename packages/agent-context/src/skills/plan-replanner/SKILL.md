<!-- AGENT_CONTEXT:START -->

# plan-replanner

## name

plan-replanner

## purpose

根据描述重排未实施计划并生成新的计划草案。

## inputs

- 重规划描述
- 当前未实施计划列表
- 可选：仅重规划目标编号集合

## steps

1. 解析目标范围，默认覆盖 preparing 中全部未实施计划。
2. 生成新的计划拆分方案，保持单当前计划结构。
3. 为新增计划分配全局递增编号。

## outputs

- 重规划方案文档
- 新计划草案列表

## constraints

- 当前计划已执行时，禁止重写当前计划内容。
- 已执行计划必须拒绝重规划并提示使用 patch。
- 未改动计划保持原编号。

<!-- AGENT_CONTEXT:END -->
