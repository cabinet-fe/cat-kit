import { relative } from 'node:path'

import type { RunResult } from '../domain/types'

export function printRunSummary(result: RunResult, cwd: string): void {
  const modeTitle = result.mode === 'setup' ? 'setup' : 'update'
  console.log(`\n✅ agent-context ${modeTitle} 完成`) // eslint-disable-line no-console

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

export function printCheckResult(result: RunResult, cwd: string): void {
  if (result.changed.length === 0) {
    console.log('\n✅ 检查通过：无需更新') // eslint-disable-line no-console
    return
  }

  console.log('\n❌ 检查失败：以下文件需要更新') // eslint-disable-line no-console
  for (const filePath of result.changed) {
    console.log(`- ${relative(cwd, filePath)}`) // eslint-disable-line no-console
  }
}
