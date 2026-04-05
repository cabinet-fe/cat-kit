import { SKILL_NAME } from '../constants'
import type { SkillArtifacts, ToolTarget } from '../types'
import { PROTOCOL_NAMES, PROTOCOL_RENDERERS } from './protocols/index'
import { readAgentContextPackageVersion } from './version'

/** 供 frontmatter / 工具匹配的短描述：品牌名 + 核心能力与关键词 */
const SKILL_DESCRIPTION =
  '简洁高效的代理上下文工作流。当提及初始化、计划、重构、重新计划、上下文工作流、规划、实现、优化、补丁、快速实现时使用。'

const PROTOCOL_DIR = 'references'

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
    }
  ]

  if (target.metadataFiles.includes('openai')) {
    files.push({ relativePath: 'agents/openai.yaml', body: renderOpenAIMetadata() })
  }

  return { files }
}

// ── Navigator ────────────────────────────────────────

function renderNavigator(target: ToolTarget): string {
  return `${renderFrontmatter(target)}
# 代理上下文工作流（ac-workflow）

统一管理仓库根目录 \`.agent-context/\` 下的计划：\`init\` → \`plan\` / \`replan\` → \`implement\` → \`patch\` → \`review\` → \`done\`；也可用 \`rush\` 在一条流程内完成 \`plan\` + \`implement\`。

## 执行纪律（摘要）

完整步骤始终以 \`${PROTOCOL_DIR}/<动作>.md\` 为准；此处仅作索引，**不可替代协议全文**。

- **状态先查**：任何操作前先查看 \`.agent-context/{scope}/\`，判定：无当前计划 / 当前 **未执行** / 当前 **已执行**
- **协议先行**：选定动作后，**完整**读取 \`${PROTOCOL_DIR}/<动作>.md\` 再逐步执行；禁止凭记忆、摘要或猜测跳过协议步骤
- **前置检查**：各协议中的「前置检查」逐条执行；协议要求运行 \`agent-context validate\` 时必须执行
- **禁止直接改动**：在 **plan** / **rush** 创建计划之前，不得修改业务代码；代码变更仅在 **implement** 或 **patch** 上下文中进行
- **顺序执行**：协议内步骤按编号顺序执行，不跳步、不合并、不并行
- **提问工具**：使用 ${target.askToolName} 时须遵守 \`${PROTOCOL_DIR}/ask-user-question.md\`

## 路由决策

> **必须先确定当前计划状态，再按下表选择动作。禁止跳过状态判断直接匹配动作。**

### 状态 A：无当前计划

| 用户意图 | 动作 | 协议文件 |
|----------|------|----------|
| 初始化项目上下文、补全 ${target.guideFileName} | init | \`${PROTOCOL_DIR}/init.md\` |
| 给需求出计划、拆分任务 | plan | \`${PROTOCOL_DIR}/plan.md\` |
| 快速出计划并实施 | rush | \`${PROTOCOL_DIR}/rush.md\` |

### 状态 B：当前计划状态为「未执行」

| 用户意图 | 动作 | 协议文件 |
|----------|------|----------|
| 按计划开始做、实现当前计划 | implement | \`${PROTOCOL_DIR}/implement.md\` |
| 重做计划、调整方案 | replan | \`${PROTOCOL_DIR}/replan.md\` |
| 审查当前计划 | review | \`${PROTOCOL_DIR}/review.md\` |
| 用户提出新需求且与当前计划**相关** | replan | \`${PROTOCOL_DIR}/replan.md\` |
| 用户提出新需求且与当前计划**无关** | → ${target.askToolName} | 选项：1) 归档当前计划后创建新计划（推荐） 2) 终止操作 |

### 状态 C：当前计划状态为「已执行」

| 用户意图 | 动作 | 协议文件 |
|----------|------|----------|
| 实施后不满意、追加需求、修补问题 | patch | \`${PROTOCOL_DIR}/patch.md\` |
| 审查实施结果 | review | \`${PROTOCOL_DIR}/review.md\` |
| 任务彻底完成、归档当前计划 | done | 运行 \`agent-context done\` |
| 用户提出新需求且与当前计划**相关** | patch | \`${PROTOCOL_DIR}/patch.md\` |
| 用户提出新需求且与当前计划**无关** | → ${target.askToolName} | 选项：1) 归档后创建新计划（推荐） 2) 终止操作 |

> **关联性判断**：当用户提出变更需求时，对照当前 \`plan.md\` 的 \`## 目标\` 判断关联性。若无法确定 → 通过 ${target.askToolName} 让用户确认。

## 全局约束

- 状态机两态：\`未执行\`、\`已执行\`。
- 任意时刻最多一个当前计划：\`.agent-context/{scope}/plan-{number}\`。
- 多个当前计划 → 拒绝执行，提示恢复单活跃状态。
- 计划编号全局递增，不复用。补丁编号在单计划目录内递增，不复用。
- 影响范围（\`## 影响范围\`）不得包含 \`.agent-context/\` 目录下的文件。

## 目录结构

\`\`\`text
.agent-context/
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

编号规则：在当前 scope 内扫描全部 \`plan-N\` 目录取 \`max(N)+1\`。
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
  display_name: "Agent Context Workflow"
  short_description: "Agent Context Workflow：.agent-context 计划生命周期，按 references 内协议分步执行"
  default_prompt: "Use ac-workflow: check .agent-context state, then read the matching file under references/ (init, plan, replan, implement, patch, rush, review) or run agent-context done."

policy:
  allow_implicit_invocation: true
`
}

// ── AskUserQuestion reference（渐进式披露：详情在本文件，SKILL 仅指针）─

function renderAskUserQuestionReference(target: ToolTarget): string {
  return `# ${target.askToolName} 规范

**任何情况下使用 ${target.askToolName} 工具时必须遵守本规范**：

### 基础规范

- 提问通俗易懂，不废话，选项也同理，不要拽花哨的文风
- 单选提问须在问题末尾标注推荐项并说明理由
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
