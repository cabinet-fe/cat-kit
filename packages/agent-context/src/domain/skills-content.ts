import type { SkillArtifacts } from './types.js'

interface SkillDefinition {
  name: string
  purpose: string
  inputs: string[]
  steps: string[]
  outputs: string[]
  constraints: string[]
}

const SKILL_DEFINITIONS: SkillDefinition[] = [
  {
    name: 'plan-validator',
    purpose: '校验计划目录结构、单活跃计划约束、编号递增规则是否成立。',
    inputs: [
      '项目根目录路径',
      '.agent-context 目录快照',
      '可选：目标计划编号'
    ],
    steps: [
      '扫描 .agent-context、preparing、done 三个范围内的 plan 编号。',
      '验证当前计划目录是否唯一，检查状态字段是否合法。',
      '输出错误清单与可执行修复建议。'
    ],
    outputs: ['结构校验报告（Markdown）', '阻塞级错误列表', '修复建议列表'],
    constraints: [
      '不修改业务代码；仅检查计划元数据。',
      '多个当前计划时必须返回阻塞错误。',
      '编号冲突或倒退必须被判定为失败。'
    ]
  },
  {
    name: 'plan-replanner',
    purpose: '根据描述重排未实施计划并生成新的计划草案。',
    inputs: ['重规划描述', '当前未实施计划列表', '可选：仅重规划目标编号集合'],
    steps: [
      '解析目标范围，默认覆盖 preparing 中全部未实施计划。',
      '生成新的计划拆分方案，保持单当前计划结构。',
      '为新增计划分配全局递增编号。'
    ],
    outputs: ['重规划方案文档', '新计划草案列表'],
    constraints: [
      '当前计划已执行时，禁止重写当前计划内容。',
      '已执行计划必须拒绝重规划并提示使用 patch。',
      '未改动计划保持原编号。'
    ]
  },
  {
    name: 'impact-scope-deduper',
    purpose: '维护 plan.md 中影响范围条目，做标准化和去重。',
    inputs: ['plan.md 当前内容', '本次变更文件列表'],
    steps: [
      '解析“新增/修改/删除”三类条目。',
      '按绝对路径标准化并去重，保留首次分类。',
      '输出可直接回写的影响范围片段。'
    ],
    outputs: ['去重后的影响范围片段'],
    constraints: [
      '不得丢失任何真实改动路径。',
      '重复路径仅保留一条。',
      '输出格式需与 plan.md 约定兼容。'
    ]
  },
  {
    name: 'patch-recorder',
    purpose: '生成 patch 文档并将补丁记录写回 plan.md。',
    inputs: ['补丁描述', '当前计划目录', '本次影响范围'],
    steps: [
      '计算下一个 patch 编号。',
      '生成 patch-{number}.md 内容。',
      '在 plan.md 历史补丁与影响范围中追加并去重。'
    ],
    outputs: ['patch-{number}.md', '更新后的 plan.md 补丁索引条目'],
    constraints: [
      '仅允许在计划状态为已执行时运行。',
      '补丁编号在单计划目录内递增且不复用。',
      '历史补丁索引禁止重复条目。'
    ]
  },
  {
    name: 'agents-quality-check',
    purpose: '检查 AGENTS.md 是否满足精简、结构清晰、可执行性要求。',
    inputs: ['AGENTS.md 内容', '可选：项目目录结构快照'],
    steps: [
      '检查是否前置常用命令与关键约束。',
      '检查目录结构、技术栈、代码风格信息是否明确。',
      '输出缺失项与精简建议。'
    ],
    outputs: ['AGENTS 质量报告', '建议修改项列表'],
    constraints: [
      '建议必须可执行且避免空泛描述。',
      '不引入与项目无关的模板化段落。',
      '优先降低代理执行歧义。'
    ]
  }
]

export function renderSkillArtifacts(): SkillArtifacts[] {
  return SKILL_DEFINITIONS.map(def => ({
    directoryName: def.name,
    skillDocument: renderSkillDocument(def),
    scriptPlaceholder: renderScriptsPlaceholder(def.name),
    templatePlaceholder: renderTemplatesPlaceholder(def.name),
    referencePlaceholder: renderReferencesPlaceholder(def.name)
  }))
}

function renderSkillDocument(definition: SkillDefinition): string {
  return `# ${definition.name}

## name

${definition.name}

## purpose

${definition.purpose}

## inputs

${toBullets(definition.inputs)}

## steps

${toNumbered(definition.steps)}

## outputs

${toBullets(definition.outputs)}

## constraints

${toBullets(definition.constraints)}`
}

function renderScriptsPlaceholder(skillName: string): string {
  return `# scripts

该目录用于存放 ${skillName} 相关脚本。

- 可放置校验、提取、批量检查脚本。
- 建议脚本保持幂等，便于在 setup/update 中重复执行。`
}

function renderTemplatesPlaceholder(skillName: string): string {
  return `# templates

该目录用于存放 ${skillName} 相关模板。

- 模板建议使用最小必要字段，减少上下文噪音。
- 可被 SKILL.md 的 steps 直接引用。`
}

function renderReferencesPlaceholder(skillName: string): string {
  return `# references

该目录用于存放 ${skillName} 的补充说明与示例。

- 仅放置实现必需的参考材料。
- 避免堆叠无关文档导致执行分心。`
}

function toBullets(lines: string[]): string {
  return lines.map(line => `- ${line}`).join('\n')
}

function toNumbered(lines: string[]): string {
  return lines.map((line, index) => `${index + 1}. ${line}`).join('\n')
}
