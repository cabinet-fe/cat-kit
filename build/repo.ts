import path from 'path'
import { readJson } from 'fs-extra'
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
        const { dir, build: buildOpt, output, deps } = pkg
        const pkgJson = await readJson(path.resolve(dir, 'package.json'))
        if (!pkgJson.name) {
          throw new Error(`package.json 中缺少 name 字段`)
        }

        return {
          dir,
          deps,
          name: pkgJson.name,
          build: buildOpt,
          output
        }
      })
    )

    this.initialized = true
  }

  /** 构建所有包 */
  async build(): Promise<void> {
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
      const start = Date.now()
      const { dir, build: buildOpt, output } = conf

      await build({
        entry: buildOpt.input as string,
        cwd: dir,
        outDir: output?.dir || 'dist',
        format: ['esm', 'cjs'],
        dts: buildOpt.dts !== false,
        sourcemap: output?.sourcemap !== false,
        external: buildOpt.external,
        treeshake: true,
        minify: false,
        clean: true
      })

      console.log(
        pic.cyan(`${conf.name}`) +
          pic.gray(' finished in ') +
          pic.green(`${Date.now() - start}ms`)
      )
    } catch (err) {
      console.error(pic.red(`${conf.name} 构建失败`))
      console.error(err)
      throw err
    }
  }
}
