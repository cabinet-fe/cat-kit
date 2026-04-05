import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'

import { checkbox } from '@inquirer/prompts'

import { parseCommaSeparatedIds } from '../skill/targets'
import type { PromptToolId } from '../types'

const PROMPT_TOOL_ORDER: PromptToolId[] = ['claude', 'codex', 'gemini', 'antigravity']

interface PromptToolConfig {
  id: PromptToolId
  name: string
  globalFile: string
  extraContent?: string
}

const PROMPT_TOOL_MAP: Record<PromptToolId, PromptToolConfig> = {
  claude: {
    id: 'claude',
    name: 'Claude Code',
    globalFile: resolve(homedir(), '.claude', 'CLAUDE.md'),
    extraContent: `
      ## 读取 CLAUDE.md

      如果项目中不存在 CLAUDE.md，则将 AGENTS.md 视作 CLAUDE.md 的替代。
    `
  },
  codex: { id: 'codex', name: 'Codex', globalFile: resolve(homedir(), '.codex', 'AGENTS.md') },
  gemini: {
    id: 'gemini',
    name: 'Gemini CLI',
    globalFile: resolve(homedir(), '.gemini', 'GEMINI.md')
  },
  antigravity: {
    id: 'antigravity',
    name: 'Antigravity',
    globalFile: resolve(homedir(), '.gemini', 'AGENTS.md')
  }
}

const PROMPT_CONTENT = `## 语言与沟通风格

- 默认用中文沟通，技术术语保留英文原文（不要翻译 TypeScript、hook、render此类的）

## 本地环境
- 硬件：MacBook Air M5，arm64 架构
- Terminal：Ghostty

## 时效性要求

- 今天日期：每次对话开始时你应该知道当前日期，请基于此判断信息的时效性

## 不要做的事情
- 不要在代码末尾加「你可以进一步扩展...」这类废话
- 不要重复我刚说过的话（「你提到了...」）

## 自适应纠错机制
- 我是一个人类，我提的问题很可能会存在逻辑漏洞，不要盲目执行我可能错误的思路， 要用于纠正我的错误。
`

export interface PromptGenCommandOptions {
  tools?: string
  yes?: boolean
  check?: boolean
}

export async function promptGenCommand(options: PromptGenCommandOptions = {}): Promise<void> {
  const check = options.check ?? false
  const yes = options.yes ?? false

  const tools = await resolvePromptToolIds(options.tools, yes || check)

  if (check) {
    runCheckMode(tools)
    return
  }

  const toolsToWrite = yes ? tools : await confirmOverwrites(tools)

  if (toolsToWrite.length === 0) {
    console.log('\n未选择任何工具，已取消。') // eslint-disable-line no-console
    return
  }

  const created: string[] = []
  const updated: string[] = []

  for (const id of toolsToWrite) {
    const config = PROMPT_TOOL_MAP[id]
    const isNew = !existsSync(config.globalFile)
    mkdirSync(dirname(config.globalFile), { recursive: true })
    writeFileSync(config.globalFile, PROMPT_CONTENT, 'utf8')
    if (isNew) {
      created.push(config.globalFile)
    } else {
      updated.push(config.globalFile)
    }
  }

  const skipped = tools.filter((id) => !toolsToWrite.includes(id))

  printSummary({ created, updated, skipped })
}

async function resolvePromptToolIds(
  raw: string | undefined,
  skipPrompt: boolean
): Promise<PromptToolId[]> {
  if (!raw || raw.trim().length === 0) {
    if (skipPrompt) {
      return [...PROMPT_TOOL_ORDER]
    }

    return checkbox<PromptToolId>({
      message: '请选择要生成全局提示词的工具（可多选）：',
      choices: PROMPT_TOOL_ORDER.map((id) => ({
        name: `${PROMPT_TOOL_MAP[id].name}  (${PROMPT_TOOL_MAP[id].globalFile})`,
        value: id,
        checked: true
      })),
      required: true
    })
  }

  return parseCommaSeparatedIds(raw, isPromptToolId, PROMPT_TOOL_ORDER)
}

function isPromptToolId(value: string): value is PromptToolId {
  return Object.hasOwn(PROMPT_TOOL_MAP, value)
}

function runCheckMode(tools: PromptToolId[]): void {
  console.log('\n将写入以下文件：\n') // eslint-disable-line no-console
  for (const id of tools) {
    const config = PROMPT_TOOL_MAP[id]
    const status = existsSync(config.globalFile) ? '覆盖' : '新建'
    console.log(`  ${config.name.padEnd(14)}→  ${config.globalFile}  [${status}]`) // eslint-disable-line no-console
  }
  console.log('') // eslint-disable-line no-console
}

async function confirmOverwrites(tools: PromptToolId[]): Promise<PromptToolId[]> {
  const existing = tools.filter((id) => existsSync(PROMPT_TOOL_MAP[id].globalFile))
  const newOnes = tools.filter((id) => !existsSync(PROMPT_TOOL_MAP[id].globalFile))

  if (existing.length === 0) {
    return tools
  }

  const confirmed = await checkbox<PromptToolId>({
    message: '以下工具的全局提示词文件已存在，选择要覆盖的工具：',
    choices: existing.map((id) => ({
      name: `${PROMPT_TOOL_MAP[id].name}  (${PROMPT_TOOL_MAP[id].globalFile})`,
      value: id,
      checked: true
    }))
  })

  return [...newOnes, ...confirmed]
}

function printSummary(result: {
  created: string[]
  updated: string[]
  skipped: PromptToolId[]
}): void {
  console.log('\nprompt-gen 已完成。') // eslint-disable-line no-console

  if (result.created.length > 0) {
    console.log(`\n新建 ${result.created.length} 个文件:`) // eslint-disable-line no-console
    for (const filePath of result.created) {
      console.log(`  ${filePath}`) // eslint-disable-line no-console
    }
  }

  if (result.updated.length > 0) {
    console.log(`\n覆盖 ${result.updated.length} 个文件:`) // eslint-disable-line no-console
    for (const filePath of result.updated) {
      console.log(`  ${filePath}`) // eslint-disable-line no-console
    }
  }

  if (result.skipped.length > 0) {
    console.log(`\n已跳过 ${result.skipped.length} 个工具:`) // eslint-disable-line no-console
    for (const id of result.skipped) {
      console.log(`  ${PROMPT_TOOL_MAP[id].name}`) // eslint-disable-line no-console
    }
  }
}
