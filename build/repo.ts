import { rolldown } from 'rolldown'
import path from 'path'
import { readJson } from 'fs-extra'
import { dts as DTSPlugin } from 'rollup-plugin-dts'
import { $ } from 'execa'
import { getBuildInput, pkgTo } from './repo-helper'
import type { PackageConfig, PackageOption } from './types'
import pic from 'picocolors'

export class MonoRepoLib {
  private packages: PackageOption[]

  private packagesConfigs: PackageConfig[] = []

  private initialized = false

  constructor(packages: PackageOption[]) {
    this.packages = packages
  }

  private async initPackages() {
    if (this.initialized) return
    const { packages } = this

    // 生成构建配置
    this.packagesConfigs = await Promise.all(
      packages.map(async pkg => {
        const { dir, build, output, deps } = pkg
        const pkgJson = await readJson(path.resolve(dir, 'package.json'))
        if (!pkgJson.name) {
          throw new Error(`package.json 中缺少 name 字段`)
        }

        // 生成构建配置映射
        const { resolve, input, dts, ...restBuild } = build
        const { tsconfigFilename = 'tsconfig.json', ...restResolve } =
          resolve || {}

        const {
          dir: outputDir = 'dist',
          file: outputFile,
          ...restOutput
        } = output || {}

        return {
          dir,
          deps,
          name: pkgJson.name,
          build: {
            dts,
            input: getBuildInput(dir, input),
            resolve: {
              ...restResolve,
              tsconfigFilename: pkgTo(dir, tsconfigFilename)
            },
            ...restBuild
          },
          output: {
            dir: pkgTo(dir, outputDir),
            file: outputFile ? pkgTo(dir, outputFile) : undefined,
            ...restOutput
          }
        }
      })
    )

    this.initialized = true
  }

  /** 构建所有包 */
  async build() {
    await this.initPackages()

    // 构建结束的包
    const buildedPackages = new Set<string>()
    function getPkgsToBuild(pkg: PackageConfig) {
      return (
        !buildedPackages.has(pkg.name) &&
        (!pkg.deps?.length || pkg.deps.every(dep => buildedPackages.has(dep)))
      )
    }
    let pkgsToBuild = this.packagesConfigs.filter(getPkgsToBuild)

    while (pkgsToBuild.length) {
      // 第一轮构建
      await Promise.all(
        pkgsToBuild.map(conf => {
          return this.buildPackage(conf)
        })
      )
      pkgsToBuild.forEach(pkg => buildedPackages.add(pkg.name))
      pkgsToBuild = this.packagesConfigs.filter(getPkgsToBuild)
    }
  }

  private async buildPackage(conf: PackageConfig) {
    try {
      const { build, output, dir } = conf

      const { dts, ...restBuild } = build

      const bundle = await rolldown(restBuild)

      console.log(pic.gray(`开始构建: ${conf.name}`))

      await bundle.write({
        format: 'es',
        ...output
      })

      const tsconfig = build.resolve?.tsconfigFilename

      if (dts && tsconfig) {
        await $({ cwd: dir })`bun tsc -p tsconfig.json`
        // const dtsBundle = await rolldown({
        //   input: path.resolve(output!.dir!, 'index.d.ts'),
        //   plugins: [
        //     DTSPlugin({
        //       tsconfig
        //     })
        //   ]
        // })

        // await dtsBundle.write({
        //   format: 'es',
        //   file: path.resolve(output!.dir!, 'index.d.ts')
        // })
      }

      console.log(pic.green(`${conf.name} 构建完成 \n`))
    } catch (err) {
      console.error(pic.red(`${conf.name} 构建失败`))
      console.error(err)
    }
  }
}
