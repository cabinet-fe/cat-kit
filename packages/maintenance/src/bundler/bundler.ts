import path from 'node:path'
import { readJson } from '@cat-kit/be'
import pic from 'picocolors'
import { build } from 'tsdown'
import { visualizer } from 'rollup-plugin-visualizer'
import type {
  BundlePackageOption,
  BundlePackageConfig,
  BuildSummary,
  BatchBuildResult,
  BundleResult
} from './types'

interface PackageJson {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

/**
 * Monorepo 打包器
 *
 * 用于按依赖关系分批并行构建 monorepo 中的多个包。
 * 使用 tsdown 进行构建，支持 TypeScript、生成类型声明文件和 sourcemap。
 *
 * @example
 * ```ts
 * import { MonoRepoBundler } from '@cat-kit/maintenance'
 *
 * const bundler = new MonoRepoBundler([
 *   {
 *     dir: '/path/to/packages/core',
 *     build: { input: 'src/index.ts' }
 *   },
 *   {
 *     dir: '/path/to/packages/utils',
 *     deps: ['@my-org/core'],
 *     build: {
 *       input: 'src/index.ts',
 *       external: ['@my-org/core']
 *     }
 *   }
 * ])
 *
 * await bundler.build()
 * ```
 */
export class MonoRepoBundler {
  private packagesConfigs: BundlePackageConfig[] = []

  /**
   * 创建 MonoRepoBundler 实例
   * @param packages - 包配置列表
   */
  constructor(private packages: BundlePackageOption[]) {}

