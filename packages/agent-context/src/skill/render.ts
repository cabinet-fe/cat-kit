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

/**
 * 供 frontmatter / 工具匹配的 description：
 * - 以"在 .agent-context 管理任务计划"为用户意图主线
 * - 列出协议名作为意图关键词（init/plan/rush/implement/patch/replan/review/done）
 */
const SKILL_DESCRIPTION =
  '在 `.agent-context` 目录管理任务计划的 ac-workflow 协议：规划(plan/rush)、实施(implement)、修补(patch)、重规划(replan)、审查(review)、归档(done)、初始化(init)。当你需要创建/实施/修补/审查/归档一个 agent-context 计划时使用。'

export function renderSkillArtifacts(): SkillArtifacts {
  const files: SkillArtifacts['files'] = [
    { relativePath: 'SKILL.md', body: renderNavigator() },
    ...PROTOCOL_NAMES.map((name) => ({
      relativePath: `${PROTOCOL_DIR}/${name}.md`,
      body: PROTOCOL_RENDERERS[name]()
    })),
    {
      relativePath: `${PROTOCOL_DIR}/ask-user-question.md`,
      body: readReference('ask-user-question.md')
    },
    { relativePath: `${PROTOCOL_DIR}/_principles.md`, body: readReference('_principles.md') },
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
  const scriptPath = `${SCRIPTS_DIR}/${CONTEXT_SCRIPT_NAME}`
  const fallbackScript = `${SCRIPTS_DIR}/validate-context.js`

  return `${renderFrontmatter()}# ac-workflow

不要预先读取所有协议文件；只在确定动作后读取 \`${PROTOCOL_DIR}/<protocol>.md\`。

## 启动步骤

执行任何协议前，从项目根目录运行**一条**命令：

\`\`\`sh
node <SKILL_DIR>/${scriptPath}
\`\`\`

\`<SKILL_DIR>\` 是本 \`SKILL.md\` 所在目录（不是字面占位符）。脚本输出包含 \`scope\`、\`currentPlanStatus\`、\`currentPlanNumber\`、\`currentPlanDir\`、\`currentPlanFile\`、\`nextPlanNumber\`、\`nextPatchNumber\` 的 JSON；**内置格式校验**，发现问题时以非 0 退出码打印错误——先按错误修正再重跑到通过。若不在项目根目录，追加 \`--cwd <project-root>\`。

脚本拉起失败（例如 Node 权限问题）时才回退到 \`node <SKILL_DIR>/${fallbackScript}\` 做独立校验。直接使用脚本输出的字段，不要自行扫描目录推断状态或编号。**特例**：脚本报错 \`未找到 ${AC_ROOT_DIR} 目录\` 说明项目尚未初始化——直接读取 \`${PROTOCOL_DIR}/init.md\` 进入初始化协议，不再执行其它路由。

## 路由

确定一个动作后，**完整读取**对应协议文件并按顺序执行。若协议引用其他协议，继续读取被引用文件，不要凭记忆执行。

| 状态 | 用户意图 | 动作 |
| --- | --- | --- |
| \`null\` | 初始化上下文、补全项目指导文件 | 读 \`${PROTOCOL_DIR}/init.md\` |
| \`null\` | 创建计划、拆分需求 | 读 \`${PROTOCOL_DIR}/plan.md\` |
| 任意 | 用户**明确点名 rush**，或任务单一、范围明确、可一气呵成 | 读 \`${PROTOCOL_DIR}/rush.md\` |
| \`未执行\` | 开始执行当前计划 | 读 \`${PROTOCOL_DIR}/implement.md\` |
| \`未执行\` | 调整、重做、替换当前计划 | 读 \`${PROTOCOL_DIR}/replan.md\` |
| \`未执行\` | 审查计划 | 读 \`${PROTOCOL_DIR}/review.md\` |
| \`已执行\` | 修补、补遗漏、追加相关增量 | 读 \`${PROTOCOL_DIR}/patch.md\` |
| \`已执行\` | 审查实现 | 读 \`${PROTOCOL_DIR}/review.md\` |
| \`已执行\` | 完成并归档 | 运行 \`agent-context done --yes\` |

用户明确点名 \`init\`/\`plan\`/\`replan\`/\`implement\`/\`patch\`/\`rush\`/\`review\` 时，同样先完成启动步骤再读对应协议。需要澄清或选择时优先使用当前运行环境的交互式提问工具，**使用前先读** \`${PROTOCOL_DIR}/ask-user-question.md\`（含"何时禁止提问"红线）；环境无该工具则用一条简短文本询问后暂停，不要伪造工具调用。涉及写业务代码或出方案时，先读 \`${PROTOCOL_DIR}/_principles.md\` 作为共享专业素养基线。

## 硬约束

- 计划状态只允许 \`未执行\` 或 \`已执行\`。
- 任意时刻最多一个当前计划：\`${AC_ROOT_DIR}/{scope}/plan-{number}\`。
- 创建计划使用 \`nextPlanNumber\`；创建补丁使用 \`nextPatchNumber\`。
- 在 \`plan\` 或 \`rush\` 创建计划前不改业务代码；代码变更只发生在 \`implement\` 或 \`patch\`。
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
    ...SKILL_DESCRIPTION.split('\n').map((line) => `  ${line}`),
    'metadata:',
    `  version: ${pkgVersion}`,
    '---',
    ''
  ]

  return `${lines.join('\n')}\n`
}

// ── Embedded assets ─────────────────────────────────

function readScript(fileName: string): string {
  return readFileSync(assetPath('scripts', fileName), 'utf-8')
}

function readReference(fileName: string): string {
  return readFileSync(assetPath('references', fileName), 'utf-8')
}

function assetPath(kind: 'scripts' | 'references', fileName: string): string {
  return join(dirname(fileURLToPath(import.meta.url)), kind, fileName)
}
