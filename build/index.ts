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
      input: 'src/index.ts',
      dts: true
    },

    output: {
      dir: 'dist',
      sourcemap: true
    }
  },
  {
    dir: pkg('fe'),
    deps: ['@cat-kit/core'],

    build: {
      input: 'src/index.ts',
      dts: true,
      external: ['@cat-kit/core']
    },

    output: {
      dir: 'dist',
      sourcemap: true
    }
  },
  {
    dir: pkg('test'),
    deps: ['@cat-kit/core'],

    build: {
      input: 'src/index.ts',
      treeshake: {
        annotations: true
      }
    },

    output: {
      dir: 'dist',

      sourcemap: true
    }
  }
  // {
  //   dir: pkg('http'),
  //   deps: ['@cat-kit/core'],

  //   build: {
  //     input: 'src/index.ts',
  //     dts: true,
  //     external: ['@cat-kit/core']
  //   },

  //   output: {
  //     dir: 'dist',
  //     sourcemap: true
  //   }
  // }
])

await lib.build()
