import { code, fence, renderNextSteps, type WorkflowContext } from '../workflow-context'

export function renderPatch(c: WorkflowContext): string {
  return `${c.frontmatter('基于当前已执行计划创建补丁并回写历史记录')}\
# ${c.invoke('patch')} {描述}

## 严格前置验证

- 必须附带描述，描述为空时拒绝执行。
- 必须存在且仅存在一个当前计划（${code('.agent-context/plan-{number}')})。
- 当前计划状态必须为 ${code('已执行')}（状态为 ${code('未执行')} 时拒绝执行，提示先运行 ${code(c.cmd('implement'))})。

## 编号分配规则

- 扫描当前计划目录下所有 ${code('patch-{number}.md')} 文件。
- 取最大编号 + 1 作为新补丁编号；若无补丁则从 1 开始。
- 编号在单个计划目录内递增且不可复用。

## 执行步骤

1. 阅读 ${code('plan.md')} 与已有的 ${code('patch-{number}.md')}，了解计划上下文与历史补丁，避免重复修复。
2. 根据描述执行补丁所需的代码变更。
3. 完成必要验证（测试、类型检查等）。
4. 按编号分配规则创建 ${code('patch-{number}.md')}，严格遵循下方标准模板。
5. 回写 ${code('plan.md')}：
   - 在 ${code('## 历史补丁')} 追加补丁索引条目（格式：${code('- patch-{number}: {补丁名称}')})，执行去重。
   - 在 ${code('## 影响范围')} 合并本次变更的文件路径，执行去重。

## patch.md 标准模板

每个补丁文件必须遵循以下格式：

${fence}markdown
# {补丁名称}

## 补丁内容

{说明修改了什么、为什么修改}

## 影响范围

- 新增文件: ${code('/path/to/file')}
- 修改文件: ${code('/path/to/file')}
- 删除文件: ${code('/path/to/file')}
${fence}

字段说明：

- **补丁名称**：简洁概括本次补丁的目的。
- **补丁内容**：描述修改了什么（What）以及为什么修改（Why），需有实质内容。
- **影响范围**：按 ${code('新增文件')}、${code('修改文件')}、${code('删除文件')} 三类列出本次补丁涉及的所有文件路径。

## plan.md 回写规则

### 历史补丁追加

在 ${code('## 历史补丁')} 末尾追加一行：

${fence}
- patch-{number}: {补丁名称}
${fence}

若该条目已存在（编号重复），不追加。

### 影响范围合并

将本次补丁的影响范围条目合并到 ${code('plan.md')} 的 ${code('## 影响范围')} 中：

- 按绝对路径去重，同一路径仅保留一条记录。
- 保留首次出现的分类（新增/修改/删除）。

## 状态约束

- ${code(c.cmd('patch'))} 不改变计划状态，补丁完成后状态保持 ${code('已执行')}。

## 失败条件

- 描述为空 → 拒绝执行，提示必须附带描述。
- 当前计划不存在 → 拒绝执行，提示先运行 ${code(c.cmd('plan'))}。
- 当前计划状态为 ${code('未执行')} → 拒绝执行，提示先运行 ${code(c.cmd('implement'))}。
- 存在多个当前计划 → 拒绝执行，提示恢复单活跃状态。

${renderNextSteps(c, [
  { command: 'done', description: '归档当前计划（确认完成时）' },
  { command: 'patch', description: '继续执行补丁（仍有问题时）' }
])}`
}
