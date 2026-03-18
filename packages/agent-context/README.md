# Agent Context

`@cat-kit/agent-context` 用来给 AI 编程助手安装统一的 `ac-workflow` Skill，让不同工具都按同一套 `.agent-context/` 协议管理任务。

它解决的不是“如何生成代码”，而是“如何让 AI 在多轮协作里始终知道当前计划、下一步动作和什么时候该归档”。

## 核心模型

`agent-context` 由两部分组成：

- CLI：负责安装、同步、校验和归档
- Skill：负责在对话里识别 `init / plan / replan / implement / patch / rush / done` 这些动作

安装 Skill 后，AI 会围绕项目根目录的 `.agent-context/` 目录工作：

```text
.agent-context/
├── .env               # SCOPE 配置（SCOPE=<name>）
├── .gitignore
└── {scope}/           # 作用域目录（按协作者隔离）
    ├── index.md       # 计划索引（自动生成）
    ├── plan-{N}/      # 当前计划（最多一个）
    │   ├── plan.md
    │   └── patch-{N}.md
    ├── preparing/     # 待执行计划队列
    │   └── plan-{N}/
    └── done/          # 已归档计划
        └── plan-{N}-{YYYYMMDD}/
```

生命周期如下：

```text
init -> plan -> replan -> implement -> patch -> done
                      └-> rush -> done
```

其中：

- `plan / replan / rush / patch` 需要你给出明确任务描述
- `implement` 不接受额外描述，只执行当前计划
- `done` 最终由 `agent-context done` 归档当前已执行计划

## 安装

推荐全局安装：

```bash
npm install -g @cat-kit/agent-context
```

在项目根目录安装 Skill：

```bash
agent-context install
```

也可以指定工具：

```bash
agent-context install --tools claude,codex,cursor
```

安装完成后，CLI 会在对应目录生成 Skill 文件，例如：

- Codex: `.codex/skills/agent-context/`
- Claude: `.claude/skills/agent-context/`
- Cursor: `.cursor/skills/agent-context/`

## 快速开始

最常见的用法只有三步：

1. 在项目里执行 `agent-context install`
2. 把生成的 Skill 文件和 `.agent-context/` 一起纳入版本管理
3. 直接在对话里对 AI 说出动作意图

例如：

- `初始化这个项目的 agent context`
- `为“增加导出 Excel 功能”出一个计划`
- `按当前计划开始实现`
- `当前计划已经做完，归档它`

## Action 参考

下面的 action 不是 CLI 子命令，而是你对 AI 说的话。AI 安装 Skill 后，会把这些话映射到固定协议。

| Action | 何时使用 | 当前状态要求 | 结果 |
| ------ | -------- | ------------ | ---- |
| `init` | 项目还没建立好协作约定，或者 `AGENTS.md` 不完整 | 无 | 生成或补全 `AGENTS.md`，新项目可继续进入计划 |
| `plan` | 新需求需要正式拆分步骤 | 当前没有冲突中的已执行计划 | 创建 `plan.md`，必要时拆成当前计划 + preparing 队列 |
| `replan` | 计划还没实施，但拆分方式或技术路线要改 | 目标计划必须仍是 `未执行` | 重写计划结构，保留单当前计划模型 |
| `implement` | 计划已经明确，开始真正落地 | 当前计划存在且状态为 `未执行` | 实施全部步骤，验证通过后把计划改为 `已执行` |
| `patch` | 已执行计划上出现 Bug、遗漏项或增量需求 | 当前计划必须是 `已执行` | 执行修补，生成 `patch-{N}.md`，更新影响范围 |
| `rush` | 任务范围很清晰，不想先单独经历 plan 再 implement | 当前不能存在未实施计划 | 直接创建单计划并立刻实施 |
| `done` | 当前计划已经真正完成，需要收尾归档 | 当前计划必须是 `已执行` | 把当前计划移入 `done/`，必要时晋升下一个 preparing 计划 |

### `init`

适合两种场景：

- 新项目刚开始，没有统一协作规则
- 老项目已有代码，但缺少高质量 `AGENTS.md`

你可以这样说：

```text
初始化这个项目的 agent context，技术栈是 Bun + TypeScript，测试用 Vitest
```

AI 会先判断这是新项目还是旧项目，再决定是创建还是补全 `AGENTS.md`。如果项目信息不足，`init` 应该先提问，而不是直接猜。

### `plan`

适合“要做一件事，但还没开始改代码”的阶段。

你可以这样说：

```text
为“给 http 客户端补一个重试插件”出计划
```

`plan` 的重点不是生成一段漂亮的说明，而是产出一个后续可执行的 `plan.md`。如果任务很大，AI 应该拆成“当前计划 + preparing 队列”；如果任务很小，就只建一个计划。

### `replan`

只在“计划还没实施”时使用。它解决的是“原计划思路不对”，不是“代码写完后还想改一点”。

你可以这样说：

```text
重做当前计划，不要引入新依赖，保持 core 零依赖
```

如果当前计划已经执行过，再要求修改方案，就不应该走 `replan`，而应该走 `patch`。

### `implement`

适合“计划已经定了，现在开始按计划干活”的阶段。

你可以这样说：

```text
按当前计划开始实现
```

`implement` 不接受附加需求。它只做一件事：读取当前 `plan.md`，逐步实施、验证、回写状态。如果执行中发现阻塞，AI 应该报告，而不是私自跳过步骤。

### `patch`

适合在“当前计划已经执行完成”之后做增量修补。

你可以这样说：

```text
给当前计划补一个 patch，修复流式读取时空行被跳过的问题
```

