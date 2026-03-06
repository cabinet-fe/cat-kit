import { existsSync } from 'node:fs'
import { join, resolve, isAbsolute } from 'node:path'

import chalk from 'chalk'

import { buildLib, type BuildConfig } from '../build'
import { checkCircularDependencies } from '../deps/circular'
import { checkVersionConsistency } from '../deps/consistency'
import { buildDependencyGraph as buildDepGraph, visualizeDependencyGraph } from '../deps/graph'
import { publishPackage } from '../release'
import type { PackageJson } from '../types'
import { bumpVersion, syncPeerDependencies, syncDependencies } from '../version'
import type { BumpResult } from '../version/types'
import { readJsonSync, matchWorkspaces } from './helpers'
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

/**
 * 工作区分组类
 *
 * 用于对一组工作区进行批量操作
 */
class WorkspaceGroup<Workspaces extends string> {
  #workspaces: MonorepoWorkspace[]
  #repo: Monorepo

  constructor(repo: Monorepo, workspaceNames: Workspaces[]) {
    this.#repo = repo
    // 过滤出匹配的工作区
    const nameSet = new Set(workspaceNames)
    this.#workspaces = repo.workspaces.filter((ws) => nameSet.has(ws.name as Workspaces))
  }

  /**
   * 工作区列表
   */
  get workspaces(): MonorepoWorkspace[] {
    return this.#workspaces
  }

