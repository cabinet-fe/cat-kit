import path from 'path'
import { rollup, type ModuleFormat, type InputPluginOption } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { OUTPUT, PKG_DIR_NAME } from './constants'
import { dts } from 'rollup-plugin-dts'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { fileURLToPath } from 'url'
import glob from 'fast-glob'
import pcolor from 'picocolors'

function buildJS() {
  const plugins: InputPluginOption[] = [
    esbuild({
      minify: false
    }),
    nodeResolve(),
    commonjs()
  ]

  // packages下所有的ts文件，并忽略测试和node_modules中的文件
  const files = glob.sync('packages/**/*.ts', {
    ignore: ['**/*.spec.ts', '**/node_modules', 'packages/common', '**/*.d.ts']
  })

  const pkgRE = new RegExp('^' + PKG_DIR_NAME)
  const extRE = /\.[A-z\d]+$/

  return rollup({
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
  })
}

function buildDTS() {
  const input = ['fe', 'canvas', 'be'].map(pkg => {
    return path.resolve(
      fileURLToPath(new URL(`../${PKG_DIR_NAME}/${pkg}`, import.meta.url)),
      'index.ts'
    )
  })

  // { 'fe/index': '/xxx/xxx/fe/index.ts' }
  // ...
  return rollup({
    input: Object.fromEntries(
      input.map(file => [
        file.split(/packages[\\\/]/)[1]!.replace(/\.[A-z\d]+$/, ''),
        file
      ])
    ),
    plugins: [
      dts({
        compilerOptions: {
          moduleResolution: 100,
          emitDeclarationOnly: true,
          allowJs: true,
          module: 99
        },
        respectExternal: true
      })
    ]
  })
}

async function build() {
  try {
    const jsBundler = await buildJS()
    const dtsBundler = await buildDTS()

    const formats: ModuleFormat[] = ['es', 'cjs']

    await Promise.all(
      formats.map(format =>
        jsBundler.write({
          format,
          dir: path.resolve(OUTPUT, format),
          sourcemap: true
        })
      )
    )

    await Promise.all(
      formats.map(format =>
        dtsBundler.write({
          format,
          dir: path.resolve(OUTPUT, format)
        })
      )
    )
    jsBundler.close()
    dtsBundler.close()
  } catch (error: any) {
    console.error(pcolor.red(error))
  }
}

export const buildUtils = build
