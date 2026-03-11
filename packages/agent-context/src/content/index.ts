import type { SkillArtifacts, ToolTarget } from '../types'
import { ACTION_NAMES, ACTION_RENDERERS } from './actions'

const SKILL_NAME = 'ac-workflow'
const SKILL_DESCRIPTION =
  '管理 .agent-context 计划生命周期，按 init、plan、replan、implement、patch、done 协议推进任务。'

export function renderSkillArtifacts(target: ToolTarget): SkillArtifacts {
  const files: SkillArtifacts['files'] = [
    { relativePath: 'SKILL.md', body: renderNavigator(target) },
    ...ACTION_NAMES.map((name) => ({
      relativePath: `actions/${name}.md`,
      body: ACTION_RENDERERS[name]()
    }))
  ]

  if (target.metadataFiles.includes('openai')) {
    files.push({ relativePath: 'agents/openai.yaml', body: renderOpenAIMetadata() })
  }

  return { files }
}

// ── Navigator ────────────────────────────────────────

function renderNavigator(target: ToolTarget): string {
  return `${renderFrontmatter(target)}
# Agent Context

管理项目中的 \`.agent-context/\` 计划生命周期。匹配用户意图后，读取对应协议文件（相对于本文件所在目录）严格执行。

## 意图匹配

| 用户意图 | 动作 | 协议文件 |
|----------|------|----------|
| 初始化项目上下文、补全 AGENTS | init | \`actions/init.md\` |
| 给需求出计划、拆分任务 | plan | \`actions/plan.md\` |
| 重做计划、调整方案 | replan | \`actions/replan.md\` |
| 按计划开始做、实现当前计划 | implement | \`actions/implement.md\` |
| 补一个小改动、在当前结果上修 | patch | \`actions/patch.md\` |
| 任务彻底完成、归档当前计划 | done | \`actions/done.md\` |

## 全局约束

- 状态机两态：\`未执行\`、\`已执行\`。
- 任意时刻最多一个当前计划：\`.agent-context/plan-{number}\`。
- 多个当前计划 → 拒绝执行，提示恢复单活跃状态。
- 计划编号全局递增，不复用。补丁编号在单计划目录内递增，不复用。

## 目录结构

\`\`\`text
.agent-context/
├── plan-{N}/          # 当前计划（最多一个）
│   ├── plan.md
│   └── patch-{N}.md
├── preparing/         # 待执行计划队列
│   └── plan-{N}/
└── done/              # 已归档计划
    └── plan-{N}-{YYYYMMDD}/
\`\`\`

编号规则：扫描全部 \`plan-N\` 目录取 \`max(N)+1\`。
`
}

// ── Frontmatter & Metadata ──────────────────────────

function renderFrontmatter(target: ToolTarget): string {
  const lines = ['---', `name: ${SKILL_NAME}`, `description: ${SKILL_DESCRIPTION}`]

  if (target.frontmatterProfile === 'claude') {
    lines.push('argument-hint: [request]')
  }

  if (target.frontmatterProfile === 'copilot') {
    lines.push('license: MIT')
  }

  lines.push('---', '')
  return `${lines.join('\n')}\n`
}

function renderOpenAIMetadata(): string {
  return `interface:
  display_name: "Agent Context"
  short_description: "统一管理 .agent-context 计划生命周期"
  default_prompt: "Use $ac-workflow to manage the current task through init, plan, replan, implement, patch, or done."

policy:
  allow_implicit_invocation: true
`
}
