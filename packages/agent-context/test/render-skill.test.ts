import { renderSkillArtifacts } from '../src/skill/render'
import { resolveToolTargetById } from '../src/skill/targets'
import triggerPrompts from './fixtures/trigger-prompts.json'

function readSkillMd() {
  const artifact = renderSkillArtifacts(resolveToolTargetById('agents')).files.find(
    (file) => file.relativePath === 'SKILL.md'
  )

  if (!artifact) {
    throw new Error('SKILL.md artifact not found')
  }

  return artifact.body
}

function readDescription(skillMd: string) {
  const match = skillMd.match(/^description:\s*(.+)$/m)
  if (!match?.[1]) {
    throw new Error('description not found')
  }

  return match[1]
}

describe('renderSkillArtifacts', () => {
  it('生成短导航 SKILL.md 并按需读取协议', () => {
    const skillMd = readSkillMd()

    expect(skillMd.split('\n').length).toBeLessThanOrEqual(60)
    expect(skillMd.length).toBeLessThanOrEqual(2500)
    expect(skillMd).toContain('不要预先读取所有协议文件')
    expect(skillMd).toContain('references/<protocol>.md')
  })

  it('收窄 description 触发边界', () => {
    const description = readDescription(readSkillMd())

    expect(description.length).toBeLessThanOrEqual(500)
    expect(description).toContain('ac-workflow')
    expect(description).toContain('.agent-context')
    expect(description).toContain('Do not use for general coding')
    expect(description).not.toContain('Keywords include')
    expect(description).not.toMatch(/Keywords.*\b(implement|review|AGENTS\.md)\b/)
  })

  it('保留 SKILL_DIR 占位符解释', () => {
    const skillMd = readSkillMd()

    expect(skillMd).toContain('node <SKILL_DIR>/scripts/get-context-info.js')
    expect(skillMd).toContain('<SKILL_DIR>` 是本 `SKILL.md` 所在目录')
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

    for (const phrase of [
      'general coding',
      'implementation',
      'code review',
      'planning',
      'AGENTS.md'
    ]) {
      expect(description).toContain(phrase)
    }
  })
})
