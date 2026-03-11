import { detectConfiguredToolIds, parseToolIds } from '../tools.js'
import type { ToolId } from '../types.js'
import { runSync } from '../runner.js'
import { printCheckResult, printRunSummary } from './printer.js'

export interface SyncCommandOptions {
  tools?: string
  check?: boolean
}

export async function syncCommand(options: SyncCommandOptions = {}): Promise<void> {
  const cwd = process.cwd()
  const tools = resolveTools(cwd, options.tools)
  const check = options.check ?? false
  const result = await runSync({ cwd, tools, check })

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

    if (configuredTools.length > 0) {
      return configuredTools
    }

    throw new Error('未检测到已安装的 Skill，请先执行 install 或通过 --tools 显式指定工具')
  }

  return parseToolIds(raw)
}
