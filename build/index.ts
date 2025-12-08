import { Monorepo } from '@cat-kit/maintenance/src'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const repo = new Monorepo(path.resolve(__dirname, '..'))


async function build() {
  const main = repo.group([
    '@cat-kit/core',
    '@cat-kit/fe',
    '@cat-kit/be',
    '@cat-kit/http',
    '@cat-kit/excel',
    '@cat-kit/maintenance'
  ])

  try {
    const { valid } = repo.validate()

    if (!valid) {
      return console.error('仓库不合法, 已退出构建')
    }

    // 先执行单元测试


    // 构建
    await main.build({
      '@cat-kit/be': {
        platform: 'node'
      },
      '@cat-kit/maintenance': {
        platform: 'node'
      },
      '@cat-kit/excel': {
        platform: 'browser'
      }
    })

    // main.bumpVersion({
    //   type: 'prerelease',
    // })
  } catch {
    main.bumpVersion({
      type: 'prerelease',
      version: repo.root.pkg.version
    })
  }

}

build()





