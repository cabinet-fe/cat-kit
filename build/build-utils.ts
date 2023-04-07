import path from 'path'
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { FE_INPUT, BE_INPUT, OUTPUT } from './constants'
import dts from 'rollup-plugin-dts'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const writeBundle = async (
  input: string,
  subDir: string,
  formats: Array<'es' | 'cjs'>
) => {
  // js文件打包
  const bundle = await rollup({
    input,
    plugins: [esbuild({ minify: false }), nodeResolve()]
  })

  await Promise.all(
    formats.map(async format => {
      const dir = path.resolve(OUTPUT, subDir, format)

      await bundle.write({
        format,
        dir,
        sourcemap: true,
        exports: 'auto'
      })
    })
  )

  // 声明文件打包
  const declareBundle = await rollup({
    input,

    plugins: [
      dts({
        respectExternal: true,
        compilerOptions: {
          moduleResolution: 2
        }
      })
    ]
  })

  await declareBundle.write({
    dir: path.resolve(OUTPUT, subDir),
    exports: 'auto'
  })
}

export const buildUtils = async () => {
  await Promise.all([
    writeBundle(FE_INPUT, 'fe', ['cjs', 'es']),
    writeBundle(BE_INPUT, 'be', ['cjs', 'es'])
  ])
}
