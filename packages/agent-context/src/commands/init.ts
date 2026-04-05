import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { confirm } from '@inquirer/prompts'

import { AC_ROOT_DIR } from '../constants'
import { initScope, readExistingScope } from '../context/scope'

export interface InitCommandOptions {
  scope?: string
  yes?: boolean
}

export async function initCommand(options: InitCommandOptions = {}): Promise<void> {
  const cwd = process.cwd()
  const acRoot = join(cwd, AC_ROOT_DIR)

  await mkdir(acRoot, { recursive: true })

  const existing = await readExistingScope(acRoot)

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

  const scope = await initScope(acRoot, options.scope)
  console.log(`SCOPE 已设置为 ${scope}。`) // eslint-disable-line no-console
  console.log(`目录: ${AC_ROOT_DIR}/${scope}/`) // eslint-disable-line no-console
}
