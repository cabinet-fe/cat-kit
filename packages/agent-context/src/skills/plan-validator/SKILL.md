<!-- AGENT_CONTEXT:START -->

# plan-validator

## name

plan-validator

## purpose

校验计划目录结构、单活跃计划约束、编号递增规则是否成立。

## inputs

- 项目根目录路径
- .agent-context 目录快照
- 可选：目标计划编号

## steps

1. 扫描 .agent-context、preparing、done 三个范围内的 plan 编号。
2. 验证当前计划目录是否唯一，检查状态字段是否合法。
3. 输出错误清单与可执行修复建议。

## outputs

- 结构校验报告（Markdown）
- 阻塞级错误列表
- 修复建议列表

## constraints

- 不修改业务代码；仅检查计划元数据。
- 多个当前计划时必须返回阻塞错误。
- 编号冲突或倒退必须被判定为失败。

<!-- AGENT_CONTEXT:END -->
