# Agent Context

`@cat-kit/agent-context` 为主流 AI 编程助手安装统一的 `agent-context` Skill，让同一套计划生命周期协议在不同工具里保持一致。

`agent-context` 只维护一个核心 Skill，负责统一以下生命周期：

```text
init -> plan -> replan -> implement -> patch -> done
```

Skill 内部会约束 `.agent-context/` 目录、计划编号、`plan.md` 模板、实施验证和归档规则，用户不再需要依赖 `/ac-init` 这类命令触发。

## 安装

推荐全局安装：

```bash
npm install -g @cat-kit/agent-context
```

## 快速开始

在项目根目录执行：

```bash
agent-context install
```

交互式选择目标工具后，CLI 会在对应的 Skills 目录下安装统一的 `agent-context` Skill。

安装完成后，你可以直接向 AI 助手表达自然语言意图，例如：

- “初始化这个项目的 agent context”
- “为这个需求出一个计划”
- “重做当前计划”
- “按当前计划开始实现”
- “给当前计划补一个 patch”
- “当前计划已经真正完成，归档它”

## 支持的工具

| 工具 | Skill 目录 |
| --- | --- |
| Claude | `.claude/skills/agent-context/` |
| Codex | `.codex/skills/agent-context/` |
| Cursor | `.cursor/skills/agent-context/` |
| Antigravity | `.agent/skills/agent-context/` |
| GitHub Copilot | `.github/skills/agent-context/` |

## 生成产物

`agent-context` 会按工具生成对应官方支持的 Skill 产物：

| 工具 | 产物 |
| --- | --- |
| Claude | `SKILL.md`，包含 `name`、`description`、`argument-hint` frontmatter |
| Codex | `SKILL.md` + `agents/openai.yaml` |
| Cursor | `SKILL.md` |
| Antigravity | `SKILL.md` |
| GitHub Copilot | `SKILL.md`，包含 `name`、`description`、`license` frontmatter |

## 命令参考

### `agent-context install`

安装 `agent-context` Skill。

```bash
# 交互式选择工具
agent-context install

# 指定工具
agent-context install --tools claude,codex,cursor

# 仅检查将产生哪些变更
agent-context install --check --tools copilot
```

### `agent-context sync`

同步已经安装的 `agent-context` Skill。适用于升级 `@cat-kit/agent-context` 版本后更新 Skill 内容。

```bash
# 同步当前已安装工具
agent-context sync

# 同步指定工具
agent-context sync --tools claude,cursor

# 仅检查是否有待同步内容
agent-context sync --check
```

### 通用选项

| 选项 | 说明 |
| --- | --- |
| `--tools <tools>` | 指定目标工具，逗号分隔 |
| `--check` | 仅检查，不写入文件 |
| `--yes` | 仅 `install` 支持；非交互模式下优先复用已安装工具，否则安装全部工具 |

## License

MIT
