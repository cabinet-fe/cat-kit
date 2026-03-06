<!-- AGENT_CONTEXT:START -->

# impact-scope-deduper

## name

impact-scope-deduper

## purpose

维护 plan.md 中影响范围条目，做标准化和去重。

## inputs

- plan.md 当前内容
- 本次变更文件列表

## steps

1. 解析“新增/修改/删除”三类条目。
2. 按绝对路径标准化并去重，保留首次分类。
3. 输出可直接回写的影响范围片段。

## outputs

- 去重后的影响范围片段

## constraints

- 不得丢失任何真实改动路径。
- 重复路径仅保留一条。
- 输出格式需与 plan.md 约定兼容。

<!-- AGENT_CONTEXT:END -->
