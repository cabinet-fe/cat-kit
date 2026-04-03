import { relative } from 'node:path'

import { runSync } from '../runner.js'
import { detectConfiguredToolIds, parseToolIds } from '../tools.js'
import type { RunResult, ToolId } from '../types.js'

export interface SyncCommandOptions {
  tools?: string
  check?: boolean
}

export async function syncCommand(options: SyncCommandOptions = {}): Promise<void> {
  const cwd = process.cwd()
  const tools = resolveTools(cwd, options.tools)
  const check = options.check ?? false
  const result = await runSync({ cwd, check, ...(tools ? { tools } : {}) })

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

function printRunSummary(result: RunResult, cwd: string): void {
  console.log(`\n✅ ac-workflow ${result.mode} 完成`) // eslint-disable-line no-console

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

  if (result.unchanged.length > 0) {
    console.log(`\n无变更 ${result.unchanged.length} 个文件`) // eslint-disable-line no-console
  }
}

function printCheckResult(result: RunResult, cwd: string): void {
  if (result.changed.length === 0) {
    console.log('\n✅ 检查通过：无需更新') // eslint-disable-line no-console
    return
  }

  console.log('\n❌ 检查失败：以下文件需要更新') // eslint-disable-line no-console
  for (const filePath of result.changed) {
    console.log(`- ${relative(cwd, filePath)}`) // eslint-disable-line no-console
  }
}
