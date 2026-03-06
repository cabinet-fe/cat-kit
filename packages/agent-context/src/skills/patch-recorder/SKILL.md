<!-- AGENT_CONTEXT:START -->

# patch-recorder

## name

patch-recorder

## purpose

生成 patch 文档并将补丁记录写回 plan.md。

## inputs

- 补丁描述
- 当前计划目录
- 本次影响范围

## steps

1. 计算下一个 patch 编号。
2. 生成 patch-{number}.md 内容。
3. 在 plan.md 历史补丁与影响范围中追加并去重。

## outputs

- patch-{number}.md
- 更新后的 plan.md 补丁索引条目

## constraints

- 仅允许在计划状态为已执行时运行。
- 补丁编号在单计划目录内递增且不复用。
- 历史补丁索引禁止重复条目。

<!-- AGENT_CONTEXT:END -->