  /**
   * 构建工作区
   *
   *
   *
   * @param configs - 工作区配置, 如果传入将会被合并
   */
  async build(configs?: Partial<Record<Workspaces, WorkspaceBuildConfig>>): Promise<void> {
    const start = Date.now()
    const workspaces = this.#workspaces

    // 生成构建配置
    function getBuildConfig(ws: MonorepoWorkspace): BuildConfig {
      const config = configs?.[ws.name] || {}
      return { dir: ws.dir, ...config }
    }

    // 构建内部依赖映射
    const internalNames = new Set(workspaces.map((ws) => ws.name))
    const depsMap = new Map<string, string[]>()
    for (const ws of workspaces) {
      const allDeps = {
        ...ws.pkg.dependencies,
        ...ws.pkg.devDependencies,
        ...ws.pkg.peerDependencies
      }
      const internalDeps = Object.keys(allDeps).filter((dep) => internalNames.has(dep))
      depsMap.set(ws.name, internalDeps)
    }

    // 生成批次（拓扑排序）
    const batches: MonorepoWorkspace[][] = []
    const built = new Set<string>()

    while (built.size < workspaces.length) {
      const batch = workspaces.filter(
        (ws) => !built.has(ws.name) && (depsMap.get(ws.name) || []).every((dep) => built.has(dep))
      )

      if (batch.length === 0) {
        throw new Error('检测到循环依赖，无法完成构建')
      }

      batches.push(batch)
      batch.forEach((ws) => built.add(ws.name))
    }

    // 执行构建
    const results: BuildSummary['results'] = []
    let batchIndex = 1

    for (const batch of batches) {
      console.log(chalk.bold(`⚡ 第${batchIndex}轮构建 (${batch.length} 个包)`))

      const batchResults = await Promise.all(
        batch.map(async (ws) => {
          const wsStart = Date.now()
          const config = getBuildConfig(ws)

          try {
            await config.hooks?.beforeBuild?.(config)
            const result = await buildLib(config)
            await config.hooks?.afterBuild?.(config)
            const duration = Date.now() - wsStart

            if (result.success) {
              console.log(
                `  ${chalk.green('✓')} ${chalk.cyan(ws.name)} ${chalk.dim(`${duration}ms`)}`
              )
            } else {
              console.log(`  ${chalk.red('✗')} ${chalk.red(ws.name)}`)
              if (result.error) console.error(result.error)
            }

            return { name: ws.name, success: result.success, duration, error: result.error }
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

    const successCount = results.filter((r) => r.success).length
    const failedCount = results.length - successCount

    const totalDuration = Date.now() - start
    console.log(
      chalk.bold(
        chalk.green(`✨ 构建完成: ${successCount} 成功, ${failedCount} 失败 ${totalDuration}ms`)
      )
    )

    // 如果有构建失败，抛出错误阻止后续流程
    if (failedCount > 0) {
      const failedNames = results
        .filter((r) => !r.success)
        .map((r) => r.name)
        .join(', ')
      throw new Error(`构建失败: ${failedNames}`)
    }
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
    const packages = this.#workspaces.map((ws) => ({ dir: ws.dir }))

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
   * 批量发布包
   *
   * 使用 npm 原生的 --workspace 参数发布指定工作区。
   * npm 会自动处理发布顺序和依赖关系。
   *
   * 自动处理 `workspace:` 和 `catalog:` 协议，类似 pnpm 和 bun 的行为。
   * 协议解析仅在发布时临时进行，不会修改源代码中的版本号。
   *
   * @param options - 发布选项
   * @throws {PublishError} 当发布失败时
   */
  async publish(options: GroupPublishOptions = {}): Promise<void> {
    const { skipPrivate = true, ...publishOptions } = options

    // 过滤需要发布的包
    const toPublish = this.#workspaces.filter((ws) => {
      if (skipPrivate && ws.private) {
        console.log(chalk.dim(`  跳过私有包: ${ws.name}`))
        return false
      }
      return true
    })

    if (toPublish.length === 0) {
      console.log(chalk.yellow('没有需要发布的包'))
      return
    }

    // 自动检测预发布版本并设置 tag
    // 假设同一个 group 的包版本号一致
    let tag = publishOptions.tag
    if (!tag) {
      const firstVersion = toPublish[0]?.version
      if (firstVersion) {
        const prereleaseMatch = firstVersion.match(/-([a-zA-Z]+)/)
        if (prereleaseMatch) {
          tag = prereleaseMatch[1]
          console.log(chalk.dim(`  检测到预发布版本，自动设置 tag: ${tag}`))
        }
      }
    }

    console.log(chalk.blue(`📦 准备发布 ${toPublish.length} 个包:`))
    for (const ws of toPublish) {
      console.log(chalk.dim(`  - ${ws.name}@${ws.version}`))
    }

    // 构建协议解析选项
    // 使用所有工作区信息（不仅仅是待发布的）以便正确解析 workspace 协议
    const allWorkspaces = this.#repo.workspaces.map((ws) => ({
      name: ws.name,
      version: ws.version
    }))

    // 使用 npm 原生的 --workspace 参数批量发布
    await publishPackage({
      cwd: this.#repo.root.dir,
      workspace: toPublish.map((ws) => ws.name),
      ...publishOptions,
      tag,
      // 自动传递协议解析选项
      resolveProtocol: { workspaces: allWorkspaces },
      resolveProtocolDirs: toPublish.map((ws) => ws.dir)
    })

    console.log(chalk.green(`✓ 发布完成`))
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
      this.#root = { dir: this.#rootDir, pkg, workspacePatterns: pkg.workspaces || [] }
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
    const packages = workspaces.map((ws) => ({ name: ws.name, version: ws.version, pkg: ws.pkg }))

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
  buildDependencyGraph(
    options: {
      /** 是否包含外部依赖 */
      includeExternal?: boolean
    } = {}
  ): DependencyGraphResult {
    const { includeExternal = false } = options
    const workspaces = this.workspaces

    // 转换为 deps 模块需要的格式
    const packages = workspaces.map((ws) => ({ name: ws.name, version: ws.version, pkg: ws.pkg }))

    // 使用 deps 模块构建依赖图
    const graph = buildDepGraph(packages)

    // 根据选项过滤节点
    const nodes = includeExternal ? graph.nodes : graph.nodes.filter((n) => !n.external)

    const edges = includeExternal
      ? graph.edges
      : graph.edges.filter((edge) => {
          const targetNode = graph.nodes.find((n) => n.id === edge.to)
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
