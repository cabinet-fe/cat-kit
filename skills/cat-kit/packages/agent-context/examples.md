# @cat-kit/agent-context — 完整协作流程

此示例组合 CLI 与已安装 Skill，适合从新需求推进到归档。

## 1. 一次性建立项目入口

```bash
agent-context install --tools cursor,codex
agent-context init
agent-context context
```

`context` 应输出有效 JSON；失败时先按错误修正 `.agent-context/`。

## 2. 在对话中驱动 Skill

依次向智能体表达：

```text
为“增加导出 Excel 功能”创建计划
按当前计划开始实现
审查当前实现
```

实现后发现同一需求的遗漏时，不新建计划：

```text
给当前计划补一个 patch，处理空数据导出
```

## 3. 完成后归档

```bash
agent-context status
agent-context done
```

只有当前计划已执行且不再需要补丁时才运行 `done`。升级 `@cat-kit/agent-context` 后可先执行 `agent-context sync --check`，确认有差异再运行 `agent-context sync`。
