import { runInstall } from '../skill/installer'
import { parseToolIds } from '../skill/targets'
import type { ToolId } from '../types'
import { printCheckResult, printRunSummary } from './print-result'

export interface InstallCommandOptions {
  tools?: string
  check?: boolean
  yes?: boolean
}

export async function installCommand(options: InstallCommandOptions = {}): Promise<void> {
  printInstallBanner()
  const cwd = process.cwd()
  const tools = resolveTools(options)
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

function resolveTools(options: InstallCommandOptions): ToolId[] | undefined {
  const raw = options.tools

  if (!raw || raw.trim().length === 0) {
    return undefined
  }

  return parseToolIds(raw)
}
