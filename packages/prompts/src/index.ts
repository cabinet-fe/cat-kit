#!/usr/bin/env node

import { Command } from 'commander'
import { initCommand } from './commands/init'

const program = new Command()

program.name('dp').description('AI 开发提示词管理工具').version('1.0.0')

program
  .command('init')
  .description('初始化项目的开发提示词配置')
  .action(initCommand)

program.parse()
