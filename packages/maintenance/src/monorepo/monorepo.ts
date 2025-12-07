import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { join, resolve, sep, isAbsolute } from 'node:path'
import chalk from 'chalk'

import type {
  MonorepoWorkspace,
  WorkspaceBuildConfig,
  GroupBuildOptions,
  GroupBumpOptions,
  GroupPublishOptions,
  BuildSummary,
  MonorepoValidationResult,
  DependencyGraphResult
} from './types'
import type { PackageJson } from '../types'
import type { BumpResult } from '../version/types'

import { buildLib } from '../build'
import { bumpVersion, syncPeerDependencies, syncDependencies } from '../version'
import { publishPackage } from '../release'

/**
 * 同步读取 JSON 文件
 */
function readJsonSync<T>(filePath: string): T {
  const content = readFileSync(filePath, 'utf-8')
  return JSON.parse(content) as T
}

/**
 * 简单的同步 glob 匹配（支持 * 通配符）
 */
function matchGlobSync(pattern: string, cwd: string): string[] {
  const normalizedPattern = pattern.replace(/\//g, sep)
  const parts = normalizedPattern.split(sep).filter(p => p.length > 0)
  const results: string[] = []

  function match(currentPath: string, patternParts: string[], depth: number): void {
    if (patternParts.length === 0) {
      const fullPath = join(cwd, currentPath)
      if (existsSync(join(fullPath, 'package.json'))) {
        results.push(currentPath)
      }
      return
    }

    const [currentPattern, ...remainingParts] = patternParts
    const fullCurrentPath = currentPath ? join(cwd, currentPath) : cwd

    if (!existsSync(fullCurrentPath)) return

    if (currentPattern === '*') {
      // 匹配所有目录
      const entries = readdirSync(fullCurrentPath, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          const nextPath = currentPath ? join(currentPath, entry.name) : entry.name
          match(nextPath, remainingParts, depth + 1)
        }
      }
    } else if (currentPattern) {
      // 精确匹配
      const nextPath = currentPath ? join(currentPath, currentPattern) : currentPattern
      const nextFullPath = join(cwd, nextPath)
      if (existsSync(nextFullPath) && statSync(nextFullPath).isDirectory()) {
        match(nextPath, remainingParts, depth + 1)
      }
    }
  }

  match('', parts, 0)
  return results
}

/**
 * 获取同时在 peerDependencies 和 devDependencies 中的依赖作为 external
 */
function getPeerDevExternal(pkg: PackageJson): string[] {
  const peerDeps = pkg.peerDependencies || {}
  const devDeps = pkg.devDependencies || {}
  const devDepsSet = new Set(Object.keys(devDeps))

  return Object.keys(peerDeps).filter(dep =>
    devDepsSet.has(dep) && devDeps[dep]?.startsWith('workspace:')
  )
}

/**
 * 工作区分组类
 *
 * 用于对一组工作区进行批量操作
 */
class WorkspaceGroup<Workspaces extends readonly string[]> {
  #workspaces: MonorepoWorkspace[]

  constructor(repo: Monorepo, workspaceNames: Workspaces) {
    // 过滤出匹配的工作区
    const nameSet = new Set(workspaceNames)
    this.#workspaces = repo.workspaces.filter(ws => nameSet.has(ws.name))
  }

  /**
   * 获取工作区列表
   */
  get workspaces(): MonorepoWorkspace[] {
    return this.#workspaces
  }