  /**
   * 初始化包配置
   * 并行读取所有包的 package.json，获取包名称等信息
   */
  private async initPackages(): Promise<void> {
    this.packagesConfigs = await Promise.all(
      this.packages.map(async pkg => {
        const { dir, build: buildOpt, output } = pkg
        const pkgJson = await readJson<PackageJson>(
          path.resolve(dir, 'package.json')
        )
        if (!pkgJson.name) {
          throw new Error(`${dir}/package.json 中缺少 name 字段`)
        }
        const {
          dependencies = {},
          devDependencies = {},
          peerDependencies = {}
        } = pkgJson

        const allDeps = {
          ...dependencies,
          ...peerDependencies,
          ...devDependencies
        }
        const deps = Object.keys(allDeps).filter(dep =>
          allDeps[dep]!.startsWith('workspace:*')
        )

        buildOpt.external = [
          ...this.getPeerDevExternal(peerDependencies, devDependencies),
          ...(buildOpt.external ?? [])
        ]

        console.log(dir, buildOpt.external)

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

  /**
   * 获取待构建的包
   * 返回依赖已全部构建完成的包列表
   * @param buildedPackages - 已构建的包名称集合
   * @returns 可以构建的包配置列表
   */
  private getPkgsToBuild(buildedPackages: Set<string>): BundlePackageConfig[] {
    return this.packagesConfigs.filter(
      pkg =>
        !buildedPackages.has(pkg.name) &&
        (!pkg.deps?.length || pkg.deps.every(dep => buildedPackages.has(dep)))
    )
  }

  /**
   * 构建所有包
   *
   * 按照依赖关系分批并行构建：
   * 1. 先构建没有依赖的包
   * 2. 再构建依赖已满足的包
   * 3. 重复直到所有包构建完成
   *
   * @returns 构建结果摘要
   *
   * @example
   * ```ts
   * const bundler = new MonoRepoBundler(packages)
   * const summary = await bundler.build()
   *
   * console.log(`总耗时: ${summary.totalDuration}ms`)
   * console.log(`成功: ${summary.totalSuccess}, 失败: ${summary.totalFailed}`)
   * ```
   */
  async build(): Promise<BuildSummary> {
    const start = Date.now()
    await this.initPackages()

    console.log(pic.bold(pic.magenta('🚀 开始构建...\n')))

    const buildedPackages = new Set<string>()
    const batches: BatchBuildResult[] = []

    let pkgsToBuild = this.getPkgsToBuild(buildedPackages)
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
      const batchSuccess = results.filter(r => r.success).length
      const batchFailed = results.length - batchSuccess
      totalSuccess += batchSuccess
      totalFailed += batchFailed

      pkgsToBuild.forEach(pkg => buildedPackages.add(pkg.name))

      // 记录批次结果
      const batchDuration = Date.now() - batchStart
      batches.push({
        batchIndex,
        duration: batchDuration,
        successCount: batchSuccess,
        failedCount: batchFailed,
        results
      })

      // 打印批次完成信息
      const statsText = [
        batchSuccess > 0 && pic.green(`✓ ${batchSuccess}`),
        batchFailed > 0 && pic.red(`✗ ${batchFailed}`)
      ]
        .filter(Boolean)
        .join(' ')

      console.log(pic.dim(`  └─ ${batchDuration}ms `) + statsText + '\n')

      pkgsToBuild = this.getPkgsToBuild(buildedPackages)
      batchIndex++
    }

    const totalDuration = Date.now() - start

    // 打印总体统计
    const totalStats = [
      totalSuccess > 0 && pic.green(`✓ ${totalSuccess}`),
      totalFailed > 0 && pic.red(`✗ ${totalFailed}`)
    ]
      .filter(Boolean)
      .join(' ')

    console.log(
      pic.bold(pic.green(`✨ 总耗时: ${totalDuration}ms `)) + totalStats
    )

    // 如果有成功构建的包，提示查看分析报告
    if (totalSuccess > 0) {
      console.log(
        '\n' +
          pic.bold(pic.cyan('📊 Bundle 分析报告已生成')) +
          '\n' +
          pic.dim('  运行 ') +
          pic.cyan('bun run analyze') +
          pic.dim(' 启动服务查看可视化分析\n')
      )
    }

    return {
      totalDuration,
      totalSuccess,
      totalFailed,
      batches
    }
  }

  /**
   * 获取需要标记为 external 的依赖
   * @param peerDependencies - peerDependencies 列表
   * @param devDependencies - devDependencies 列表
   * @returns 同时存在于 peerDependencies 与 devDependencies 中的依赖
   */
  private getPeerDevExternal(
    peerDependencies: Record<string, string>,
    devDependencies: Record<string, string>
  ): string[] {
    if (!Object.keys(peerDependencies).length) return []
    const devDepsSet = new Set(Object.keys(devDependencies))
    return Object.keys(peerDependencies).filter(dep => devDepsSet.has(dep))
  }

  /**
   * 合并显式 external 和自动 external
   * @param configExternal - 配置中传入的 external
   * @param autoExternal - 自动检测出的 external
   * @returns 去重合并后的 external，如果为空返回 undefined
   */
  private mergeExternalDeps(
    configExternal?: string[],
    autoExternal: string[] = []
  ): string[] | undefined {
    const merged = new Set<string>()
    configExternal?.forEach(dep => merged.add(dep))
    autoExternal.forEach(dep => merged.add(dep))
    return merged.size ? [...merged] : undefined
  }

  /**
   * 构建单个包
   * @param conf - 包配置
   * @returns 构建结果
   */
  private async buildPackage(conf: BundlePackageConfig): Promise<BundleResult> {
    const start = Date.now()
    const { dir, build: buildOpt, output } = conf

    try {
      const outDir = output?.dir || 'dist'

      await build({
        entry: buildOpt.input,
        cwd: dir,
        outDir,
        dts: buildOpt.dts !== false,
        sourcemap: output?.sourcemap !== false,
        external: buildOpt.external,
        outExtensions: () => ({
          js: '.js',
          dts: '.d.ts'
        }),
        format: 'es',
        platform: buildOpt.platform || 'neutral',
        minify: true,
        logLevel: 'warn',
        plugins: [
          visualizer({
            filename: path.resolve(dir, outDir, 'stats.html'),
            title: 'Cat-Kit Bundle 分析'
          })
        ]
      })

      const duration = Date.now() - start
      console.log(
        `  ├─ ` +
          pic.green('✓') +
          ' ' +
          pic.cyan(conf.name.padEnd(22)) +
          pic.dim(`${duration}ms`)
      )

      return {
        name: conf.name,
        success: true,
        duration
      }
    } catch (err) {
      const duration = Date.now() - start
      console.error(`  ├─ ` + pic.red('✗') + ' ' + pic.red(conf.name))
      console.error(err)

      return {
        name: conf.name,
        success: false,
        duration,
        error: err instanceof Error ? err : new Error(String(err))
      }
    }
  }
}
