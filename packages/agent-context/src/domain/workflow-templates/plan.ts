import { code, fence, renderNextSteps, type WorkflowContext } from '../workflow-context'

export function renderPlan(c: WorkflowContext): string {
  return `${c.frontmatter('创建新计划并维护单当前计划 + preparing 队列结构')}\
# ${c.invoke('plan')} {描述}

## 严格前置验证

- 必须附带描述，描述为空时拒绝执行。
- 不存在进行中的 ${code('preparing')} 计划。
- 不存在已实施但未归档的当前计划（状态为 ${code('已执行')} 且未归档到 ${code('done/')})。
- 若检测到多个当前计划，拒绝执行并提示恢复单活跃状态。

## 编号分配规则

- 扫描 ${code('.agent-context/')}、${code('.agent-context/preparing/')}、${code('.agent-context/done/')} 三个范围内所有 ${code('plan-{number}')} 目录。
- 取最大编号 + 1 作为新计划起始编号。
- 编号不可复用，即使对应计划已归档或删除。

## 执行步骤

1. 澄清需求后按复杂度决定单计划或多计划拆分。
2. 计划目录命名为 ${code('plan-{number}')}，按编号分配规则获取编号。
3. 多计划拆分时：
   - 最小编号进入 ${code('.agent-context/')} 作为当前计划。
   - 其余编号进入 ${code('.agent-context/preparing/')}。
4. 单计划：直接创建到 ${code('.agent-context/plan-{number}')}。
5. 每个计划必须创建 ${code('plan.md')}，严格遵循下方标准模板。
6. ${code('plan.md')} 中的状态行必须唯一且位于标题后，仅允许 ${code('未执行')} 或 ${code('已执行')}。

## plan.md 标准模板

每个计划目录中的 ${code('plan.md')} 必须遵循以下格式：

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

字段说明：

- **计划名称**：简洁概括本计划要做的事。
- **状态**：新建时固定为 ${code('> 状态: 未执行')}，仅在 ${code(c.cmd('implement'))} 完成后更新为 ${code('> 状态: 已执行')}。
- **目标**：清晰描述计划要达成的结果，需有实质内容（不可为空）。
- **内容**：按步骤列出详细的实施方案，需有实质内容（不可为空）。
- **影响范围**：在 ${code(c.cmd('implement'))} 完成后记录新增/修改/删除的文件路径，创建时留空。
- **历史补丁**：在 ${code(c.cmd('patch'))} 执行后追加补丁索引，创建时留空。

## 失败条件

- 描述为空 → 拒绝执行，提示必须附带描述。
- 存在未归档的已实施当前计划 → 拒绝执行，提示先运行 ${code(c.cmd('done'))}。
- 存在多个当前计划 → 拒绝执行，提示恢复单活跃状态。
- 编号计算失败 → 拒绝执行，提示检查目录结构完整性。

${renderNextSteps(c, [
  { command: 'implement', description: '实施当前计划' },
  { command: 'replan', description: '重新规划（如需调整）' }
])}`
}
