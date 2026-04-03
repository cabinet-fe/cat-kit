import { existsSync } from 'node:fs'
import { readFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { confirm } from '@inquirer/prompts'

import { initScope } from '../context/scope.js'

export interface InitCommandOptions {
  scope?: string
  yes?: boolean
}

export async function initCommand(options: InitCommandOptions = {}): Promise<void> {
  const cwd = process.cwd()
  const acRoot = join(cwd, '.agent-context')

  await mkdir(acRoot, { recursive: true })

  const envPath = join(acRoot, '.env')

  if (existsSync(envPath)) {
    const content = await readFile(envPath, 'utf-8')
    const match = content.match(/^SCOPE=(.+)$/m)
    const existing = match?.[1]?.trim()

    if (existing) {
      console.log(`当前 SCOPE: ${existing}`) // eslint-disable-line no-console

      if (!options.yes) {
        const overwrite = await confirm({ message: '是否覆盖当前 SCOPE？' })
        if (!overwrite) {
          console.log('已取消。') // eslint-disable-line no-console
          return
        }
      }
    }
  }

  const scope = await initScope(acRoot, options.scope)
  console.log(`SCOPE 已设置为 ${scope}。`) // eslint-disable-line no-console
  console.log(`目录: .agent-context/${scope}/`) // eslint-disable-line no-console
}
