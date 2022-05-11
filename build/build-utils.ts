import glob from 'fast-glob'
import path from 'path'
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'

export const buildUtils = async () => {
  const cwd = path.resolve(__dirname, '../dk')
  const ignoreRE = /^.*\.spec\.ts$/

  const input = (
    await glob(['**/*.ts'], {
      absolute: true,
      cwd,
      onlyFiles: true
    })
  ).filter(f => !ignoreRE.test(f))

  const bundle = await rollup({
    input,
    plugins: [
      esbuild({
        sourceMap: true,
      })
    ],
    treeshake: false
  })

  await bundle.write({
    format: 'es',
    dir: path.resolve(__dirname, '../dist'),
    preserveModules: true,
    preserveModulesRoot: path.resolve(__dirname, '../dist/dk'),
    sourcemap: true,
    file: `[name].mjs`
  })


}
