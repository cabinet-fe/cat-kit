# Agent Context

`@cat-kit/agent-context` 为主流 AI 编程助手生成统一的 `ac` 前缀工作流命令，让你用一套固定流程驱动 AI 完成从需求到交付的全过程。

## 它解决什么问题

不同 AI 编程工具（Claude、Codex、Cursor、Copilot……）各有自己的命令格式和目录约定。当你同时使用多个工具时，需要为每个工具分别编写和维护工作流命令，内容重复且容易不一致。

`agent-context` 只需一条命令，就能为你选择的所有工具生成格式正确、内容统一的工作流命令文件。

## 安装

推荐全局安装：

```bash
npm install -g @cat-kit/agent-context
```

## 快速开始

在项目根目录执行：

```bash
agent-context setup
```

交互式选择你使用的 AI 工具后，工具会自动在项目中生成对应的命令文件。之后你就可以在 AI 助手中直接调用这些命令了。

## 工作流

Agent Context 定义了 6 个命令，覆盖一个计划从创建到归档的完整生命周期：

```
init → plan → replan → implement → patch → done
```

| 命令        | 作用             | 典型场景                           |
| ----------- | ---------------- | ---------------------------------- |
| `init`      | 初始化项目上下文 | 当你第一次在这个项目使用时         |
| `plan`      | 创建新计划       | 开始一个新需求或任务               |
| `replan`    | 重新规划         | 计划不合理或需求变更时调整         |
| `implement` | 实施计划         | 让 AI 按计划逐步编码               |
| `patch`     | 补丁修复         | 实施完成后发现需要小幅修改         |
| `done`      | 归档计划         | 任务彻底完成，归档并进入下一个计划 |

### 典型工作流示例

**场景：为项目添加一个新功能**

```
1. /ac-init          ← 首次使用，初始化项目上下文
2. /ac-plan          ← 描述需求，AI 生成实施计划
3. /ac-implement     ← AI 按计划编码实施
4. /ac-patch         ← 修复实施中遗漏的细节
5. /ac-done          ← 确认完成，归档计划
```

**场景：计划不满意，需要调整**

```
1. /ac-plan          ← 创建计划
2. /ac-replan        ← 描述调整方向，AI 重新规划
3. /ac-implement     ← 按新计划实施
4. /ac-done          ← 归档
```

## 支持的工具

| 工具           | 命令文件目录        | 调用方式示例 |
| -------------- | ------------------- | ------------ |
| Claude         | `.claude/commands/` | `/ac:init`   |
| Codex          | `.codex/commands/`  | `/ac-init`   |
| Cursor         | `.cursor/commands/` | `/ac-init`   |
| Antigravity    | `.agents/`          | `/ac-init`   |
| GitHub Copilot | `.github/prompts/`  | `#ac-init`   |

## 命令参考

### `agent-context setup`

初始化工作流命令。交互式选择目标工具后，在项目中生成对应的命令文件。

```bash
# 交互式
agent-context setup

# 直接指定工具，跳过选择
agent-context setup --tools claude,cursor,copilot
```

### `agent-context update`

更新已有的工作流命令文件（仅更新已安装的工具，不新增）。适用于升级 `@cat-kit/agent-context` 版本后同步最新模板。

```bash
agent-context update

# 仅检查是否有待更新内容，不实际写入
agent-context update --check
```

### 通用选项

| 选项              | 说明                   |
| ----------------- | ---------------------- |
| `--tools <tools>` | 指定目标工具，逗号分隔 |
| `--yes`           | 非交互模式             |
| `--check`         | 仅检查，不写入文件     |

## License

MIT
