# 补充 README 并重写 agent-context 文档

> 状态: 已执行

## 目标

根据 plan-10 新增的 `index` 命令补充 README.md 文档，然后根据 `packages/agent-context/` 整体内容重新编写 `docs/content/packages/agent-context/` 下的全部文档页面。

## 内容

1. **补充 README.md**：在 CLI 命令参考部分新增 `agent-context index` 命令说明；在 `init` 命令补充 `--scope` 选项；在通用选项表格补充 `--scope` 说明。

2. **重写 `docs/content/packages/agent-context/index.md`**：按 docs AGENTS.md 规范，仅保留介绍 + 导航，更新导航链接列表。

3. **重写 `docs/content/packages/agent-context/cli.md`**：新增 `init`（含 `--scope`、`--yes`）和 `index` 命令文档；调整通用选项表格。

4. **重写 `docs/content/packages/agent-context/actions.md`**：根据当前 Skill 协议内容刷新 action 表格和各 action 详细说明。

5. **重写 `docs/content/packages/agent-context/collaboration.md`**：保持场景结构，刷新场景内容使其与最新功能一致。

6. **同步 `docs/content/guide/getting-started.md`**：在 AI 导航索引的 agent-context 行中，检索关键词补充 `index scope`。

## 影响范围

- 修改文件: `packages/agent-context/README.md`
- 修改文件: `docs/content/packages/agent-context/index.md`
- 修改文件: `docs/content/packages/agent-context/cli.md`
- 修改文件: `docs/content/packages/agent-context/actions.md`
- 修改文件: `docs/content/packages/agent-context/collaboration.md`
- 修改文件: `docs/content/guide/getting-started.md`

## 历史补丁
