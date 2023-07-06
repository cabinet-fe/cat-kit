import chalk from 'chalk'
import fs from 'fs'
import { fileURLToPath } from 'url'

const msgPath = fileURLToPath(
  new URL('../.git/COMMIT_EDITMSG', import.meta.url)
)

const msg = fs.readFileSync(msgPath, 'utf-8').trim()

const commitRE =
  /^(feat|fix|docs|style|refactor|perf|test|build|init|daily|chore|release)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.error(chalk.red('Git提交格式错误'))
  process.exit(1)
}
