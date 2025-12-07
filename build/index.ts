import { Monorepo } from '@cat-kit/maintenance/src'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const repo = new Monorepo(path.resolve(__dirname, '..'))

const group = repo.group([
  '@cat-kit/core',
  '@cat-kit/fe',
  '@cat-kit/be',
  '@cat-kit/http',
  '@cat-kit/excel',
  '@cat-kit/maintenance'
])

await group.build()






