# 新增 prompt-gen 全局提示词生成命令

> 状态: 已执行

## 目标

在 `@cat-kit/agent-context` CLI 中新增 `prompt-gen` 子命令，向用户主目录下各 AI 工具的全局提示词文件写入指定内容。支持 claude、codex、gemini、antigravity 四个工具。

## 内容

### 步骤 1：新增 `PromptToolId` 类型

在 `packages/agent-context/src/types.ts` 中添加：

```ts
export type PromptToolId = 'claude' | 'codex' | 'gemini' | 'antigravity'
```

### 步骤 2：创建 `prompt-gen` 命令文件

新建 `packages/agent-context/src/commands/prompt-gen.ts`，实现以下逻辑：

**工具配置映射**（每个工具的目标文件路径，均为用户主目录的绝对路径）：
- `claude` → `~/.claude/CLAUDE.md`
- `codex` → `~/.codex/AGENTS.md`
- `gemini` → `~/.gemini/GEMINI.md`
- `antigravity` → `~/.gemini/AGENTS.md`

**命令选项**：
- `--tools <tools>`：逗号分隔的工具列表（默认全部4个）
- `--yes`：非交互模式，文件已存在时直接覆盖
- `--check`：仅打印将要写入的文件路径和内容，不实际写入

**写入行为**：
- 若目标文件不存在：直接创建（同时创建父目录）
- 若目标文件已存在且未传 `--yes`：通过 checkbox prompt 让用户确认哪些工具要覆盖，未选中的跳过
- 若目标文件已存在且传了 `--yes`：直接覆盖

**写入内容**（所有工具相同，为纯 Markdown 字符串常量，定义在该文件中）：

```md
## 语言与沟通风格

- 默认用中文沟通，技术术语保留英文原文（不要翻译 TypeScript、hook、render此类的）

## 本地环境
- 硬件：MacBook Air M5，arm64 架构
- Terminal：Ghostty

## 时效性要求

- 今天日期：每次对话开始时你应该知道当前日期，请基于此判断信息的时效性

## 不要做的事情
- 不要在代码末尾加「你可以进一步扩展...」这类废话
- 不要重复我刚说过的话（「你提到了...」）

## 自适应纠错机制
- 我是一个人类，我提的问题很可能会存在逻辑漏洞，不要盲目执行我可能错误的思路， 要用于纠正我的错误。
```

**输出格式**（仿照 install 的 printRunSummary 风格）：
- `--check` 模式：逐行打印 `会写入: <工具名>  →  <绝对路径>`
- 实际写入模式：完成后打印摘要，区分「新建」和「覆盖」，跳过的工具标注「已跳过」

### 步骤 3：在 `cli.ts` 中注册命令

在 `packages/agent-context/src/cli.ts` 中导入并注册 `prompt-gen` 命令：

```
program
  .command('prompt-gen')
  .description('在用户主目录下生成各 AI 工具的全局提示词文件')
  .option('--tools <tools>', '指定目标工具，逗号分隔：claude,codex,gemini,antigravity')
  .option('--yes', '文件已存在时直接覆盖，不询问')
  .option('--check', '仅检查将要写入的内容，不实际写入')
  .action(promptGenCommand)
```

### 步骤 4：更新 `packages/agent-context/AGENTS.md` 目录结构注释

在 AGENTS.md 的目录结构中添加 `prompt-gen.ts` 条目及其说明。

## 影响范围

- `packages/agent-context/src/types.ts` — 新增 `PromptToolId` 类型
- `packages/agent-context/src/commands/prompt-gen.ts` — 新增 `prompt-gen` 命令实现
- `packages/agent-context/src/cli.ts` — 注册 `prompt-gen` 子命令
- `packages/agent-context/AGENTS.md` — 更新目录结构说明

## 历史补丁
