import { detectConfiguredToolIds, parseToolIds } from '../adapters/tool-targets'
import type { ToolId } from '../domain/types'
import { runUpdate } from '../runtime/execute'
import { printCheckResult, printRunSummary } from './shared'

export interface UpdateCommandOptions {
  tools?: string
  check?: boolean
  yes?: boolean
}

export async function updateCommand(options: UpdateCommandOptions = {}): Promise<void> {
  const cwd = process.cwd()
  const tools = resolveTools(cwd, options.tools)
  const check = options.check ?? false

  const result = await runUpdate({
    cwd,
    tools,
    check
  })

  if (check) {
    printCheckResult(result, cwd)
    if (result.changed.length > 0) {
      process.exitCode = 1
    }
    return
  }

  printRunSummary(result, cwd)
}

function resolveTools(cwd: string, raw?: string): ToolId[] | undefined {
  if (!raw || raw.trim().length === 0) {
    const configuredTools = detectConfiguredToolIds(cwd)

    if (configuredTools.length === 0) {
      throw new Error('未检测到已 setup 的工具，请先执行 setup 或通过 --tools 显式指定工具')
    }

    return configuredTools
  }

  return parseToolIds(raw)
}
