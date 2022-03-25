import { defineConfig } from 'rollup'
import esBuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'

const input = 'dk/index.ts'

export default [
  defineConfig({
    input,
    output: {
      file: 'dist/fe-dk.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [esBuild({ minify: true })]
  }),
  defineConfig({
    input,
    output: {
      file: 'dist/fe-dk.common.js',
      format: 'commonjs',
      sourcemap: true
    },
    plugins: [esBuild({ minify: true })]
  }),
  defineConfig({
    input: 'dk/index.ts',
    output: {
      file: 'types/fe-dk.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  })
]
