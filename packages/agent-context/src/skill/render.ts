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
import type { SkillArtifacts } from '../types'
import { PROTOCOL_NAMES, PROTOCOL_RENDERERS } from './protocols/index'
import { readAgentContextPackageVersion } from './version'

/** 供 frontmatter / 工具匹配的短描述：用用户意图触发，而不是解释内部实现 */
const SKILL_DESCRIPTION = '代理上下文工作流。用于管理 .agent-context 计划与协作流程。'

export function renderSkillArtifacts(): SkillArtifacts {
  const files: SkillArtifacts['files'] = [
    { relativePath: 'SKILL.md', body: renderNavigator() },
    ...PROTOCOL_NAMES.map((name) => ({
      relativePath: `${PROTOCOL_DIR}/${name}.md`,
      body: PROTOCOL_RENDERERS[name]()
    })),
    {
      relativePath: `${PROTOCOL_DIR}/ask-user-question.md`,
      body: renderAskUserQuestionReference()
    },
    {
      relativePath: `${SCRIPTS_DIR}/${CONTEXT_SCRIPT_NAME}`,
      body: readScript(CONTEXT_SCRIPT_NAME)
    },
    { relativePath: `${SCRIPTS_DIR}/validate-context.js`, body: readScript('validate-context.js') }
  ]

  return { files }
}

// ── Navigator ────────────────────────────────────────

function renderNavigator(): string {
  const protocolFile = `${PROTOCOL_DIR}/<protocol>.md`
  const scriptPath = `${SCRIPTS_DIR}/${CONTEXT_SCRIPT_NAME}`
  return `${renderFrontmatter()}# ac-workflow

这是协议路由入口。不要预先读取所有协议文件；只在确定动作后读取需要的 \`${PROTOCOL_DIR}/*.md\`。

## 启动步骤

在执行任何协议或决策前，先从项目根目录运行：

\`\`\`sh
node <SKILL_DIR>/${scriptPath}
agent-context validate
\`\`\`

其中 \`<SKILL_DIR>\` 是本 \`SKILL.md\` 所在目录；若运行时提供技能目录变量，先替换为实际路径。

若不在项目根目录，脚本追加 \`--cwd <project-root>\`。若 \`agent-context validate\` 命令不存在，改用 \`npx @cat-kit/agent-context validate\`；CLI 不可用时再运行 \`node <SKILL_DIR>/scripts/validate-context.js\`。任一校验报告错误时，先按错误修正，再重跑到通过。

只使用脚本返回的 \`scope\`、\`currentPlanStatus\`、\`currentPlanNumber\`、\`currentPlanDir\`、\`currentPlanFile\`、\`nextPlanNumber\`、\`nextPatchNumber\`；不要自行扫描目录推断状态或编号。

## 路由

确定一个动作后，完整读取对应协议文件并按顺序执行。若协议引用其他协议，再读取被引用文件；不要凭记忆执行。

| 状态 | 用户意图 | 动作 |
| --- | --- | --- |
| \`null\` | 初始化上下文、补全项目指导文件 | 读 \`${PROTOCOL_DIR}/init.md\` |
| \`null\` | 创建计划、拆分需求 | 读 \`${PROTOCOL_DIR}/plan.md\` |
| \`null\` | 明确任务直接计划并实施 | 读 \`${PROTOCOL_DIR}/rush.md\` |
| \`"未执行"\` | 开始执行当前计划 | 读 \`${PROTOCOL_DIR}/implement.md\` |
| \`"未执行"\` | 调整、重做、替换当前计划 | 读 \`${PROTOCOL_DIR}/replan.md\` |
| \`"未执行"\` | 审查计划 | 读 \`${PROTOCOL_DIR}/review.md\` |
| \`"已执行"\` | 修补、补遗漏、追加相关增量 | 读 \`${PROTOCOL_DIR}/patch.md\` |
| \`"已执行"\` | 审查实现 | 读 \`${PROTOCOL_DIR}/review.md\` |
| \`"已执行"\` | 完成并归档 | 运行 \`agent-context done --yes\` |

用户明确点名 \`init\`、\`plan\`、\`replan\`、\`implement\`、\`patch\`、\`rush\`、\`review\` 时，仍必须先完成启动步骤，再读取 \`${protocolFile}\`。当协议需要澄清或选择时，优先使用当前运行环境提供的交互式提问工具；使用前先读 \`${PROTOCOL_DIR}/ask-user-question.md\`。如果当前环境没有交互式提问工具，直接用一条简短文本问题询问用户并暂停，不要伪造工具调用。

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

function renderFrontmatter(): string {
  const pkgVersion = readAgentContextPackageVersion()
  const lines = [
    '---',
    `name: ${SKILL_NAME}`,
    'description: >',
    `  ${SKILL_DESCRIPTION}`,
    'metadata:',
    `  version: ${pkgVersion}`
  ]

  lines.push('---', '')
  return `${lines.join('\n')}\n`
}

// ── Context Script ──────────────────────────────────

function readScript(fileName: string): string {
  const scriptDir = join(dirname(fileURLToPath(import.meta.url)), 'scripts')
  return readFileSync(join(scriptDir, fileName), 'utf-8')
}

// ── AskUserQuestion reference（渐进式披露：详情在本文件，SKILL 仅指针）─

function renderAskUserQuestionReference(): string {
  return `# 用户提问规范

当协议需要澄清时，优先使用当前运行环境提供的交互式提问工具。常见名称包括 \`AskUserQuestion\`、\`request_user_input\`、\`RequestUserInput\`、\`Question\`、\`askQuestions\`、\`question\`。如果当前环境没有交互式提问工具，直接用一条简短文本问题询问用户并暂停，不要伪造工具调用。

**任何情况下使用交互式提问工具时必须遵守本规范**：

## 基础规范

- 提问要通俗易懂，不要废话，禁止拽花哨、华而不实的文风，给出的选项同理。
- 单选提问**必须**在问题末尾标注推荐项并说明理由
- 一次提问聚焦一个主题，不在单个问题中混杂多个无关决策

## 反向追问

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
