import type { BundlePackageOption } from '@cat-kit/maintenance/src'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function pkg(dir: string) {
  return path.resolve(__dirname, '../packages', dir)
}

export const pkgs: BundlePackageOption[] = [
  {
    dir: pkg('core'),
    build: {
      input: 'src/index.ts'
    }
  },
  {
    dir: pkg('fe'),
    build: {
      input: 'src/index.ts'
    }
  },
  {
    dir: pkg('http'),
    build: {
      input: 'src/index.ts'
    }
  },
  {
    dir: pkg('be'),
    build: {
      input: 'src/index.ts',
      platform: 'node'
    }
  },
  {
    dir: pkg('excel'),
    build: {
      input: 'src/index.ts',
      platform: 'browser'
    }
  },
  {
    dir: pkg('maintenance'),
    build: {
      input: 'src/index.ts',
      platform: 'node'
    }
  }
]
