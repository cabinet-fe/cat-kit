import { rolldown } from 'rolldown'
import path from 'path'
import { readJson } from 'fs-extra'
import { dts as RolldownDTS } from 'rolldown-plugin-dts'
import { getBuildInput, getPlugins, pkgTo } from './repo-helper'
import type { PackageConfig, PackageOption } from './types'
import pic from 'picocolors'
import { build } from 'tsdown'

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
    // 获取待构建包：排除构建结束的且依赖全部构建完成的
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
      const { build, output } = conf
      let { dts, plugins, ...buildOptions } = build

      const tsconfig = build.resolve?.tsconfigFilename

      if (dts && tsconfig) {
        plugins = await getPlugins(plugins)
        if (Array.isArray(plugins)) {
          plugins.push(RolldownDTS())
        }
      }

      const bundle = await rolldown({
        plugins,
        ...buildOptions
      })

      const start = Date.now()

      await bundle.write({
        format: 'es',
        ...output
      })

      console.log(
        pic.cyan(`${conf.name}`) +
          pic.gray(' finished in') +
          pic.green(` ${Date.now() - start}ms`)
      )
    } catch (err) {
      console.error(pic.red(`${conf.name} 构建失败`))
      console.error(err)
    }
  }
}

export class Package {
  /**
   * 包
   * @param pkgDir 包目录
   * @param option 包配置
   */
  constructor(pkgDir: string, option: PackageOption) {}
}
