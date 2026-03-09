import { code, fence, renderNextSteps, renderPreamble, type WorkflowContext } from '../workflow-context'

export function renderPatch(c: WorkflowContext): string {
  return `${c.frontmatter('基于当前已执行计划创建补丁并回写历史记录')}\
# ${c.invoke('patch')} {描述}

${renderPreamble(c, 'patch', `基于当前已执行计划创建增量补丁，修复问题或追加变更，生成 ${code('patch-{number}.md')} 并回写计划的影响范围与历史记录。`)}

## 前置规则

- 描述为空 → 拒绝执行。
- 当前计划不存在 → 拒绝执行，提示先运行 ${code(c.cmd('plan'))}。
- 当前计划状态为 ${code('未执行')} → 拒绝执行，提示先运行 ${code(c.cmd('implement'))}。
- 存在多个当前计划 → 拒绝执行，提示恢复单活跃状态。
- 补丁不改变计划状态，完成后保持 ${code('已执行')}。

## 执行步骤

1. 阅读 ${code('plan.md')} 与已有 ${code('patch-{number}.md')}，了解上下文与历史补丁，避免重复修复。
2. 根据描述执行补丁所需的代码变更。
3. 完成必要验证（测试、类型检查等）。
4. 创建 ${code('patch-{number}.md')}（编号：扫描当前计划目录已有补丁，取 max+1），遵循下方模板。
5. 回写 ${code('plan.md')}：
   - ${code('## 历史补丁')}：追加 ${code('- patch-{number}: {补丁名称}')}，按编号去重。
   - ${code('## 影响范围')}：合并本次变更路径，按路径去重。

## patch.md 标准模板

${fence}markdown
# {补丁名称}

## 补丁内容

{修改了什么、为什么修改}

## 影响范围

- 新增文件: ${code('/path/to/file')}
- 修改文件: ${code('/path/to/file')}
- 删除文件: ${code('/path/to/file')}
${fence}

${renderNextSteps(c, [
  { command: 'done', description: '归档当前计划' },
  { command: 'patch', description: '继续补丁' }
])}`
}
