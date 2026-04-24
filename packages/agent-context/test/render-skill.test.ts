import { renderSkillArtifacts } from '../src/skill/render'
import triggerPrompts from './fixtures/trigger-prompts.json'

function readSkillMd() {
  const artifact = renderSkillArtifacts().files.find((file) => file.relativePath === 'SKILL.md')

  if (!artifact) {
    throw new Error('SKILL.md artifact not found')
  }

  return artifact.body
}

function readDescription(skillMd: string) {
  const blockMatch = skillMd.match(/^description:\s*>\n((?:  .+\n?)+)/m)
  if (blockMatch?.[1]) {
    return blockMatch[1]
      .split('\n')
      .map((line) => line.replace(/^  /, ''))
      .join(' ')
      .trim()
  }

  const inlineMatch = skillMd.match(/^description:\s*(.+)$/m)
  if (!inlineMatch?.[1]) {
    throw new Error('description not found')
  }

  return inlineMatch[1]
}

describe('renderSkillArtifacts', () => {
  it('生成短导航 SKILL.md 并按需读取协议', () => {
    const skillMd = readSkillMd()

    expect(skillMd.split('\n').length).toBeLessThanOrEqual(60)
    expect(skillMd.length).toBeLessThanOrEqual(2500)
    expect(skillMd).toContain('不要预先读取所有协议文件')
    expect(skillMd).toContain('references/<protocol>.md')
  })

  it('启动步骤只保留一条主命令', () => {
    const skillMd = readSkillMd()
    const codeBlocks = skillMd.match(/```sh[\s\S]*?```/g) ?? []

    expect(codeBlocks.length).toBe(1)
    expect(codeBlocks[0]).toContain('scripts/get-context-info.js')
    expect(codeBlocks[0]).not.toContain('agent-context validate')
  })

  it('收窄 description 触发边界', () => {
    const description = readDescription(readSkillMd())

    expect(description.length).toBeLessThanOrEqual(500)
    expect(description).toContain('ac-workflow')
    expect(description).toContain('.agent-context')
    expect(description).toContain('不要用于普通编码')
    expect(description).not.toContain('Keywords include')
    expect(description).not.toMatch(/Keywords.*\b(implement|review|AGENTS\.md)\b/)
  })

  it('保留 SKILL_DIR 占位符解释与 fallback 脚本', () => {
    const skillMd = readSkillMd()

    expect(skillMd).toContain('node <SKILL_DIR>/scripts/get-context-info.js')
    expect(skillMd).toContain('node <SKILL_DIR>/scripts/validate-context.js')
    expect(skillMd).toContain('<SKILL_DIR>` 是本 `SKILL.md` 所在目录')
  })

  it('路由表覆盖 rush 在任意状态下的入口', () => {
    const skillMd = readSkillMd()
    const routeTable = skillMd.slice(skillMd.indexOf('## 路由'), skillMd.indexOf('## 硬约束'))

    expect(routeTable).toMatch(/任意\s*\|\s*用户\*\*明确点名 rush\*\*/)
    expect(routeTable).toContain('rush.md')
  })

  it('提问工具保持 host capability 抽象', () => {
    const artifacts = renderSkillArtifacts()
    const skillMd = readSkillMd()
    const askReference = artifacts.files.find(
      (file) => file.relativePath === 'references/ask-user-question.md'
    )?.body

    expect(skillMd).toContain('交互式提问工具')
    expect(skillMd).not.toContain('request_user_input')
    expect(skillMd).not.toContain('AskUserQuestion')
    expect(askReference).toContain('# 用户提问规范')
    expect(askReference).toContain('request_user_input')
    expect(askReference).toContain('question')
    expect(askReference).toContain('何时禁止提问')
  })

  it('导出 _principles.md 作为共享专业素养基线', () => {
    const artifacts = renderSkillArtifacts()
    const principles = artifacts.files.find(
      (file) => file.relativePath === 'references/_principles.md'
    )?.body
    const plan = artifacts.files.find(
      (file) => file.relativePath === 'references/plan.md'
    )?.body
    const implement = artifacts.files.find(
      (file) => file.relativePath === 'references/implement.md'
    )?.body

    expect(principles).toContain('# 专业素养')
    expect(principles).toContain('规划与方案')
    expect(principles).toContain('实施与交付')
    expect(plan).toContain('references/_principles.md')
    expect(implement).toContain('references/_principles.md')
  })

  it('维护触发回归样例', () => {
    const description = readDescription(readSkillMd())

    expect(triggerPrompts.shouldTrigger).toEqual(
      expect.arrayContaining([expect.stringContaining('.agent-context')])
    )
    expect(triggerPrompts.shouldNotTrigger).toEqual(
      expect.arrayContaining([expect.stringContaining('implement')])
    )

    for (const prompt of triggerPrompts.shouldTrigger) {
      expect(prompt).toMatch(/ac-workflow|agent-context|\.agent-context/)
    }

    for (const prompt of triggerPrompts.shouldNotTrigger) {
      expect(prompt).not.toMatch(/ac-workflow|agent-context|\.agent-context/)
    }

    for (const phrase of ['普通编码', '实现', 'code review', 'planning', 'AGENTS.md']) {
      expect(description).toContain(phrase)
    }
  })
})
