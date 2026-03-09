import { code, fence, renderNextSteps, renderPreamble, type WorkflowContext } from '../workflow-context'

export function renderImplement(c: WorkflowContext): string {
  return `${c.frontmatter('实施当前计划并将状态从未执行更新为已执行')}\
# ${c.invoke('implement')}

${renderPreamble(c, 'implement', `实施当前计划 ${code('.agent-context/plan-{number}/plan.md')} 中的全部步骤，通过验证循环后将状态从「未执行」更新为「已执行」。`)}

## 前置规则

- 带描述 → 拒绝执行。
- 当前计划不存在 → 拒绝执行，提示先运行 ${code(c.cmd('plan'))}。
- 当前计划状态为 ${code('已执行')} → 拒绝执行，提示使用 ${code(c.cmd('patch'))} 或 ${code(c.cmd('done'))}。
- ${code('## 目标')} 或 ${code('## 内容')} 为空 → 拒绝执行，提示补充内容。
- 存在多个当前计划 → 拒绝执行，提示恢复单活跃状态。
- 仅操作当前计划，不直接操作 ${code('preparing/')} 中的计划。
- 遇到阻塞问题应向用户报告，不可静默跳过。

## 执行步骤

1. 读取当前计划 ${code('plan.md')}，理解 ${code('## 目标')} 与 ${code('## 内容')}。
2. 依据 ${code('## 内容')} 中的步骤逐项实施。
3. **验证循环**（全部通过前不可进入步骤 4）：
   a. 逐项对照 ${code('## 内容')} 确认每个步骤已实施。
   b. 运行项目验证：类型检查 → lint → 测试。
   c. 若存在失败项 → 修复后回到 a 重新验证。
   d. 全部通过 → 进入步骤 4。
4. 更新 ${code('plan.md')} 状态行：${code('> 状态: 未执行')} → ${code('> 状态: 已执行')}。状态行须唯一，仅在验证通过后更新。
5. 更新 ${code('## 影响范围')}，记录所有变更文件：

   ${fence}markdown
   - 新增文件: ${code('/path/to/new-file')}
   - 修改文件: ${code('/path/to/modified-file')}
   - 删除文件: ${code('/path/to/deleted-file')}
   ${fence}

${renderNextSteps(c, [
  { command: 'done', description: '归档当前计划' },
  { command: 'patch', description: '补丁修复' }
])}`
}
