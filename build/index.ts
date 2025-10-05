import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MonoRepoLib, Package } from './repo'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function pkg(dir: string) {
  return path.resolve(__dirname, '../packages', dir)
}

// 核心包
// const core = new Package(pkg('core'), {})

// // 前端包
// const fe = new Package(pkg('fe'), {
//   deps: [core]
// })

// // http请求包
// const http = new Package(pkg('http'), {})

// build([core, fe])

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
  }
])

await lib.build()
