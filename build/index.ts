import { MonoRepo } from '@cat-kit/maintenance/src'
import { pkgs } from './pkgs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const repo = new MonoRepo({
  rootDir: path.resolve(__dirname, '..')
})

const ws = repo.workspaces([
  '@cat-kit/core',
  '@cat-kit/fe',
  '@cat-kit/be',
  '@cat-kit/http',
  '@cat-kit/cli',
  '@cat-kit/maintenance'
])

ws.build({
  '@cat-kit/core': {
    input: 'src/index.ts'
  }
})

await repo.build()




