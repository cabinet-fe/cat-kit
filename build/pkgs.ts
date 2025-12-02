import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PackageOption } from './types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function pkg(dir: string) {
  return path.resolve(__dirname, '../packages', dir)
}

export const pkgs: PackageOption[] = [
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
  },
  {
    dir: pkg('maintenance'),
    deps: ['@cat-kit/core'],
    build: {
      input: 'src/index.ts',
      external: ['@cat-kit/core']
    }
  }
]