  /**
   * 构建工作区
   *
   * 按依赖关系分批并行构建
   */
  async build(
    configs: { [K in Workspaces[number]]?: WorkspaceBuildConfig },
    options: GroupBuildOptions = {}
  ): Promise<BuildSummary> {
    const { parallel = true } = options
    const start = Date.now()

    // 构建内部包名称集合
    const internalNames = new Set(this.#workspaces.map(ws => ws.name))

    // 构建依赖映射：包名 -> 依赖的内部包名列表
    const depsMap = new Map<string, string[]>()
    for (const ws of this.#workspaces) {
      const allDeps = {
        ...(ws.pkg.dependencies || {}),
        ...(ws.pkg.devDependencies || {}),
        ...(ws.pkg.peerDependencies || {})
      }
      const internalDeps = Object.keys(allDeps).filter(dep => internalNames.has(dep))
      depsMap.set(ws.name, internalDeps)
    }

    // 分批构建（拓扑排序）
    const built = new Set<string>()
    const results: BuildSummary['results'] = []
    let batchIndex = 1

    while (built.size < this.#workspaces.length) {
      // 找出可以构建的包（依赖已全部构建）
      const batch = this.#workspaces.filter(ws =>
        !built.has(ws.name) &&
        (depsMap.get(ws.name) || []).every(dep => built.has(dep))
      )

      if (batch.length === 0) {
        // 存在循环依赖，无法继续
        throw new Error('检测到循环依赖，无法完成构建')
      }

      console.log(chalk.bold(`⚡ 第${batchIndex}轮构建 (${batch.length} 个包)`))

      // 构建本批次
      const batchResults = parallel
        ? await Promise.all(batch.map(ws => this.#buildWorkspace(ws, configs[ws.name as Workspaces[number]])))
        : await this.#buildSequential(batch, configs)

      results.push(...batchResults)
      batch.forEach(ws => built.add(ws.name))
      batchIndex++
    }

    const successCount = results.filter(r => r.success).length
    const failedCount = results.length - successCount

    console.log(chalk.bold(chalk.green(`✨ 构建完成: ${successCount} 成功, ${failedCount} 失败`)))

    return {
      totalDuration: Date.now() - start,
      successCount,
      failedCount,
      results
    }
  }

  async #buildSequential(
    workspaces: MonorepoWorkspace[],
    configs: { [K in Workspaces[number]]?: WorkspaceBuildConfig }
  ): Promise<BuildSummary['results']> {
    const results: BuildSummary['results'] = []
    for (const ws of workspaces) {
      const result = await this.#buildWorkspace(ws, configs[ws.name as Workspaces[number]])
      results.push(result)
    }
    return results
  }

  async #buildWorkspace(
    ws: MonorepoWorkspace,
    config?: WorkspaceBuildConfig
  ): Promise<BuildSummary['results'][number]> {
    const start = Date.now()

    // 合并 external
    const autoExternal = getPeerDevExternal(ws.pkg)
    const external = [...new Set([...(config?.external || []), ...autoExternal])]

    try {
      const result = await buildLib({
        dir: ws.dir,
        entry: config?.entry,
        dts: config?.dts,
        external: external.length > 0 ? external : undefined,
        platform: config?.platform,
        output: config?.output
      })

      const duration = Date.now() - start
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
      const duration = Date.now() - start
      console.log(`  ${chalk.red('✗')} ${chalk.red(ws.name)}`)
      console.error(err)

      return {
        name: ws.name,
        success: false,
        duration,
        error: err instanceof Error ? err : new Error(String(err))
      }
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
  #workspaces: MonorepoWorkspace[] | null = null

  constructor(rootDir?: string) {
    const dir = rootDir || process.cwd()

    if (!isAbsolute(dir)) {
      throw new Error('rootDir 必须是绝对路径')
    }

    this.#rootDir = dir
  }

  /**
   * 根目录
   */
  get rootDir(): string {
    return this.#rootDir
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

    const workspaces: MonorepoWorkspace[] = []

    for (const pattern of workspacePatterns) {
      const dirs = matchGlobSync(pattern, this.#rootDir)

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
    }

    return workspaces
  }

  /**
   * 按工作区名称分组
   */
  group<T extends readonly string[]>(names: T): WorkspaceGroup<T> {
    return new WorkspaceGroup(this, names)
  }

  /**
   * 验证 monorepo 的有效性
   *
   * - 检测循环依赖
   * - 检测版本不一致
   */
  isValid(): MonorepoValidationResult {
    const workspaces = this.workspaces
    const internalNames = new Set(workspaces.map(ws => ws.name))

    // 构建依赖图
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

    // 检测循环依赖（DFS）
    const circularChains: string[][] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    function dfs(node: string): void {
      visited.add(node)
      recursionStack.add(node)
      path.push(node)

      for (const neighbor of depsMap.get(node) || []) {
        if (!visited.has(neighbor)) {
          dfs(neighbor)
        } else if (recursionStack.has(neighbor)) {
          // 找到循环
          const cycleStart = path.indexOf(neighbor)
          circularChains.push([...path.slice(cycleStart), neighbor])
        }
      }

      path.pop()
      recursionStack.delete(node)
    }

    for (const ws of workspaces) {
      if (!visited.has(ws.name)) {
        dfs(ws.name)
      }
    }

    // 检测版本不一致
    const versionMap = new Map<string, Map<string, string[]>>()

    for (const ws of workspaces) {
      const allDeps = {
        ...(ws.pkg.dependencies || {}),
        ...(ws.pkg.devDependencies || {})
      }

      for (const [depName, version] of Object.entries(allDeps)) {
        if (typeof version !== 'string' || version.startsWith('workspace:')) continue

        if (!versionMap.has(depName)) {
          versionMap.set(depName, new Map())
        }

        const versions = versionMap.get(depName)!
        if (!versions.has(version)) {
          versions.set(version, [])
        }
        versions.get(version)!.push(ws.name)
      }
    }

    const inconsistentDeps: MonorepoValidationResult['inconsistentDeps'] = []
    for (const [depName, versions] of versionMap) {
      if (versions.size > 1) {
        inconsistentDeps.push({
          name: depName,
          versions: Array.from(versions.entries()).map(([version, usedBy]) => ({
            version,
            usedBy
          }))
        })
      }
    }

    return {
      valid: circularChains.length === 0 && inconsistentDeps.length === 0,
      hasCircular: circularChains.length > 0,
      circularChains,
      inconsistentDeps
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
    const internalNames = new Set(workspaces.map(ws => ws.name))

    const nodes: DependencyGraphResult['nodes'] = []
    const edges: DependencyGraphResult['edges'] = []
    const externalDeps = new Set<string>()

    // 添加内部包节点
    for (const ws of workspaces) {
      nodes.push({
        id: ws.name,
        version: ws.version,
        external: false
      })

      const allDeps = {
        ...(ws.pkg.dependencies || {}),
        ...(ws.pkg.devDependencies || {}),
        ...(ws.pkg.peerDependencies || {})
      }

      for (const depName of Object.keys(allDeps)) {
        if (internalNames.has(depName)) {
          // 内部依赖
          let type: 'dependencies' | 'devDependencies' | 'peerDependencies' = 'dependencies'
          if (ws.pkg.peerDependencies?.[depName]) type = 'peerDependencies'
          else if (ws.pkg.devDependencies?.[depName]) type = 'devDependencies'

          edges.push({ from: ws.name, to: depName, type })
        } else if (includeExternal) {
          externalDeps.add(depName)
        }
      }
    }

    // 添加外部依赖节点
    if (includeExternal) {
      for (const depName of externalDeps) {
        nodes.push({
          id: depName,
          version: '*',
          external: true
        })
      }
    }

    // 生成 Mermaid 图
    let mermaid = 'graph TD\n'
    for (const edge of edges) {
      const from = edge.from.replace(/@/g, '')
      const to = edge.to.replace(/@/g, '')
      let arrow = '-->'
      if (edge.type === 'peerDependencies') arrow = '-..->'
      else if (edge.type === 'devDependencies') arrow = '--->'
      mermaid += `  ${from}${arrow}${to}\n`
    }

    return { nodes, edges, mermaid }
  }
}
