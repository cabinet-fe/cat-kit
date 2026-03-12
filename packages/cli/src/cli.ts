#!/usr/bin/env node
import { Command } from 'commander'
import { verifyCommitAction } from './commands/verify-commit.js'

const program = new Command()

program
  .name('cat-cli')
  .description('CatKit CLI tools')
  .version('1.0.0')

program
  .command('verify-commit')
  .description('校验 git 提交信息')
  .argument('[file]', '包含提交信息的文件路径')
  .option('-m, --message <msg>', '直接传入提交信息字符串')
  .action(verifyCommitAction)

program.parseAsync().catch((err) => {
  console.error(err)
  process.exit(1)
})
