#!/usr/bin/env node

import { Command } from 'commander'

import { setupCommand } from './commands/setup.js'
import { updateCommand } from './commands/update.js'

const program = new Command()

program.name('agent-context').description('Agent Context 工作流与 SKILLS 生成工具').version('2.0.0')

program
  .command('setup')
  .description('初始化工作流命令、SKILLS 与 AGENTS 受管区块')
  .option('--tools <tools>', '指定目标工具，逗号分隔：claude,codex,cursor,antigravity,copilot')
  .option('--yes', '非交互模式预留参数（当前版本无需确认）')
  .option('--check', '仅检查是否存在待更新内容，不写入文件')
  .action(setupCommand)

program
  .command('update')
  .description('更新工作流命令、SKILLS 与 AGENTS 受管区块')
  .option('--tools <tools>', '指定目标工具，逗号分隔：claude,codex,cursor,antigravity,copilot')
  .option('--yes', '非交互模式预留参数（当前版本无需确认）')
  .option('--check', '仅检查是否存在待更新内容，不写入文件')
  .action(updateCommand)

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`\n❌ ${message}`) // eslint-disable-line no-console
  process.exitCode = 1
})
