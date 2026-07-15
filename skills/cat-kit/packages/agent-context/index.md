# @cat-kit/agent-context

Node.js CLI，用于安装 `ac-workflow` Skill，并管理 `.agent-context/` 中的计划状态。它不发布编程 API。

## 如何选择

CLI 负责安装和状态操作：

- `agent-context install [--tools <ids>] [--check] [--yes]`：安装 Skill。默认写入 `.agents/skills/ac-workflow/`；`--tools` 可选 `claude,codex,cursor,antigravity,agents,gemini,copilot`。
- `agent-context sync [--check]`：升级包后刷新已安装 Skill；`--check` 只报告差异。
- `agent-context init [--scope <name>] [--yes]`：为当前协作者初始化 SCOPE，默认读取 Git `user.name`。
- `agent-context status`：给人查看当前计划、队列和归档数量。
- `agent-context context`：输出含校验结果的 JSON 快照，适合脚本或智能体读取。
- `agent-context validate`：只校验目录、计划数量和状态格式。
- `agent-context done [--yes]`：归档已执行计划，并在存在 preparing 计划时晋升下一项。

Skill 负责实际协作动作。安装后直接向智能体表达：

- `plan`：创建并拆分新计划；`replan`：重做尚未执行的计划。
- `implement`：执行当前未执行计划；`patch`：修补已执行计划。
- `rush`：对单一、清晰任务连续规划并实施。
- `review`：审查当前未执行计划或已执行实现。
- `done`：确认完成后调用 CLI 归档。
- Skill 的 `init` 用于初始化协作约定；不要与初始化 SCOPE 的 CLI `agent-context init` 混淆。

## 最小示例

```bash
npm install -g @cat-kit/agent-context
agent-context install --tools cursor
agent-context init
agent-context validate
```

随后对已发现该 Skill 的智能体说：

```text
为“增加导出 Excel 功能”创建计划
```

## 约束与边界

- `plan`、`replan`、`implement`、`patch`、`rush`、`review` 不是 CLI 子命令；它们是安装后由智能体执行的 Skill 动作。
- 同一 SCOPE 同时最多一个当前计划，状态只允许 `未执行` 或 `已执行`。
- `done` 仅用于真正完成且状态为 `已执行` 的计划；暂停工作不要归档。
- `install --check` 和 `sync --check` 不写文件；发现差异时会以非 0 状态退出，可用于 CI。
- 包未声明 `exports`，也没有可用的根类型入口。不要导入包根、`src` 或 `dist` 深路径。

完整的跨阶段操作示例见 [examples.md](examples.md)。
