import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { renderSkillArtifacts } from '../skill/render'

interface TriggerPrompts {
  shouldTrigger: string[]
  shouldNotTrigger: string[]
}

interface PromptCoverage {
  prompt: string
  covered: boolean
  reason: string
}

interface SkillDescriptionEvaluation {
  description: string
  length: number
  maxLength: number
  shouldTrigger: PromptCoverage[]
  shouldNotTrigger: PromptCoverage[]
}

const MAX_DESCRIPTION_LENGTH = 500

const DEFAULT_TRIGGER_PROMPTS: TriggerPrompts = {
  shouldTrigger: [
    'Use ac-workflow to plan this .agent-context task',
    '根据当前 .agent-context 计划执行 patch',
    'agent-context 当前计划已经完成，归档它',
    'sync installed ac-workflow skills after upgrading @cat-kit/agent-context'
  ],
  shouldNotTrigger: [
    'implement the login form',
    'review this TypeScript function',
    '更新 AGENTS.md 里的代码风格说明',
    '给新功能做一个普通开发计划'
  ]
}

export function skillEvalCommand(): void {
  const evaluation = evaluateSkillDescription(readDescription(), readTriggerPrompts())
  printEvaluation(evaluation)

  if (!isEvaluationPassing(evaluation)) {
    process.exitCode = 1
  }
}

export function evaluateSkillDescription(
  description: string,
  prompts: TriggerPrompts
): SkillDescriptionEvaluation {
  return {
    description,
    length: description.length,
    maxLength: MAX_DESCRIPTION_LENGTH,
    shouldTrigger: prompts.shouldTrigger.map((prompt) => evaluateShouldTrigger(prompt)),
    shouldNotTrigger: prompts.shouldNotTrigger.map((prompt) =>
      evaluateShouldNotTrigger(prompt, description)
    )
  }
}

function readDescription(): string {
  const skillMd = renderSkillArtifacts().files.find(
    (file) => file.relativePath === 'SKILL.md'
  )?.body
  const blockMatch = skillMd?.match(/^description:\s*>\n((?:  .+\n?)+)/m)
  if (blockMatch?.[1]) {
    return blockMatch[1]
      .split('\n')
      .map((line) => line.replace(/^  /, ''))
      .join(' ')
      .trim()
  }

  const inlineMatch = skillMd?.match(/^description:\s*(.+)$/m)
  if (!inlineMatch?.[1]) {
    throw new Error('未找到 Skill description。')
  }
  return inlineMatch[1]
}

function readTriggerPrompts(): TriggerPrompts {
  const fixtureFile = new URL('../../test/fixtures/trigger-prompts.json', import.meta.url)
  const fixturePath = fileURLToPath(fixtureFile)

  if (!existsSync(fixturePath)) {
    return DEFAULT_TRIGGER_PROMPTS
  }

  return JSON.parse(readFileSync(fixturePath, 'utf8')) as TriggerPrompts
}

function evaluateShouldTrigger(prompt: string): PromptCoverage {
  const covered = /ac-workflow|agent-context|\.agent-context/i.test(prompt)
  return {
    prompt,
    covered,
    reason: covered ? '包含 ac-workflow / agent-context 触发信号' : '缺少明确触发信号'
  }
}

function evaluateShouldNotTrigger(prompt: string, description: string): PromptCoverage {
  const lowerPrompt = prompt.toLowerCase()
  const lowerDescription = description.toLowerCase()
  const boundaries = [
    { prompt: /implement|coding|login/, description: /普通编码|实现/ },
    { prompt: /review|typescript function/, description: /code review/ },
    { prompt: /agents\.md/, description: /agents\.md/ },
    { prompt: /计划|planning|plan/, description: /planning|常规/ }
  ]

  const matched = boundaries.find((item) => item.prompt.test(lowerPrompt))
  const covered = matched ? matched.description.test(lowerDescription) : false

  return {
    prompt,
    covered,
    reason: covered ? 'description 包含对应负触发边界' : 'description 缺少对应负触发边界'
  }
}

function printEvaluation(evaluation: SkillDescriptionEvaluation): void {
  console.log('\nagent-context skill-eval') // eslint-disable-line no-console
  console.log(`\ndescription length: ${evaluation.length}/${evaluation.maxLength}`) // eslint-disable-line no-console
  console.log(`description: ${evaluation.description}`) // eslint-disable-line no-console
  printCoverage('should-trigger', evaluation.shouldTrigger)
  printCoverage('should-not-trigger', evaluation.shouldNotTrigger)
}

function printCoverage(title: string, items: PromptCoverage[]): void {
  const covered = items.filter((item) => item.covered).length
  console.log(`\n${title}: ${covered}/${items.length}`) // eslint-disable-line no-console
  for (const item of items) {
    const status = item.covered ? 'PASS' : 'MISS'
    console.log(`- [${status}] ${item.prompt} (${item.reason})`) // eslint-disable-line no-console
  }
}

function isEvaluationPassing(evaluation: SkillDescriptionEvaluation): boolean {
  return (
    evaluation.length <= evaluation.maxLength &&
    evaluation.shouldTrigger.every((item) => item.covered) &&
    evaluation.shouldNotTrigger.every((item) => item.covered)
  )
}
