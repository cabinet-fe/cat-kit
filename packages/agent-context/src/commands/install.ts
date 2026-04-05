import { checkbox } from '@inquirer/prompts'

import { printCheckResult, printRunSummary } from './print-result'
import { runInstall } from '../runner'
import {
  DEFAULT_TOOL_ORDER,
  detectConfiguredToolIds,
  getToolChoices,
  parseToolIds
} from '../tools'
import type { ToolId } from '../types'

export interface InstallCommandOptions {
  tools?: string
  check?: boolean
  yes?: boolean
}

export async function installCommand(options: InstallCommandOptions = {}): Promise<void> {
  printInstallBanner()
  const cwd = process.cwd()
  const tools = await resolveTools(cwd, options)
  const check = options.check ?? false
  const result = await runInstall({ cwd, check, ...(tools ? { tools } : {}) })

  if (check) {
    printCheckResult(result, cwd)
    if (result.changed.length > 0) {
      process.exitCode = 1
    }
    return
  }

  printRunSummary(result, cwd)
}

function printInstallBanner(): void {
  const bar = '═'.repeat(42)
  console.log('') // eslint-disable-line no-console
  console.log(bar) // eslint-disable-line no-console
  console.log('  Agent Context Workflow') // eslint-disable-line no-console
  console.log(bar) // eslint-disable-line no-console
  console.log('') // eslint-disable-line no-console
}

async function resolveTools(
  cwd: string,
  options: InstallCommandOptions
): Promise<ToolId[] | undefined> {
  const raw = options.tools

  if (!raw || raw.trim().length === 0) {
    const configuredTools = detectConfiguredToolIds(cwd)

    if (options.yes) {
      return configuredTools.length > 0 ? configuredTools : [...DEFAULT_TOOL_ORDER]
    }

    return checkbox<ToolId>({
      message: '请选择要安装 ac-workflow Skill 的工具（可多选）：',
      choices: getToolChoices().map((tool) => ({
        name: tool.name,
        value: tool.id,
        checked: configuredTools.includes(tool.id)
      })),
      required: true
    })
  }

  return parseToolIds(raw)
}
