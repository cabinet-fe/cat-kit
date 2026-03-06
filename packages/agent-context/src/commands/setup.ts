import { checkbox } from '@inquirer/prompts'

import { DEFAULT_TOOL_ORDER, getToolChoices, parseToolIds } from '../adapters/tool-targets.js'
import type { ToolId } from '../domain/types.js'
import { runSetup } from '../runtime/execute.js'
import { printCheckResult, printRunSummary } from './shared.js'

export interface SetupCommandOptions {
  tools?: string
  check?: boolean
  yes?: boolean
}

export async function setupCommand(options: SetupCommandOptions = {}): Promise<void> {
  const cwd = process.cwd()
  const tools = await resolveTools(options)
  const check = options.check ?? false

  const result = await runSetup({ cwd, tools, check })

  if (check) {
    printCheckResult(result, cwd)
    if (result.changed.length > 0) {
      process.exitCode = 1
    }
    return
  }

  printRunSummary(result, cwd)
}

async function resolveTools(options: SetupCommandOptions): Promise<ToolId[] | undefined> {
  const raw = options.tools

  if (!raw || raw.trim().length === 0) {
    if (options.yes) {
      return [...DEFAULT_TOOL_ORDER]
    }

    const selectedTools = await checkbox<ToolId>({
      message: '请选择要生成命令和 SKILLS 的工具（可多选）：',
      choices: getToolChoices().map((tool) => ({ name: tool.name, value: tool.id })),
      required: true
    })

    return selectedTools
  }

  return parseToolIds(raw)
}
