import path from 'path'
import {
  rollup,
  type OutputOptions,
  type ModuleFormat,
  type InputPluginOption
} from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { FE_INPUT, BE_INPUT, OUTPUT } from './constants'
import dts from 'rollup-plugin-dts'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { fileURLToPath } from 'url'
import glob from 'fast-glob'

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

function roll() {
  const plugins: InputPluginOption[] = [
    esbuild({
      minify: false
    }),
    nodeResolve(),
    commonjs()
  ]
  console.log(path.resolve(__dirname, '../packages/fe/**/*.ts'))
  console.log(Object.fromEntries(
    glob.sync(path.resolve(__dirname, '../packages/fe/**/*.ts'), {
      ignore: ['*.spec.ts', 'node_modules/**']
    }).map(file => [
      // 这里将删除 `src/` 以及每个文件的扩展名。
      // 因此，例如 src/nested/foo.js 会变成 nested/foo
      path.relative(
        'src',
        file.slice(0, file.length - path.extname(file).length)
      ),
      // 这里可以将相对路径扩展为绝对路径，例如
      // src/nested/foo 会变成 /project/src/nested/foo.js
      fileURLToPath(new URL(file, import.meta.url))
    ])
  ))

  return [
    rollup({
      input: Object.fromEntries(
        glob.sync('../packages/fe/*.ts', {
          ignore: ['*.spec.ts']
        }).map(file => [
          // 这里将删除 `src/` 以及每个文件的扩展名。
          // 因此，例如 src/nested/foo.js 会变成 nested/foo
          path.relative(
            'src',
            file.slice(0, file.length - path.extname(file).length)
          ),
          // 这里可以将相对路径扩展为绝对路径，例如
          // src/nested/foo 会变成 /project/src/nested/foo.js
          fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
      plugins,
      moduleContext: id =>
        /node_modules[\/\\]crypto-js/.test(id) ? 'window' : undefined
    })
    // rollup({
    //   input: path.resolve(entry, `../${basename}.d.ts`),
    //   plugins: [
    //     dts()
    //   ]
    // })
  ]
}

async function build() {
  const bundles = await Promise.all(roll())

  const formats: ModuleFormat[] = ['es', 'cjs']

  const outputOptions: OutputOptions[] = formats.map(format => ({
    format,
    dir: path.resolve(OUTPUT, format),
    sourcemap: true,
    exports: 'auto',
    preserveModules: true
  }))

  await Promise.all(
    outputOptions.map(option => bundles.map(bundle => bundle.write(option)))
  )

  bundles.forEach(bundle => {
    bundle.close()
  })
}

export const buildUtils = build