`patch` 会保留原计划，把新增修补记录写入 `patch-{N}.md`。如果你只是发现实现里还有一个小问题，不需要新开计划，优先用 `patch`。

### `rush`

适合边界清楚、工作量可控的任务，比如：

- 修一份文档
- 改一个很明确的测试
- 补一个小型脚本

你可以这样说：

```text
rush 一下，把 agent-context 文档里的 action 解释补完整
```

`rush` 的本质是“跳过单独确认计划内容”，但不是跳过计划本身。AI 仍然需要创建 `plan.md`，只是创建后直接实施。

### `done`

适合真正收尾时使用，不适合把“暂时先停一下”伪装成完成。

你可以这样说：

```text
当前计划已经真正完成，归档它
```

归档后，当前计划会进入 `.agent-context/done/`。如果 `preparing/` 里还有下一个计划，它会被晋升为新的当前计划。

## 具体协作场景

下面是几条更具体、可直接复用的协作方式。

### 场景 1：从零开始做一个新功能

适用情况：需求还没拆解，涉及多个文件或多个步骤。

推荐流程：

1. `为“新增 xx 功能”出计划`
2. 查看 AI 生成的 `plan.md`
3. `按当前计划开始实现`
4. 如果上线前又补了一个小需求：`给当前计划补一个 patch，...`
5. 确认全部完成：`当前计划已经真正完成，归档它`

### 场景 2：方案还没落地，但技术路线要改

适用情况：计划还是 `未执行`，只是发现拆分不合理或路线变了。

推荐指令：

```text
重做当前计划，保留目标不变，但改成不引入三方依赖的方案
```

这时应该用 `replan`，而不是让 AI 一边改计划一边偷偷改代码。

### 场景 3：代码已经写完，但需要修一个增量问题

适用情况：当前计划状态已经是 `已执行`。

推荐指令：

```text
给当前计划补一个 patch，修复 Windows 路径兼容问题
```

这时继续走 `plan` 或 `rush` 都会破坏上下文连续性。正确做法是保留主计划，用 `patch` 记录增量修改。

### 场景 4：任务非常明确，不想多轮沟通

适用情况：工作边界清晰，几乎不需要额外澄清。

推荐指令：

```text
rush 一下，把 README 里的命令表更新为最新版本
```

`rush` 很适合这种“知道要改什么，也知道验收标准”的任务，但不适合目标模糊的大需求。

## 多人协作

`agent-context` 通过 SCOPE 机制支持多人在同一项目中独立管理计划：

- 每位协作者拥有独立的作用域目录（`{scope}/`），互不干扰
- SCOPE 名称自动取自 git 配置的 `user.name`
- 计划编号在各 SCOPE 内独立递增
- 首次使用时运行 `agent-context init` 初始化作用域

```text
.agent-context/
├── alice/             # Alice 的计划
│   ├── index.md
│   ├── plan-1/
│   └── done/
├── bob/               # Bob 的计划
│   ├── index.md
│   ├── plan-3/
│   └── done/
└── .env               # 当前用户的 SCOPE
```

## CLI 命令参考

CLI 只负责文件安装、同步和状态管理，不负责替代 action。

### `agent-context init`

初始化作用域。首次在项目中使用时运行，会自动检测 git `user.name` 作为 SCOPE 名称，并创建必要的目录结构。

```bash
agent-context init
agent-context init --scope alice
agent-context init --yes
```

### `agent-context install`

安装 Skill 文件。

```bash
agent-context install
agent-context install --tools codex,claude
agent-context install --check --tools copilot
agent-context install --yes
```

### `agent-context sync`

当你升级了 `@cat-kit/agent-context` 版本后，用它把项目中的 Skill 内容同步到最新协议。

```bash
agent-context sync
agent-context sync --tools cursor,codex
agent-context sync --check
```

### `agent-context validate`

校验 `.agent-context/` 是否符合协议，例如：

- 当前计划是否唯一
- `plan.md` 是否存在
- 状态字段是否合法

```bash
agent-context validate
```

### `agent-context status`

查看当前计划、preparing 队列和归档数量。

```bash
agent-context status
```

### `agent-context done`

归档当前已执行计划。

```bash
agent-context done
agent-context done --yes
```

### `agent-context index`

生成或更新当前 SCOPE 的计划索引文件 `.agent-context/{scope}/index.md`。索引按 done、当前计划、preparing 分类，每项为 `- [x/ ] [标题](相对路径)` 格式。

归档计划时（`done`）会自动调用，也可手动运行：

```bash
agent-context index
```

## 通用选项

| 选项 | 适用命令 | 说明 |
| ---- | -------- | ---- |
| `--tools <tools>` | `install` / `sync` | 指定目标工具，逗号分隔 |
| `--check` | `install` / `sync` | 只检查是否有变更，不写文件 |
| `--yes` | `install` / `init` / `done` | 跳过交互确认；`install` 会优先复用已安装工具 |
| `--scope <name>` | `init` | 手动指定 SCOPE 名称，不使用 git user.name |

## 支持的工具

| 工具 | Skill 目录 |
| ---- | ---------- |
| Claude | `.claude/skills/agent-context/` |
| Codex | `.codex/skills/agent-context/` |
| Cursor | `.cursor/skills/agent-context/` |
| Antigravity | `.agent/skills/agent-context/` |
| GitHub Copilot | `.github/skills/agent-context/` |

其中 Codex 会额外生成 `agents/openai.yaml` 元数据文件，其余工具只生成 Skill 内容本身。

## License

MIT
