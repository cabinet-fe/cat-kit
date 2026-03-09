import { checkbox } from '@inquirer/prompts'

import {
  DEFAULT_TOOL_ORDER,
  detectConfiguredToolIds,
  getToolChoices,
  parseToolIds
} from '../adapters/tool-targets'
import type { ToolId } from '../domain/types'
import { runSetup } from '../runtime/execute'
import { printCheckResult, printRunSummary } from './shared'

export interface SetupCommandOptions {
  tools?: string
  check?: boolean
  yes?: boolean
}

export async function setupCommand(options: SetupCommandOptions = {}): Promise<void> {
  const cwd = process.cwd()
  const tools = await resolveTools(cwd, options)
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

async function resolveTools(cwd: string, options: SetupCommandOptions): Promise<ToolId[] | undefined> {
  const raw = options.tools

  if (!raw || raw.trim().length === 0) {
    const configuredTools = detectConfiguredToolIds(cwd)

    if (options.yes) {
      if (configuredTools.length > 0) {
        return configuredTools
      }
      return [...DEFAULT_TOOL_ORDER]
    }

    const selectedTools = await checkbox<ToolId>({
      message: '请选择要生成工作流命令的工具（可多选）：',
      choices: getToolChoices().map((tool) => ({
        name: tool.name,
        value: tool.id,
        checked: configuredTools.includes(tool.id)
      })),
      required: true
    })

    return selectedTools
  }

  return parseToolIds(raw)
}
