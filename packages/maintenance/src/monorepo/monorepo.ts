import { existsSync } from 'node:fs'
import { join, resolve, isAbsolute } from 'node:path'
import chalk from 'chalk'
import type {
  MonorepoWorkspace,
  MonorepoRoot,
  WorkspaceBuildConfig,
  GroupBumpOptions,
  GroupPublishOptions,
  BuildSummary,
  MonorepoValidationResult,
  DependencyGraphResult
} from './types'
import type { PackageJson } from '../types'
import type { BumpResult } from '../version/types'

import { buildLib, type BuildConfig } from '../build'
import { bumpVersion, syncPeerDependencies, syncDependencies } from '../version'
import { publishPackage } from '../release'
import { checkCircularDependencies } from '../deps/circular'
import { checkVersionConsistency } from '../deps/consistency'
import { buildDependencyGraph as buildDepGraph, visualizeDependencyGraph } from '../deps/graph'
import { readJsonSync, matchWorkspaces, getPeerDevExternal } from './helpers'

/**
 * 工作区分组类
 *
 * 用于对一组工作区进行批量操作
 */
class WorkspaceGroup<Workspaces extends string> {
  #workspaces: MonorepoWorkspace[]

  constructor(repo: Monorepo, workspaceNames: Workspaces[]) {
    // 过滤出匹配的工作区
    const nameSet = new Set(workspaceNames)
    this.#workspaces = repo.workspaces.filter(ws => nameSet.has(ws.name as Workspaces))
  }

  /**
   * 构建
   *
   * @param configs - 工作区配置, 如果传入将会被合并
   */
  async build(
    configs?: Partial<Record<Workspaces, WorkspaceBuildConfig>>,
  ): Promise<void> {
    const start = Date.now()
    const workspaces = this.#workspaces

    // 生成构建配置
    function getBuildConfig(ws: MonorepoWorkspace): BuildConfig {
      const autoExternal = getPeerDevExternal(ws.pkg)
      const { external = [], ...config } = configs?.[ws.name] || {}
      return {
        dir: ws.dir,
        external: [...new Set([...autoExternal, ...external])],
        ...config
      }
    }

    // 构建内部依赖映射
    const internalNames = new Set(workspaces.map(ws => ws.name))
    const depsMap = new Map<string, string[]>()
    for (const ws of workspaces) {
      const allDeps = {
        ...(ws.pkg.dependencies || {}),
        ...(ws.pkg.devDependencies || {}),
        ...(ws.pkg.peerDependencies || {})
      }
      const internalDeps = Object.keys(allDeps).filter(dep => internalNames.has(dep))
      depsMap.set(ws.name, internalDeps)
    }

    // 生成批次（拓扑排序）
    const batches: MonorepoWorkspace[][] = []
    const built = new Set<string>()

    while (built.size < workspaces.length) {
      const batch = workspaces.filter(ws =>
        !built.has(ws.name) &&
        (depsMap.get(ws.name) || []).every(dep => built.has(dep))
      )

      if (batch.length === 0) {
        throw new Error('检测到循环依赖，无法完成构建')
      }

      batches.push(batch)
      batch.forEach(ws => built.add(ws.name))
    }

    // 执行构建
    const results: BuildSummary['results'] = []
    let batchIndex = 1

    for (const batch of batches) {
      console.log(chalk.bold(`⚡ 第${batchIndex}轮构建 (${batch.length} 个包)`))

      const batchResults = await Promise.all(
        batch.map(async ws => {
          const wsStart = Date.now()
          const config = getBuildConfig(ws)

          try {
            const result = await buildLib(config)
            const duration = Date.now() - wsStart

            if (result.success) {
              console.log(`  ${chalk.green('✓')} ${chalk.cyan(ws.name)} ${chalk.dim(`${duration}ms`)}`)
            } else {
              console.log(`  ${chalk.red('✗')} ${chalk.red(ws.name)}`)
              if (result.error) console.error(result.error)
            }

            return {
              name: ws.name,
              success: result.success,
              duration,
              error: result.error
            }
          } catch (err) {
            const duration = Date.now() - wsStart
            console.log(`  ${chalk.red('✗')} ${chalk.red(ws.name)}`)
            console.error(err)

            return {
              name: ws.name,
              success: false,
              duration,
              error: err instanceof Error ? err : new Error(String(err))
            }
          }
        })
      )

      results.push(...batchResults)
      batchIndex++
    }

    const successCount = results.filter(r => r.success).length
    const failedCount = results.length - successCount

    const totalDuration = Date.now() - start
    console.log(chalk.bold(chalk.green(`✨ 构建完成: ${successCount} 成功, ${failedCount} 失败 ${totalDuration}ms`)))


  }

  /**
   * 更新版本号
   */
  async bumpVersion(options: GroupBumpOptions): Promise<BumpResult> {
    const { syncPeer = true, syncDeps = true, ...bumpOptions } = options

    // 更新所有包的版本
    let newVersion = ''
    const updated: BumpResult['updated'] = []

    for (const ws of this.#workspaces) {
      const result = await bumpVersion(ws.dir, {
        ...bumpOptions,
        version: newVersion || bumpOptions.version
      })

      if (!newVersion) {
        newVersion = result.version
      }
      updated.push(...result.updated)
    }

    // 同步依赖
    const packages = this.#workspaces.map(ws => ({ dir: ws.dir }))

    if (syncPeer) {
      await syncPeerDependencies(packages, newVersion)
    }

    if (syncDeps) {
      await syncDependencies(packages, newVersion)
    }

    console.log(chalk.green(`✓ 版本更新到 ${newVersion}`))

    return { version: newVersion, updated }
  }

