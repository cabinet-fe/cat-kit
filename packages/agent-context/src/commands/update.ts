import { parseToolIds } from '../adapters/tool-targets.js'
import type { ToolId } from '../domain/types.js'
import { runUpdate } from '../runtime/execute.js'
import { printCheckResult, printRunSummary } from './shared.js'

export interface UpdateCommandOptions {
  tools?: string
  check?: boolean
  yes?: boolean
}

export async function updateCommand(options: UpdateCommandOptions = {}): Promise<void> {
  const cwd = process.cwd()
  const tools = resolveTools(options.tools)
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

function resolveTools(raw?: string): ToolId[] | undefined {
  if (!raw || raw.trim().length === 0) {
    return undefined
  }

  return parseToolIds(raw)
}
