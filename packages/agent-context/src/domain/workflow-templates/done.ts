import { code, renderNextSteps, renderPreamble, type WorkflowContext } from '../workflow-context'

export function renderDone(c: WorkflowContext): string {
  return `${c.frontmatter('将当前已执行计划标记为真正完成并归档，必要时晋升 preparing 队列')}\
# ${c.invoke('done')}

${renderPreamble(c, 'done', `确认当前已执行计划真正完成，归档到 ${code('.agent-context/done/')} 目录，并自动晋升 ${code('preparing/')} 队列中的下一个计划。`)}

## 前置规则

- 带描述 → 拒绝执行。
- 当前计划不存在 → 拒绝执行，提示先运行 ${code(c.cmd('plan'))}。
- 当前计划状态为 ${code('未执行')} → 拒绝执行，提示先运行 ${code(c.cmd('implement'))}。
- 存在多个当前计划 → 拒绝执行，提示恢复单活跃状态。
- 必须得到用户确认后才可归档；用户未确认 → 中止。

## 执行步骤

1. **用户确认**：向用户确认当前计划已真正完成，可以归档。
2. **归档当前计划**：将 ${code('.agent-context/plan-{number}')} 移动到 ${code('.agent-context/done/plan-{number}-{YYYYMMDD}')}（当日日期），包含完整 ${code('plan.md')} 与所有 ${code('patch-{number}.md')}。编号不可被新计划复用。
3. **晋升 preparing 队列**：若 ${code('.agent-context/preparing/')} 非空，将最小编号计划移至 ${code('.agent-context/')} 作为新当前计划。
4. **校验**：确认归档完整，晋升后仍满足单当前计划约束；失败则回滚。
5. **输出反馈**：报告归档路径、是否晋升及晋升编号、是否还有待执行计划。

${renderNextSteps(c, [
  { command: 'plan', description: '创建新计划' }
])}`
}
