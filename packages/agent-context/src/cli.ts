#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { Command } from 'commander'

import { setupCommand } from './commands/setup'
import { updateCommand } from './commands/update'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version?: string
}
const packageVersion = typeof packageJson.version === 'string' ? packageJson.version : '0.0.0'

const program = new Command()

program.name('agent-context').description('Agent Context 工作流生成工具').version(packageVersion)

program
  .command('setup')
  .description('初始化工作流命令')
  .option('--tools <tools>', '指定目标工具，逗号分隔：claude,codex,cursor,antigravity,copilot')
  .option('--yes', '非交互模式预留参数（当前版本无需确认）')
  .option('--check', '仅检查是否存在待更新内容，不写入文件')
  .action(setupCommand)

program
  .command('update')
  .description('更新工作流命令')
  .option('--tools <tools>', '指定目标工具，逗号分隔：claude,codex,cursor,antigravity,copilot')
  .option('--yes', '非交互模式预留参数（当前版本无需确认）')
  .option('--check', '仅检查是否存在待更新内容，不写入文件')
  .action(updateCommand)

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`\n❌ ${message}`) // eslint-disable-line no-console
  process.exitCode = 1
})
