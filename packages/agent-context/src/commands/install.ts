import { relative } from 'node:path'

import { checkbox } from '@inquirer/prompts'

import { runInstall } from '../runner.js'
import {
  DEFAULT_TOOL_ORDER,
  detectConfiguredToolIds,
  getToolChoices,
  parseToolIds
} from '../tools.js'
import type { RunResult, ToolId } from '../types.js'

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
