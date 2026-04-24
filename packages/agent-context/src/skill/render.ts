import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  AC_ROOT_DIR,
  CONTEXT_SCRIPT_NAME,
  PROTOCOL_DIR,
  SCRIPTS_DIR,
  SKILL_NAME
} from '../constants'
import type { SkillArtifacts, ToolTarget } from '../types'
import { PROTOCOL_NAMES, PROTOCOL_RENDERERS } from './protocols/index'
import { readAgentContextPackageVersion } from './version'

/** 供 frontmatter / 工具匹配的短描述：用用户意图触发，而不是解释内部实现 */
const SKILL_DESCRIPTION =
  'Use this skill when the user explicitly wants the ac-workflow or .agent-context protocol: initialize agent context, create or revise a plan file, execute/patch/review/archive the current .agent-context plan, run rush, sync installed ac-workflow skills, or inspect .agent-context state. Do not use for general coding, implementation, code review, planning, AGENTS.md edits, or docs work unless an ac-workflow/.agent-context plan or protocol is involved.'

export function renderSkillArtifacts(target: ToolTarget): SkillArtifacts {
  const files: SkillArtifacts['files'] = [
    { relativePath: 'SKILL.md', body: renderNavigator(target) },
    ...PROTOCOL_NAMES.map((name) => ({
      relativePath: `${PROTOCOL_DIR}/${name}.md`,
      body: PROTOCOL_RENDERERS[name](target)
    })),
    {
      relativePath: `${PROTOCOL_DIR}/ask-user-question.md`,
      body: renderAskUserQuestionReference(target)
    },
    { relativePath: `${SCRIPTS_DIR}/${CONTEXT_SCRIPT_NAME}`, body: readContextScript() }
  ]

  if (target.metadataFiles.includes('openai')) {
    files.push({ relativePath: 'agents/openai.yaml', body: renderOpenAIMetadata() })
  }

  return { files }
}

// ── Navigator ────────────────────────────────────────

function renderNavigator(target: ToolTarget): string {
  const protocolFile = `${PROTOCOL_DIR}/<protocol>.md`
  const scriptPath = `${SCRIPTS_DIR}/${CONTEXT_SCRIPT_NAME}`
  return `${renderFrontmatter(target)}
# ac-workflow

这是协议路由入口。不要预先读取所有协议文件；只在确定动作后读取需要的 \`${PROTOCOL_DIR}/*.md\`。

## 启动步骤

在执行任何协议或决策前，先从项目根目录运行：

\`\`\`sh
node <SKILL_DIR>/${scriptPath}
agent-context validate
\`\`\`

其中 \`<SKILL_DIR>\` 是本 \`SKILL.md\` 所在目录；若运行时提供技能目录变量，先替换为实际路径。

若不在项目根目录，脚本追加 \`--cwd <project-root>\`。脚本失败或 \`validate\` 不通过时，先按错误修正，再重跑到通过。

只使用脚本返回的 \`scope\`、\`currentPlanStatus\`、\`currentPlanNumber\`、\`currentPlanDir\`、\`currentPlanFile\`、\`nextPlanNumber\`、\`nextPatchNumber\`；不要自行扫描目录推断状态或编号。

## 路由

确定一个动作后，完整读取对应协议文件并按顺序执行。若协议引用其他协议，再读取被引用文件；不要凭记忆执行。

| 状态 | 用户意图 | 动作 |
| --- | --- | --- |
| \`null\` | 初始化上下文、补全 ${target.guideFileName} | 读 \`${PROTOCOL_DIR}/init.md\` |
| \`null\` | 创建计划、拆分需求 | 读 \`${PROTOCOL_DIR}/plan.md\` |
| \`null\` | 明确任务直接计划并实施 | 读 \`${PROTOCOL_DIR}/rush.md\` |
| \`"未执行"\` | 开始执行当前计划 | 读 \`${PROTOCOL_DIR}/implement.md\` |
| \`"未执行"\` | 调整、重做、替换当前计划 | 读 \`${PROTOCOL_DIR}/replan.md\` |
| \`"未执行"\` | 审查计划 | 读 \`${PROTOCOL_DIR}/review.md\` |
| \`"已执行"\` | 修补、补遗漏、追加相关增量 | 读 \`${PROTOCOL_DIR}/patch.md\` |
| \`"已执行"\` | 审查实现 | 读 \`${PROTOCOL_DIR}/review.md\` |
| \`"已执行"\` | 完成并归档 | 运行 \`agent-context done --yes\` |

用户明确点名 \`init\`、\`plan\`、\`replan\`、\`implement\`、\`patch\`、\`rush\`、\`review\` 时，仍必须先完成启动步骤，再读取 \`${protocolFile}\`。无关新需求与当前计划冲突时，先用 ${target.askToolName} 让用户选择处理当前计划还是终止；使用提问工具前先读 \`${PROTOCOL_DIR}/ask-user-question.md\`。

## 硬约束

- 计划状态只允许 \`未执行\` 或 \`已执行\`。
- 任意时刻最多一个当前计划：\`${AC_ROOT_DIR}/{scope}/plan-{number}\`。
- 创建计划使用 \`nextPlanNumber\`；创建补丁使用 \`nextPatchNumber\`。
- 在 \`plan\` 或 \`rush\` 创建计划前，不改业务代码。
- 代码变更只发生在 \`implement\` 或 \`patch\` 协议中。
- \`## 影响范围\` 不记录 \`${AC_ROOT_DIR}/\` 内文件。
`
}

