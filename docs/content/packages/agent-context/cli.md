---
title: CLI 命令
description: 'agent-context CLI 的初始化、安装、同步、校验、状态、归档与索引命令'
outline: deep
---

# CLI 命令

## 介绍

`agent-context` 的 CLI 不负责替代 Skill action。它只做四类事：

- 初始化 SCOPE 与安装/同步 Skill 文件
- 校验 `.agent-context/` 结构
- 查看状态与归档当前计划
- 生成或更新计划索引

对话里说"出计划""开始实现""补 patch"触发的是 Skill action，不是 CLI 子命令。

## 快速使用

最常用的命令：

```bash
agent-context init          # 首次使用，初始化 SCOPE
agent-context install       # 安装 Skill 到 AI 工具目录
agent-context validate      # 校验目录结构
agent-context status        # 查看当前状态
agent-context done          # 归档已执行计划
agent-context index         # 生成/更新计划索引
```

安装完成后，日常推进通常靠自然语言触发 Skill；CLI 更多用于初始化、检查和收尾。

## API参考

### `agent-context init`

初始化当前项目的 SCOPE。首次在项目中使用时必须运行，自动检测 git `user.name` 作为 SCOPE 名称，创建 `.agent-context/.env` 和作用域目录。

```bash
agent-context init
agent-context init --scope alice
agent-context init --yes
```

| 选项             | 说明                                      |
| ---------------- | ----------------------------------------- |
| `--scope <name>` | 手动指定 SCOPE 名称，不使用 git user.name |
| `--yes`          | 非交互模式：自动覆盖已存在的 SCOPE        |

如果 `.env` 中已有 SCOPE，默认会询问是否覆盖。

### `agent-context install`

安装 `ac-workflow` Skill 到 AI 工具的约定目录。

```bash
agent-context install
agent-context install --tools claude,codex,cursor
agent-context install --check --tools copilot
agent-context install --yes
```

| 选项              | 说明                                             |
| ----------------- | ------------------------------------------------ |
| `--tools <tools>` | 指定目标工具，逗号分隔                           |
| `--check`         | 只检查是否会产生变更，不写文件                   |
| `--yes`           | 非交互模式：优先复用已安装工具，否则安装全部工具 |

支持的工具：

| 工具           | Skill 目录                      |
| -------------- | ------------------------------- |
| Claude         | `.claude/skills/agent-context/` |
| Codex          | `.codex/skills/agent-context/`  |
| Cursor         | `.cursor/skills/agent-context/` |
| Antigravity    | `.agent/skills/agent-context/`  |
| GitHub Copilot | `.github/skills/agent-context/` |

Codex 会额外生成 `agents/openai.yaml` 元数据文件。

### `agent-context sync`

同步项目中已安装的 Skill 内容，适合升级包版本后刷新协议文件。

```bash
agent-context sync
agent-context sync --tools codex,cursor
agent-context sync --check
```

| 选项              | 说明                               |
| ----------------- | ---------------------------------- |
| `--tools <tools>` | 指定目标工具，逗号分隔             |
| `--check`         | 只检查是否存在待同步内容，不写文件 |

### `agent-context validate`

校验 `.agent-context/` 的结构是否合法。

```bash
agent-context validate
```

检查内容：

- SCOPE 是否已初始化
- 当前计划是否唯一
- `plan.md` 是否存在
- 计划状态是否有效（`未执行` 或 `已执行`）
- 目录结构是否符合协议

### `agent-context status`

查看当前 agent-context 状态。

```bash
agent-context status
```

输出内容：

- 当前 SCOPE 名称
- 当前计划编号和状态
- preparing 队列中的计划数量
- 已归档计划数量

### `agent-context done`

归档当前已执行计划，移入 `done/` 目录。

```bash
agent-context done
agent-context done --yes
```

| 选项    | 说明               |
| ------- | ------------------ |
| `--yes` | 跳过确认，直接归档 |

归档后的行为：

- 当前计划移入 `.agent-context/{scope}/done/plan-{N}-{YYYYMMDD}/`
- 如果 `preparing/` 中有待执行计划，自动晋升编号最小的为新当前计划
- 自动调用 `index` 更新计划索引

### `agent-context index`

生成或更新当前 SCOPE 的计划索引文件 `.agent-context/{scope}/index.md`。

```bash
agent-context index
```

索引文件按以下顺序列出所有计划：

1. 已归档计划（`done/`）— 标记为 `[x]`
2. 当前计划 — 已执行标记 `[x]`，未执行标记 `[ ]`
3. 待执行计划（`preparing/`）— 标记 `[ ]`

每项格式为 `- [x/ ] [计划标题](相对路径)`，标题从 `plan.md` 的一级标题提取。

归档计划时（`done`）会自动更新索引，也可手动运行。

## 通用选项汇总

| 选项              | 适用命令                    | 作用                   |
| ----------------- | --------------------------- | ---------------------- |
| `--tools <tools>` | `install` / `sync`          | 指定工具列表，逗号分隔 |
| `--check`         | `install` / `sync`          | 只检查，不写入文件     |
| `--yes`           | `install` / `init` / `done` | 跳过交互确认           |
| `--scope <name>`  | `init`                      | 手动指定 SCOPE 名称    |
