import { runSync } from '../skill/installer'
import { detectConfiguredToolIds } from '../skill/targets'
import { printCheckResult, printRunSummary } from './print-result'

export interface SyncCommandOptions {
  check?: boolean
}

export async function syncCommand(options: SyncCommandOptions = {}): Promise<void> {
  const cwd = process.cwd()
  const check = options.check ?? false

  if (detectConfiguredToolIds(cwd).length === 0) {
    throw new Error('未检测到已安装的 Skill，请先执行 install')
  }

  const result = await runSync({ cwd, check })

  if (check) {
    printCheckResult(result, cwd)
    if (result.changed.length > 0) {
      process.exitCode = 1
    }
    return
  }

  printRunSummary(result, cwd)
}
