#!/usr/bin/env node

import { readFileSync } from 'node:fs'

import { Command } from 'commander'

import { installCommand } from './commands/install'
import { syncCommand } from './commands/sync'

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as { version?: string }
const packageVersion = typeof packageJson.version === 'string' ? packageJson.version : '0.0.0'

const program = new Command()

program.name('agent-context').description('Agent Context Skills 安装工具').version(packageVersion)

program
  .command('install')
  .description('安装 ac-workflow Skill')
  .option('--tools <tools>', '指定目标工具，逗号分隔：claude,codex,cursor,antigravity,copilot')
  .option('--yes', '非交互模式：优先复用已安装工具，否则安装全部工具')
  .option('--check', '仅检查是否存在待更新内容，不写入文件')
  .action(installCommand)

program
  .command('sync')
  .description('同步已安装的 ac-workflow Skill')
  .option('--tools <tools>', '指定目标工具，逗号分隔：claude,codex,cursor,antigravity,copilot')
  .option('--check', '仅检查是否存在待更新内容，不写入文件')
  .action(syncCommand)

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`\n❌ ${message}`) // eslint-disable-line no-console
  process.exitCode = 1
})
