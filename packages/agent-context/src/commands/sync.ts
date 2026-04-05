import { relative } from 'node:path'

import { runSync } from '../runner.js'
import { detectConfiguredToolIds } from '../tools.js'
import type { RunResult } from '../types.js'

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

function printRunSummary(result: RunResult, cwd: string): void {
  console.log(`\nac-workflow ${result.mode} 已完成。`) // eslint-disable-line no-console

  if (result.created.length > 0) {
    console.log(`\n新增 ${result.created.length} 个文件:`) // eslint-disable-line no-console
    for (const filePath of result.created) {
      console.log(`- ${relative(cwd, filePath)}`) // eslint-disable-line no-console
    }
  }

  if (result.updated.length > 0) {
    console.log(`\n更新 ${result.updated.length} 个文件:`) // eslint-disable-line no-console
    for (const filePath of result.updated) {
      console.log(`- ${relative(cwd, filePath)}`) // eslint-disable-line no-console
    }
  }

  if (result.removed.length > 0) {
    console.log(`\n移除 ${result.removed.length} 个遗留路径:`) // eslint-disable-line no-console
    for (const filePath of result.removed) {
      console.log(`- ${relative(cwd, filePath)}`) // eslint-disable-line no-console
    }
  }

  if (result.unchanged.length > 0) {
    console.log(`\n未变更 ${result.unchanged.length} 个文件。`) // eslint-disable-line no-console
  }
}

function printCheckResult(result: RunResult, cwd: string): void {
  if (result.changed.length === 0) {
    console.log('\n检查完成，无需更新。') // eslint-disable-line no-console
    return
  }

  console.log('\n检查完成，以下文件需要更新：') // eslint-disable-line no-console
  for (const filePath of result.changed) {
    console.log(`- ${relative(cwd, filePath)}`) // eslint-disable-line no-console
  }
}
