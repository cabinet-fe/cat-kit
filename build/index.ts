import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MonoRepoLib } from './repo'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function pkg(dir: string) {
  return path.resolve(__dirname, '../packages', dir)
}

const lib = new MonoRepoLib([
  {
    dir: pkg('core'),
    build: {
      input: 'src/index.ts'
    }
  },
  {
    dir: pkg('fe'),
    deps: ['@cat-kit/core'],
    build: {
      input: 'src/index.ts',
      external: ['@cat-kit/core']
    }
  },
  {
    dir: pkg('http'),
    deps: ['@cat-kit/core'],
    build: {
      input: 'src/index.ts',
      external: ['@cat-kit/core']
    }
  },
  {
    dir: pkg('be'),
    deps: ['@cat-kit/core'],
    build: {
      input: 'src/index.ts',
      external: ['@cat-kit/core']
    }
  },
  {
    dir: pkg('excel'),
    deps: ['@cat-kit/core'],
    build: {
      input: 'src/index.ts',
      external: ['@cat-kit/core']
    }
  }
])

await lib.build()
