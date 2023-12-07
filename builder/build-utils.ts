import path from 'path'
import {
  rollup,
  type OutputOptions,
  type ModuleFormat,
  type InputPluginOption
} from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { OUTPUT, PKG_DIR_NAME } from './constants'
import dts from 'rollup-plugin-dts'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { fileURLToPath } from 'url'
import glob from 'fast-glob'
import { readdirSync } from 'fs'
import { cwd } from 'process'

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

  // packages下所有的ts文件，并忽略测试和node_modules中的文件
  const files = glob.sync('packages/**/*.ts', {
    ignore: ['**/*.spec.ts', '**/node_modules', 'packages/common']
  })

  const pkgRE = new RegExp('^' + PKG_DIR_NAME)
  const extRE = /\.[A-z\d]+$/
  return [
    rollup({
      // 当input是一个对象时，会将key作为输出目录,value作为输入文件
      // key不应该是个绝对路径
      input: Object.fromEntries(
        files.map(filePath => {
          return [
            // 这里将删除 `所有文件到packages/目录之前的所有路径` 以及每个文件的扩展名。
            // 因此，例如 packages/fe/**/*.ts 会变成 fe/**/*
            filePath.replace(pkgRE, '').replace(extRE, ''),

            // 文件的绝对路径
            fileURLToPath(new URL(path.join('..', filePath), import.meta.url))
          ]
        })
      ),
      plugins,

      // crypto-js上下文需要指定为window
      moduleContext: id =>
        /node_modules[\/\\]crypto-js/.test(id) ? 'window' : undefined
    }),
    rollup({
      input: readdirSync(
        fileURLToPath(new URL(`../${PKG_DIR_NAME}`, import.meta.url))
      ).map(pkgPath =>
        path.resolve(
          fileURLToPath(new URL(`../${PKG_DIR_NAME}`, import.meta.url)),
          pkgPath,
          'index.ts'
        )
      ),
      plugins: [
        dts({
          compilerOptions: {
            moduleResolution: 2,
            module: 99
          },
          tsconfig: path.resolve(cwd(), 'tsconfig/tsconfig.fe.json')
        })
      ]
    })
  ]
}

async function build() {
  const bundles = await Promise.all(roll())

  const formats: ModuleFormat[] = ['es', 'cjs']

  const outputOptions: OutputOptions[] = formats.map(format => ({
    format,
    dir: path.resolve(OUTPUT, format),
    sourcemap: true
  }))

  await Promise.all(
    outputOptions.map(option => bundles.map(bundle => bundle.write(option)))
  )

  bundles.forEach(bundle => {
    bundle.close()
  })
}

export const buildUtils = build
