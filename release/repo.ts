import { Monorepo } from '@cat-kit/maintenance/src'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const repo = new Monorepo(path.resolve(__dirname, '..'))

export const main = repo.group([
  '@cat-kit/core',
  '@cat-kit/fe',
  '@cat-kit/be',
  '@cat-kit/http',
  '@cat-kit/excel',
])

export const tsconfig = repo.group(['@cat-kit/tsconfig'])

export const maintenance = repo.group(['@cat-kit/maintenance'])

