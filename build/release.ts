import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { main } from './repo'
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

async function release() {
  await test()
  await build()

  main.bumpVersion({
    type: 'premajor'
  })
}


release()