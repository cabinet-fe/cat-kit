import path from 'path'
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { INPUT, OUTPUT } from './constants'
import dts from 'rollup-plugin-dts'

const writeBundle = async (formats: Array<'es' | 'cjs'>) => {
  const bundle = await rollup({
    input: INPUT,
    plugins: [esbuild({ minify: true })]
  })

  const declareBundle = await rollup({
    input: INPUT,
    plugins: [dts()]
  })
  await Promise.all(
    formats.map(async format => {
      const dir = path.resolve(OUTPUT, format)
      await bundle.write({
        format,
        dir,
        preserveModules: true,
        sourcemap: true,
        exports: 'auto'
      })
      await declareBundle.write({
        format,
        dir,
        preserveModules: true,
        exports: 'auto'
      })
    })
  )
}

export const buildUtils = async () => {
  await writeBundle(['cjs', 'es'])
}
