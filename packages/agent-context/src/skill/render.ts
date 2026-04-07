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

/** 供 frontmatter / 工具匹配的短描述：品牌名 + 核心能力与关键词 */
const SKILL_DESCRIPTION =
  '基于协议的、简洁高效的代理上下文工作流。当提及初始化、计划、重构、重新计划、上下文工作流、规划、实现、优化、补丁、快速实现时使用。'

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
# 代理上下文工作流（ac-workflow）

严格基于\`${PROTOCOL_DIR}\`中的文件作为开发工作流协议：

- **init**: 初始化项目上下文，根据新项目或旧项目有不同的处理流程。
- **plan**：给需求出计划、拆分任务。
- **replan**：重做计划、调整方案。
- **implement**：按计划开始做、实现当前计划。
- **rush**：快速出计划并实施， 等于 \`plan\` + \`implement\` 的连续执行。
- **patch**：实施后不满意、追加需求、修补问题。
- **review**：审查实施结果。
- **done**：任务彻底完成、归档当前计划。

## 最高守则

### 第一步：获取上下文（强制，不可跳过）

**在执行任何协议或决策之前**，必须先在 shell 中运行以下脚本获取上下文快照：

\`\`\`sh
node <SKILL_DIR>/${scriptPath}
\`\`\`

其中 \`<SKILL_DIR>\` 是本 SKILL.md 文件所在的目录路径。

脚本输出 JSON，包含以下关键字段（后续协议步骤直接引用这些值，禁止自行探索文件系统来获取）：

| 字段 | 含义 |
|------|------|
| \`scope\` | 当前作用域名称 |
| \`currentPlanStatus\` | 当前计划状态：\`"未执行"\` / \`"已执行"\` / \`null\`（无计划） |
| \`currentPlanNumber\` | 当前计划编号（无计划时为 \`null\`） |
| \`currentPlanDir\` | 当前计划目录路径（无计划时为 \`null\`） |
| \`currentPlanFile\` | 当前计划文件路径（无计划时为 \`null\`） |
| \`nextPlanNumber\` | 下一个可用的计划编号 |
| \`nextPatchNumber\` | 下一个可用的补丁编号（无计划时为 \`null\`） |

> **此步骤是一切操作的前提。** 不执行脚本 → 不进入任何协议。脚本报错 → 根据错误信息修正后重新执行，直到成功。

### 第二步：全局校验

在 shell 中运行 \`agent-context validate\`，若不通过则根据错误信息修正对应内容（如修复状态行格式、补全缺失文件等），修正后重新运行验证，重复直至通过。

### 强制规则

- **协议先行**：选定协议后，**完整**读取 \`${protocolFile}\` 再逐步执行；禁止凭记忆、摘要或猜测跳过协议步骤
- **禁止直接改动**：在 **plan** / **rush** 创建计划之前，不得修改业务代码；代码变更仅在 **implement** 或 **patch** 协议中进行
- **顺序执行**：协议内步骤按编号顺序执行，不跳步、不合并、不并行
- **提问引导规范**：使用 ${target.askToolName} 时须遵守 \`${PROTOCOL_DIR}/ask-user-question.md\`

## 协议选择决策

如果用户明确指定要执行某个协议，退出协议选择决策，直接执行该协议。

> **必须基于脚本输出的 \`currentPlanStatus\` 确定当前状态，再按下表选择协议。禁止跳过状态判断直接匹配动作。**

### 状态 A：\`currentPlanStatus\` 为 \`null\`（无当前计划）

| 用户意图 | 动作 | 协议文件 |
|----------|------|----------|
| 初始化项目上下文、补全 ${target.guideFileName} | init | \`${PROTOCOL_DIR}/init.md\` |
| 给需求出计划、拆分任务 | plan | \`${PROTOCOL_DIR}/plan.md\` |
| 快速出计划并实施 | rush | \`${PROTOCOL_DIR}/rush.md\` |

### 状态 B：\`currentPlanStatus\` 为 \`"未执行"\`

| 用户意图 | 动作 | 协议文件 |
|----------|------|----------|
| 按计划开始做、实现当前计划 | implement | \`${PROTOCOL_DIR}/implement.md\` |
| 重做计划、调整方案 | replan | \`${PROTOCOL_DIR}/replan.md\` |
| 审查当前计划 | review | \`${PROTOCOL_DIR}/review.md\` |
| 用户提出新需求且与当前计划**相关** | replan | \`${PROTOCOL_DIR}/replan.md\` |
| 用户提出新需求且与当前计划**无关** | → ${target.askToolName} | 选项：1) 归档当前计划后创建新计划（推荐） 2) 终止操作 |

### 状态 C：\`currentPlanStatus\` 为 \`"已执行"\`

| 用户意图 | 动作 | 协议文件 |
|----------|------|----------|
| 实施后不满意、追加需求、修补问题 | patch | \`${PROTOCOL_DIR}/patch.md\` |
| 审查实施结果 | review | \`${PROTOCOL_DIR}/review.md\` |
| 任务彻底完成、归档当前计划 | done | 运行 \`agent-context done\` |
| 用户提出新需求且与当前计划**相关** | patch | \`${PROTOCOL_DIR}/patch.md\` |
| 用户提出新需求且与当前计划**无关** | → ${target.askToolName} | 选项：1) 归档后创建新计划（推荐） 2) 终止操作 |

> **关联性判断**：当用户提出变更需求时，对照当前 \`plan.md\` 的 \`## 目标\` 判断关联性。若无法确定 → 通过 ${target.askToolName} 让用户确认。

## 全局约束

- 计划状态两态：\`未执行\`、\`已执行\`。
- 任意时刻最多一个当前计划：\`${AC_ROOT_DIR}/{scope}/plan-{number}\`。
- 计划编号从 1 开始全局递增，不复用。补丁编号在单计划目录内从 1 开始递增，不复用。
- 影响范围（\`## 影响范围\`）不得包含 \`${AC_ROOT_DIR}/\` 目录下的文件。
- 脚本输出中的 \`nextPlanNumber\` 和 \`nextPatchNumber\` 是已预计算的值，协议中需要编号时**直接使用**，不得自行扫描目录计算。

## 上下文目录结构

\`\`\`text
${AC_ROOT_DIR}/
├── .env               # SCOPE 配置（SCOPE=<name>）
├── .gitignore
└── {scope}/           # 作用域目录（按协作者隔离）
    ├── plan-{N}/      # 当前计划（最多一个）
    │   ├── plan.md
    │   └── patch-{N}.md
    ├── preparing/     # 待执行计划队列
    │   └── plan-{N}/
    └── done/          # 已归档计划
        └── plan-{N}-{YYYYMMDD}/
\`\`\`
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
  default_prompt: "Use ac-workflow: check .agent-context state, then read the matching file under references/ (init, plan, replan, implement, patch, rush, review) or run agent-context done."

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
