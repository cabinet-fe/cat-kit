# 更新 agent-context 对应文档

> 状态: 已执行

## 目标

同步 `packages/agent-context` 的近期代码结构变更（特别是 `actions` 转为 `protocols` 相关的改动）到 `docs/content/packages/agent-context/` 目录下，并更新对应的 VitePress 侧边栏配置。

## 内容

1. 查看 `packages/agent-context/src` 代码现状以及各导出的类和命令。
2. 将 `docs/content/packages/agent-context/actions.md` 文件内容根据最新的 `protocols` 结构进行全面替换并另存为 `protocols.md`，随后删除旧的 `actions.md`。
3. 对照现有代码，修正 `docs/content/packages/agent-context/index.md`，替换其中过时的架构和术语（将 Action 改为 Protocol 相关）。
4. 查阅 `packages/agent-context` 的 CLI 入口代码，同步更新 `docs/content/packages/agent-context/cli.md` 中的命令。
5. 查阅 `docs/content/packages/agent-context/collaboration.md`，修正其中引用的相关旧术语。
6. 全局搜索 `docs/.vitepress/` 涉及 `agent-context/actions` 的路径引用，替换为 `agent-context/protocols` 分发链接。

## 影响范围

- `docs/content/packages/agent-context/actions.md` (已删除)
- `docs/content/packages/agent-context/protocols.md` (新建)
- `docs/content/packages/agent-context/index.md` (更新术语)
- `docs/content/packages/agent-context/cli.md` (更新术语)
- `docs/content/packages/agent-context/collaboration.md` (更新术语)

## 历史补丁
