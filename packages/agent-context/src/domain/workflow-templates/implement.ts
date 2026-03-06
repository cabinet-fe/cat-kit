import { code, fence, renderNextSteps, type WorkflowContext } from '../workflow-context'

export function renderImplement(c: WorkflowContext): string {
  return `${c.frontmatter('实施当前计划并将状态从未执行更新为已执行')}\
# ${c.invoke('implement')}

## 严格前置验证

- 不可附带描述，带描述时拒绝执行。
- 必须存在且仅存在一个当前计划（${code('.agent-context/plan-{number}')})。
- 当前计划状态必须为 ${code('未执行')}（已执行时拒绝，提示使用 ${code(c.cmd('patch'))} 或 ${code(c.cmd('done'))})。
- ${code('plan.md')} 的 ${code('## 目标')} 与 ${code('## 内容')} 必须有实质内容（空内容时拒绝执行）。

## 执行步骤

1. 读取当前计划的 ${code('plan.md')}，理解 ${code('## 目标')} 与 ${code('## 内容')}。
2. 依据 ${code('## 内容')} 中的步骤逐项实施。
3. 完成必要验证（测试、类型检查、lint 等）。
4. 更新 ${code('plan.md')} 的状态行：

   将：
   ${fence}
   > 状态: 未执行
   ${fence}
   更新为：
   ${fence}
   > 状态: 已执行
   ${fence}

5. 更新 ${code('plan.md')} 的 ${code('## 影响范围')}，按以下格式记录所有变更文件：

   ${fence}markdown
   ## 影响范围

   - 新增文件: ${code('/path/to/new-file')}
   - 修改文件: ${code('/path/to/modified-file')}
   - 删除文件: ${code('/path/to/deleted-file')}
   ${fence}

## 状态更新规则

- 状态更新必须发生在实施完成且验证通过之后，不可提前更新。
- 状态行必须唯一（整个 ${code('plan.md')} 中只能出现一次 ${code('> 状态:')} 行）。
- 仅允许从 ${code('未执行')} 更新为 ${code('已执行')}，不可使用其他状态值。

## 约束

- ${code(c.cmd('implement'))} 仅操作当前计划，不直接操作 ${code('preparing/')} 中的计划。
- 实施过程中若遇到阻塞问题，应向用户报告而非静默跳过。

## 失败条件

- 附带了描述 → 拒绝执行。
- 当前计划不存在 → 拒绝执行，提示先运行 ${code(c.cmd('plan'))}。
- 当前计划状态为 ${code('已执行')} → 拒绝执行，提示使用 ${code(c.cmd('patch'))} 或 ${code(c.cmd('done'))}。
- ${code('## 目标')} 或 ${code('## 内容')} 为空 → 拒绝执行，提示补充计划内容。
- 存在多个当前计划 → 拒绝执行，提示恢复单活跃状态。

${renderNextSteps(c, [
  { command: 'done', description: '归档当前计划（确认完成时）' },
  { command: 'patch', description: '执行补丁修复（发现问题时）' }
])}`
}
