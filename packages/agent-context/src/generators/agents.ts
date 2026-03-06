import type { ToolTarget } from '../domain/types.js'

export function renderAgentsGuide(targets: ToolTarget[]): string {
  const tools = targets
    .map(target => `- ${target.name}: \`${target.rootDir}\``)
    .join('\n')

  return `# AGENT 上下文指南

本区块由 \`agent-context\` 自动维护，用于定义计划工作流约束。

## 目标优先级

正确性 → 安全性 → 可维护性 → 可读性 → 性能 → 简洁性

## 命令工作流

- 命令语义固定为：\`init\`、\`plan\`、\`replan\`、\`implement\`、\`patch\`、\`done\`。
- 命令文件命名采用 \`ac-*\`，例如 \`ac-plan.md\`。
- 计划状态机仅允许：\`未执行\`、\`已执行\`。
- 任意时刻最多一个当前计划目录：\`.agent-context/plan-{number}\`。
- 计划编号全局递增且不可复用；补丁编号在单计划目录内递增且不可复用。

## 工具目录映射

${tools}

## 计划目录语义

\`\`\`text
.agent-context/
  plan-{number}/
    plan.md
    patch-{number}.md
  preparing/
    plan-{number}/
      plan.md
  done/
    plan-{number}-{YYYYMMDD}/
      plan.md
      patch-{number}.md
\`\`\`

## plan.md 最小格式

\`\`\`markdown
# {计划名称}

> 状态: 未执行

## 目标

{明确的目标描述}

## 内容

{详细实施步骤}

## 影响范围

## 历史补丁
\`\`\``
}
