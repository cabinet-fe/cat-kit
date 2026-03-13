---
title: CLI 命令
description: 'agent-context CLI 的安装、同步、校验、状态与归档命令'
outline: deep
---

# CLI 命令

## 介绍

`agent-context` 的 CLI 不负责替代 Skill action。它只做三类事：

- 安装或同步 Skill 文件
- 校验 `.agent-context/` 结构
- 查看状态与归档当前计划

如果你要让 AI “出计划”“开始实现”“补 patch”，那是对话里的 action，不是 CLI 子命令。

## 快速使用

最常用的命令只有这几个：

```bash
agent-context install
agent-context validate
agent-context status
agent-context done
```

安装完成后，日常推进通常还是靠自然语言触发 Skill；CLI 更多用于检查和收尾。

## API参考

### `agent-context install`

安装 `ac-workflow` Skill。

```bash
agent-context install
agent-context install --tools claude,codex,cursor
agent-context install --check --tools copilot
agent-context install --yes
```

说明：

- `--tools` 用于指定目标工具
- `--check` 只检查是否会产生变更，不写文件
- `--yes` 在非交互场景下优先复用已安装工具，否则安装全部工具

### `agent-context sync`

同步项目中已安装的 Skill 内容，适合升级包版本后刷新协议文件。

```bash
agent-context sync
agent-context sync --tools codex,cursor
agent-context sync --check
```

说明：

- `sync` 会基于当前版本重新渲染 Skill 文件
- `--check` 可用于 CI 或本地检查是否存在待同步内容

### `agent-context validate`

校验 `.agent-context/` 的结构是否合法。

```bash
agent-context validate
```

会检查的内容包括：

- 当前计划是否唯一
- `plan.md` 是否存在
- 计划状态是否有效
- 目录结构是否符合协议

### `agent-context status`

查看当前 agent-context 状态。

```bash
agent-context status
```

输出重点：

- 当前计划编号和状态
- preparing 队列里还有哪些计划
- 已归档计划数量

### `agent-context done`

归档当前已执行计划。

```bash
agent-context done
agent-context done --yes
```

说明：

- 只有当前计划是 `已执行` 时才能归档
- 归档后如存在 preparing 计划，会自动晋升一个新的当前计划

## 通用选项

| 选项 | 适用命令 | 作用 |
| ---- | -------- | ---- |
| `--tools <tools>` | `install` / `sync` | 指定工具列表，逗号分隔 |
| `--check` | `install` / `sync` | 只检查，不写入文件 |
| `--yes` | `install` / `done` | 跳过交互确认 |
