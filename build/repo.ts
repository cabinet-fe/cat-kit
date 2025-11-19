import path from 'path'
import { readJson } from 'fs-extra'
import type { PackageConfig, PackageOption } from './types'
import pic from 'picocolors'
import { build } from 'tsdown'

export class MonoRepoLib {
  private packagesConfigs: PackageConfig[] = []

  constructor(private packages: PackageOption[]) {}

  private async initPackages() {
    // 生成构建配置 - 并行读取所有 package.json
    this.packagesConfigs = await Promise.all(
      this.packages.map(async pkg => {
        const { dir, build: buildOpt, output, deps } = pkg
        const pkgJson = await readJson(path.resolve(dir, 'package.json'))
        if (!pkgJson.name) {
          throw new Error(`${dir}/package.json 中缺少 name 字段`)
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
  }

  /** 构建所有包 - 按照依赖关系并行构建 */
  async build(): Promise<void> {
    const start = Date.now()
    await this.initPackages()

    console.log(pic.bold(pic.magenta('🚀 开始构建...\n')))

    const buildedPackages = new Set<string>()

    // 获取待构建包：排除已构建的且依赖全部构建完成的
    const getPkgsToBuild = () =>
      this.packagesConfigs.filter(
        pkg =>
          !buildedPackages.has(pkg.name) &&
          (!pkg.deps?.length || pkg.deps.every(dep => buildedPackages.has(dep)))
      )

    let pkgsToBuild = getPkgsToBuild()
    let batchIndex = 1
    let totalSuccess = 0
    let totalFailed = 0

    // 分批并行构建，每批内的包互不依赖可并行构建
    while (pkgsToBuild.length) {
      const batchStart = Date.now()

      // 打印批次信息
      console.log(pic.bold(`⚡ 第${batchIndex}轮`))

      const results = await Promise.all(
        pkgsToBuild.map(conf => this.buildPackage(conf))
      )

      // 统计本轮成功和失败数量
      const batchSuccess = results.filter(r => r).length
      const batchFailed = results.length - batchSuccess
      totalSuccess += batchSuccess
      totalFailed += batchFailed

      pkgsToBuild.forEach(pkg => buildedPackages.add(pkg.name))

      // 打印批次完成信息
      const statsText = [
        batchSuccess > 0 && pic.green(`✓ ${batchSuccess}`),
        batchFailed > 0 && pic.red(`✗ ${batchFailed}`)
      ]
        .filter(Boolean)
        .join(' ')

      console.log(
        pic.dim(`  └─ ${Date.now() - batchStart}ms `) + statsText + '\n'
      )

      pkgsToBuild = getPkgsToBuild()
      batchIndex++
    }

    // 打印总体统计
    const totalStats = [
      totalSuccess > 0 && pic.green(`✓ ${totalSuccess}`),
      totalFailed > 0 && pic.red(`✗ ${totalFailed}`)
    ]
      .filter(Boolean)
      .join(' ')

    console.log(
      pic.bold(pic.green(`✨ 总耗时: ${Date.now() - start}ms `)) + totalStats
    )
  }

  private async buildPackage(conf: PackageConfig): Promise<boolean> {
    const start = Date.now()
    const { dir, build: buildOpt, output } = conf

    try {
      await build({
        entry: buildOpt.input,
        cwd: dir,
        outDir: output?.dir || 'dist',
        dts: buildOpt.dts !== false,
        sourcemap: output?.sourcemap !== false,
        external: buildOpt.external,
        treeshake: true,
        minify: false,
        clean: true,
        silent: true
      })

      console.log(
        `  ├─ ` +
          pic.green('✓') +
          ' ' +
          pic.cyan(conf.name.padEnd(22)) +
          pic.dim(`${Date.now() - start}ms`)
      )
      return true
    } catch (err) {
      console.error(`  ├─ ` + pic.red('✗') + ' ' + pic.red(conf.name))
      console.error(err)
      return false
    }
  }
}