  /**
   * 发布包
   */
  async publish(options: GroupPublishOptions = {}): Promise<void> {
    const { skipPrivate = true, ...publishOptions } = options

    for (const ws of this.#workspaces) {
      if (skipPrivate && ws.private) {
        console.log(chalk.dim(`  跳过私有包: ${ws.name}`))
        continue
      }

      try {
        await publishPackage({
          cwd: ws.dir,
          ...publishOptions
        })
        console.log(chalk.green(`✓ 发布: ${ws.name}`))
      } catch (err) {
        console.error(chalk.red(`✗ 发布失败: ${ws.name}`))
        throw err
      }
    }
  }
}

/**
 * Monorepo 管理类
 *
 * @example
 * ```ts
 * const repo = new Monorepo('/path/to/repo')
 *
 * // 获取所有工作区
 * console.log(repo.workspaces)
 *
 * // 对指定包进行操作
 * const group = repo.group(['@cat-kit/core', '@cat-kit/fe'])
 * await group.build({
 *   '@cat-kit/core': { entry: 'src/index.ts' }
 * })
 * ```
 */
export class Monorepo {
  #rootDir: string
  #root: MonorepoRoot | null = null
  #workspaces: MonorepoWorkspace[] | null = null

  constructor(rootDir?: string) {
    const dir = rootDir || process.cwd()

    if (!isAbsolute(dir)) {
      throw new Error('rootDir 必须是绝对路径')
    }

    this.#rootDir = dir
  }

  /**
   * 根目录信息
   */
  get root(): MonorepoRoot {
    if (!this.#root) {
      const rootPkgPath = join(this.#rootDir, 'package.json')
      if (!existsSync(rootPkgPath)) {
        throw new Error(`未找到 package.json: ${rootPkgPath}`)
      }
      const pkg = readJsonSync<PackageJson>(rootPkgPath)
      this.#root = {
        dir: this.#rootDir,
        pkg,
        workspacePatterns: pkg.workspaces || []
      }
    }
    return this.#root
  }

  /**
   * 工作区列表
   */
  get workspaces(): MonorepoWorkspace[] {
    if (!this.#workspaces) {
      this.#workspaces = this.#getWorkspaces()
    }
    return this.#workspaces
  }

  /**
   * 同步加载所有工作区
   */
  #getWorkspaces(): MonorepoWorkspace[] {
    const rootPkgPath = join(this.#rootDir, 'package.json')

    if (!existsSync(rootPkgPath)) {
      throw new Error(`未找到 package.json: ${rootPkgPath}`)
    }

    const rootPkg = readJsonSync<PackageJson>(rootPkgPath)
    const workspacePatterns = rootPkg.workspaces || []

    if (workspacePatterns.length === 0) {
      return []
    }

    const dirs = matchWorkspaces(workspacePatterns, this.#rootDir)

    const workspaces: MonorepoWorkspace[] = []
    for (const dir of dirs) {
      const absoluteDir = resolve(this.#rootDir, dir)
      const pkgPath = join(absoluteDir, 'package.json')

      if (!existsSync(pkgPath)) continue

      try {
        const pkg = readJsonSync<PackageJson>(pkgPath)

        if (!pkg.name) continue

        workspaces.push({
          name: pkg.name,
          dir: absoluteDir,
          version: pkg.version || '0.0.0',
          pkg,
          private: pkg.private || false
        })
      } catch {
        // 跳过无效的 package.json
      }
    }



    return workspaces
  }

  /**
   * 按工作区名称分组
   */
  group<const T extends readonly string[]>(names: T): WorkspaceGroup<T[number]> {
    return new WorkspaceGroup(this, [...names])
  }

  /**
   * 验证 monorepo 的有效性
   *
   * - 检测循环依赖
   * - 检测版本不一致
   */
  validate(): MonorepoValidationResult {
    const workspaces = this.workspaces

    // 转换为 deps 模块需要的格式
    const packages = workspaces.map(ws => ({
      name: ws.name,
      version: ws.version,
      pkg: ws.pkg
    }))

    const circularResult = checkCircularDependencies(packages)
    const consistencyResult = checkVersionConsistency(packages)

    return {
      valid: !circularResult.hasCircular && consistencyResult.consistent,
      hasCircular: circularResult.hasCircular,
      circularChains: circularResult.cycles.map((c: { chain: string[] }) => c.chain),
      inconsistentDeps: consistencyResult.inconsistent
    }
  }

  /**
   * 构建依赖关系图
   */
  buildDependencyGraph(options: {
    /** 是否包含外部依赖 */
    includeExternal?: boolean
  } = {}): DependencyGraphResult {
    const { includeExternal = false } = options
    const workspaces = this.workspaces

    // 转换为 deps 模块需要的格式
    const packages = workspaces.map(ws => ({
      name: ws.name,
      version: ws.version,
      pkg: ws.pkg
    }))

    // 使用 deps 模块构建依赖图
    const graph = buildDepGraph(packages)

    // 根据选项过滤节点
    const nodes = includeExternal
      ? graph.nodes
      : graph.nodes.filter(n => !n.external)

    const edges = includeExternal
      ? graph.edges
      : graph.edges.filter(edge => {
        const targetNode = graph.nodes.find(n => n.id === edge.to)
        return targetNode && !targetNode.external
      })

    // 生成 Mermaid 图
    const mermaid = visualizeDependencyGraph(
      { nodes, edges },
      { includeExternal, distinguishTypes: true }
    )

    return { nodes, edges, mermaid }
  }
}
