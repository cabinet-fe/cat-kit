import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { main, repo } from './repo'
import { $ } from 'execa'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


async function test() {
  const s = await $({
    cwd: path.resolve(__dirname, '../packages/tests'),
  })`bun run test`.catch(err => {
    console.error(err)
  })

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

async function release() {
  await validate()
  await test()

  await build()

  main.bumpVersion({
    type: 'premajor'
  })
}


release()