// ── Frontmatter & Metadata ──────────────────────────

function renderFrontmatter(target: ToolTarget): string {
  const pkgVersion = readAgentContextPackageVersion()
  const lines = [
    '---',
    `name: ${SKILL_NAME}`,
    `description: ${SKILL_DESCRIPTION}`,
    'metadata:',
    `  version: ${pkgVersion}`
  ]

  if (target.frontmatterProfile === 'copilot') {
    lines.push('license: MIT')
  }

  lines.push('---', '')
  return `${lines.join('\n')}\n`
}

function renderOpenAIMetadata(): string {
  return `interface:
  display_name: "代理上下文工作流"
  short_description: "${SKILL_DESCRIPTION}"
  default_prompt: "Use ac-workflow for .agent-context stateful work: run scripts/get-context-info.js and agent-context validate, choose one action from currentPlanStatus, then read only the matching references/*.md before executing."

policy:
  allow_implicit_invocation: true
`
}

// ── Context Script ──────────────────────────────────

function readContextScript(): string {
  const scriptDir = join(dirname(fileURLToPath(import.meta.url)), 'scripts')
  return readFileSync(join(scriptDir, CONTEXT_SCRIPT_NAME), 'utf-8')
}

// ── AskUserQuestion reference（渐进式披露：详情在本文件，SKILL 仅指针）─

function renderAskUserQuestionReference(target: ToolTarget): string {
  return `# ${target.askToolName} 规范

**任何情况下使用 ${target.askToolName} 工具时必须遵守本规范**：

### 基础规范

- 提问要通俗易懂，不要废话，禁止拽花哨、华而不实的文风，给出的选项同理。
- 单选提问**必须**在问题末尾标注推荐项并说明理由
- 一次提问聚焦一个主题，不在单个问题中混杂多个无关决策

### 反向面试

信息收集和需求澄清环节，不能只被动接收用户说法——必须主动审视用户的陈述，挖掘未被意识到的盲区。

**探测方向**：

- **假设挑战**：用户描述中哪些隐含假设可能不成立
- **边界探测**：哪些边界/异常场景未被覆盖
- **遗漏发现**：落地所需的关键决策中哪些还没做
- **矛盾检测**：需求之间或需求与现有系统之间是否冲突
- **风险预警**：技术可行性、性能瓶颈、维护成本等隐患

**执行要求**：

- 每轮聚焦 2-3 个最有价值的问题，不一次倾泻所有疑问
- 每个问题附带简短理由——说明为什么这个问题值得关注
- 连续一轮追问未发现新的显著盲区 → 结束
- 最多追问 2 轮，除非用户主动要求继续
`
}
