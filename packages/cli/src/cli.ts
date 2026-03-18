#!/usr/bin/env node
import { Command } from 'commander'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyCommitAction } from './commands/verify-commit.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const packageJsonPath = resolve(currentDir, '../package.json')
const { version } = JSON.parse(
  readFileSync(packageJsonPath, 'utf8')
) as { version: string }

const program = new Command()

program
  .name('cat-cli')
  .description('CatKit CLI tools')
  .version(version)

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
