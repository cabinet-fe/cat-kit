#!/usr/bin/env node

import { Command } from 'commander'
import { initCommand } from './commands/init'
import { setupCommand } from './commands/setup'

const program = new Command()

program.name('dp').description('AI 开发提示词管理工具').version('1.0.0')

program
  .command('init')
  .description('初始化项目的开发提示词配置')
  .action(initCommand)

program
  .command('setup')
  .description('设置用户级 AI 提示词配置（支持 Claude Code、Codex CLI、Gemini CLI）')
  .action(setupCommand)

program.parse()
