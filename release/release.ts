import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { main, repo } from './repo'
import { $ } from 'execa'
import { select } from '@inquirer/prompts'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


async function test() {
  // const s = await $({
  //   cwd: path.resolve(__dirname, '../packages/tests'),
  // })`bun run test`.catch(err => {
  //   console.error(err)
  // })

}

async function build() {
  await main.build({
    '@cat-kit/be': {
      platform: 'node'
    },
    '@cat-kit/excel': {
      platform: 'browser'
    }
  })
}

async function validate() {
  const { valid, hasCircular, inconsistentDeps } = repo.validate()
  if (valid) return
  if (hasCircular) {
    throw new Error('存在循环依赖')
  }
  if (inconsistentDeps.length) {
    throw new Error('存在不一致的依赖')
  }
}

async function chooseGroup() {
  const value = select({
    message: '选择要发布的组',
    choices: [
      { value: 'main', 'description': '@cat-kit/core, @cat-kit/fe, @cat-kit/be, @cat-kit/http, @cat-kit/excel' },
      { value: 'maintenance', 'description': '@cat-kit/maintenance' },
      { value: 'tsconfig', 'description': '@cat-kit/tsconfig' },
    ],

  })

  return value
}

async function release() {
  await validate()

  await test()

  const targetGroup = await chooseGroup()
  console.log(targetGroup)
  // await build()

}


release()