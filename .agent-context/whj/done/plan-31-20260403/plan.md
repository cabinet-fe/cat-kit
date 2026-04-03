# agent-context CLI：新增 upgrade、移除 printer

> 状态: 已执行

## 目标

为 `@cat-kit/agent-context` CLI 新增 `upgrade` 命令（执行 `npm update -g @cat-kit/agent-context`），移除无用的 `printer.ts` 模块（将其函数内联到调用方），并同步更新文档和技能文件。

## 内容

1. 新建 `packages/agent-context/src/commands/upgrade.ts`，实现 `upgradeCommand`：调用 `child_process.execSync` 执行 `npm update -g @cat-kit/agent-context`，将 stdout/stderr 透传到终端。
2. 在 `packages/agent-context/src/cli.ts` 中注册 `upgrade` 子命令。
3. 将 `printer.ts` 中的 `printRunSummary` 和 `printCheckResult` 分别内联到 `install.ts` 和 `sync.ts`，然后删除 `printer.ts`。
4. 更新 `packages/agent-context/AGENTS.md` 的目录结构：新增 `upgrade.ts`，移除 `printer.ts`。
5. 更新 `docs/content/packages/agent-context/cli.md`：新增 `upgrade` 命令文档，介绍部分移除 printer 相关描述（printer 从未出现在 CLI 文档中，无需移除）。
6. 更新 `docs/content/packages/agent-context/index.md`：快速使用示例中加入 `upgrade`。
7. 更新 `skills/use-cat-kit/references/agent-context.md`：CLI 命令表增加 `upgrade` 行。
8. 更新 `docs/content/guide/getting-started.md`：AI 导航索引的检索关键词加入 `upgrade`。

## 影响范围

- `packages/agent-context/src/commands/upgrade.ts` — 新增
- `packages/agent-context/src/commands/printer.ts` — 删除
- `packages/agent-context/src/commands/install.ts` — 内联 printer 函数
- `packages/agent-context/src/commands/sync.ts` — 内联 printer 函数
- `packages/agent-context/src/cli.ts` — 注册 upgrade 命令
- `packages/agent-context/AGENTS.md` — 目录结构更新
- `docs/content/packages/agent-context/cli.md` — 新增 upgrade 文档
- `docs/content/packages/agent-context/index.md` — CLI 描述更新
- `skills/use-cat-kit/references/agent-context.md` — CLI 命令表更新
- `docs/content/guide/getting-started.md` — 检索关键词更新

## 历史补丁
