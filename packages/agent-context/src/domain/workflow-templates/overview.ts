import { code, fence, type WorkflowContext } from './context.js'

export function renderOverview(c: WorkflowContext): string {
  return `${c.frontmatter('Agent Context 工作流总览，定义计划生命周期与命令语义')}\
# Agent Context 工作流

使用 ${code(c.cmdPrefix())} 前缀命令管理计划的完整生命周期。

## 命令速览

| 命令 | 描述 | 是否需要描述 |
|------|------|:---:|
| ${code(c.cmd('init'))} | 初始化项目上下文，生成或优化 AGENTS.md | 可选 |
| ${code(c.cmd('plan'))} | 创建新计划 | 必须 |
| ${code(c.cmd('replan'))} | 重规划未实施的计划 | 必须 |
| ${code(c.cmd('implement'))} | 实施当前计划 | 禁止 |
| ${code(c.cmd('patch'))} | 对已实施计划执行补丁 | 必须 |
| ${code(c.cmd('done'))} | 归档当前已完成计划 | 禁止 |

## 状态机

计划仅有两种状态，不可使用其他别名：

- ${code('> 状态: 未执行')} — 计划已创建但尚未实施
- ${code('> 状态: 已执行')} — 计划已实施完成

状态转换路径：${code('未执行')} → (${code(c.cmd('implement'))}) → ${code('已执行')} → (${code(c.cmd('done'))}) → 归档

## 目录结构

${fence}text
.agent-context/
  plan-{number}/          # 当前计划（唯一）
    plan.md
    patch-{number}.md
  preparing/              # 待执行计划队列
    plan-{number}/
      plan.md
  done/                   # 已归档计划
    plan-{number}-{YYYYMMDD}/
      plan.md
      patch-{number}.md
${fence}

## 核心约束

- 任意时刻最多只能有一个当前计划（${code('.agent-context/plan-{number}')})。
- 计划编号全局递增且不可复用，编号范围覆盖当前、preparing、done 三个区域。
- 补丁编号在单个计划目录内递增且不可复用。
- 若检测到多个当前计划，所有命令必须拒绝执行并提示恢复单活跃状态。

## plan.md 标准格式

${fence}markdown
# {计划名称}

> 状态: 未执行

## 目标

{明确的目标描述}

## 内容

{详细的实施步骤和内容}

## 影响范围

## 历史补丁
${fence}

## patch.md 标准格式

${fence}markdown
# {补丁名称}

## 补丁内容

{说明修改了什么、为什么修改}

## 影响范围

- 新增文件: ${code('/path/to/file')}
- 修改文件: ${code('/path/to/file')}
- 删除文件: ${code('/path/to/file')}
${fence}`
}
