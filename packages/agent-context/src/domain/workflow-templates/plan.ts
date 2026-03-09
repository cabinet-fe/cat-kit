import {
  code,
  fence,
  renderNextSteps,
  renderPreamble,
  type WorkflowContext
} from '../workflow-context'

export function renderPlan(c: WorkflowContext): string {
  return `${c.frontmatter('创建新计划并维护单当前计划 + preparing 队列结构')}\
# ${c.invoke('plan')} {描述}

${renderPreamble(c, 'plan', `创建新的执行计划，写入 ${code('.agent-context/plan-{number}/plan.md')}。按复杂度可拆分为多个计划，维护「单当前计划 + preparing 队列」结构。`)}

## 前置规则

- 描述为空 → 拒绝执行，提示必须附带描述。
- 存在未归档的已执行当前计划 → 拒绝执行，提示先运行 ${code(c.cmd('done'))}。
- 存在多个当前计划 → 拒绝执行，提示恢复单活跃状态。
- 编号：扫描 ${code('.agent-context/{,preparing/,done/}')} 全部 ${code('plan-N')}，取 max(N)+1，不复用。

## 执行步骤

1. **需求澄清**（存在以下任一歧义时必须向用户提问，否则直接跳到步骤 2）：
   - 范围边界不清：无法判定影响哪些文件或模块。
   - 存在显著不同的技术路径需用户决策。
   - 验收标准不明确：无法判断何时算"完成"。
2. 按复杂度决定单计划或多计划拆分。
3. 多计划拆分时：最小编号进入 ${code('.agent-context/')} 作为当前计划，其余进入 ${code('.agent-context/preparing/')}。单计划直接创建到 ${code('.agent-context/plan-{number}')}。
4. 每个计划创建 ${code('plan.md')}，遵循下方标准模板。
5. **计划自检**（不通过则修改后重新检查）：
   - 每个步骤可独立执行且有明确完成标准。
   - 不存在过度拆分（过于琐碎）或拆分不足（单步骤过于复杂）。
   - 影响范围可预估。

## plan.md 标准模板

${fence}markdown
# {计划名称}

> 状态: 未执行

## 目标

{明确的目标描述}

## 内容

{详细的实施步骤和内容}

## 影响范围

- 新增文件: \`/path/to/file\`
- 修改文件: \`/path/to/file\`
- 删除文件: \`/path/to/file\`

## 历史补丁

- patch-1: {补丁名称}
${fence}

- 状态行唯一，仅允许 ${code('未执行')} 或 ${code('已执行')}。
- ${code('## 目标')} 与 ${code('## 内容')} 不可为空。
- ${code('## 影响范围')} 与 ${code('## 历史补丁')} 创建时留空，分别由 ${code(c.cmd('implement'))} 和 ${code(c.cmd('patch'))} 写入。

${renderNextSteps(c, [
  { command: 'implement', description: '实施当前计划' },
  { command: 'replan', description: '调整计划' }
])}`
}
