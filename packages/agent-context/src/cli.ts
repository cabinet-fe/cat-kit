#!/usr/bin/env node

import { readFileSync } from 'node:fs'

import { Command } from 'commander'

import { doneCommand } from './commands/done'
import { indexCommand } from './commands/index-cmd'
import { initCommand } from './commands/init'
import { installCommand } from './commands/install'
import { promptGenCommand } from './commands/prompt-gen'
import { statusCommand } from './commands/status'
import { syncCommand } from './commands/sync'
import { upgradeCommand } from './commands/upgrade'
import { validateCommand } from './commands/validate'

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as { version?: string }
const packageVersion = typeof packageJson.version === 'string' ? packageJson.version : '0.0.0'

const program = new Command()

program.name('agent-context').description('Agent Context Skills 安装工具').version(packageVersion)

program
  .command('install')
  .description('安装 ac-workflow Skill')
  .option(
    '--tools <tools>',
    '指定目标工具，逗号分隔：claude,codex,cursor,antigravity,agents,gemini,copilot'
  )
  .option('--yes', '非交互模式：优先复用已安装工具，否则安装全部工具')
  .option('--check', '仅检查是否存在待更新内容，不写入文件')
  .action(installCommand)

program
  .command('sync')
  .description('同步项目中所有已安装路径下的 ac-workflow Skill（整目录）')
  .option('--check', '仅检查是否存在待更新内容，不写入文件')
  .action(syncCommand)

program
  .command('init')
  .description('初始化 SCOPE（从 git user.name 自动获取或手动指定）')
  .option('--scope <name>', '手动指定 SCOPE 名称')
  .option('--yes', '非交互模式：自动覆盖已存在的 SCOPE')
  .action(initCommand)

program.command('validate').description('校验 .agent-context 目录结构').action(validateCommand)

program.command('status').description('查看当前 agent-context 状态').action(statusCommand)

program
  .command('done')
  .description('归档当前已执行计划')
  .option('--yes', '跳过确认，直接归档')
  .action(doneCommand)

program.command('index').description('生成或更新计划索引文件').action(indexCommand)

program
  .command('prompt-gen')
  .description('在用户主目录下生成各 AI 工具的全局提示词文件')
  .option('--tools <tools>', '指定目标工具，逗号分隔：claude,codex,gemini,antigravity')
  .option('--yes', '文件已存在时直接覆盖，不询问')
  .option('--check', '仅检查将要写入的内容，不实际写入')
  .action(promptGenCommand)

program
  .command('upgrade')
  .description('升级 @cat-kit/agent-context 到最新版本')
  .action(upgradeCommand)

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`\n❌ ${message}`) // eslint-disable-line no-console
  process.exitCode = 1
})
