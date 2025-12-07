import type { PackageJson } from '../types'
import type { DependencyGraph, DependencyNode, DependencyEdge } from './types'
import type { MonorepoWorkspace } from '../monorepo/types'

/**
 * 获取依赖类型
 */
function getDependencyType(
  packageJson: PackageJson,
  depName: string
): 'dependencies' | 'devDependencies' | 'peerDependencies' {
  if (packageJson.dependencies?.[depName]) {
    return 'dependencies'
  }
  if (packageJson.devDependencies?.[depName]) {
    return 'devDependencies'
  }
  if (packageJson.peerDependencies?.[depName]) {
    return 'peerDependencies'
  }
  return 'dependencies'
}

/**
 * 构建依赖关系图
 *
 * @param workspaces - 工作区列表
 * @returns 依赖关系图
 *
 * @example
 * ```ts
 * import { Monorepo, buildDependencyGraph } from '@cat-kit/maintenance'
 *
 * const repo = new Monorepo()
 * const graph = buildDependencyGraph(repo.workspaces)
 * console.log(`包含 ${graph.nodes.length} 个节点和 ${graph.edges.length} 条边`)
 * ```
 */
export function buildDependencyGraph(
  workspaces: MonorepoWorkspace[]
): DependencyGraph {
  const nodes: DependencyNode[] = []
  const edges: DependencyEdge[] = []
  const externalDeps = new Set<string>()
  const internalPackageNames = new Set(workspaces.map(ws => ws.name))

  // 构建内部包节点
  for (const ws of workspaces) {
    nodes.push({
      id: ws.name,
      version: ws.version,
      external: false
    })

    // 收集所有依赖
    const allDeps = {
      ...(ws.pkg.dependencies || {}),
      ...(ws.pkg.devDependencies || {}),
      ...(ws.pkg.peerDependencies || {})
    }

    for (const depName of Object.keys(allDeps)) {
      if (internalPackageNames.has(depName)) {
        edges.push({
          from: ws.name,
          to: depName,
          type: getDependencyType(ws.pkg, depName)
        })
      } else {
        externalDeps.add(depName)
      }
    }
  }

  // 添加外部依赖节点
  for (const depName of externalDeps) {
    nodes.push({
      id: depName,
      version: '*',
      external: true
    })

    for (const ws of workspaces) {
      const allDeps = {
        ...(ws.pkg.dependencies || {}),
        ...(ws.pkg.devDependencies || {}),
        ...(ws.pkg.peerDependencies || {})
      }

      if (allDeps[depName]) {
        edges.push({
          from: ws.name,
          to: depName,
          type: getDependencyType(ws.pkg, depName)
        })
      }
    }
  }

  return { nodes, edges }
}

/**
 * 可视化依赖关系图（生成 Mermaid 格式）
 *
 * @param graph - 依赖关系图
 * @param options - 可选配置
 * @returns Mermaid 格式的图表字符串
 *
 * @example
 * ```ts
 * const graph = buildDependencyGraph(workspaces)
 * const mermaid = visualizeDependencyGraph(graph, { includeExternal: false })
 * console.log(mermaid)
 * // graph TD
 * //   cat-kit/fe-->cat-kit/core
 * ```
 */
export function visualizeDependencyGraph(
  graph: DependencyGraph,
  options: {
    /** 是否包含外部依赖（默认 false） */
    includeExternal?: boolean
    /** 是否区分依赖类型（默认 true） */
    distinguishTypes?: boolean
  } = {}
): string {
  const { includeExternal = false, distinguishTypes = true } = options

  let mermaid = 'graph TD\n'

  const edges = includeExternal
    ? graph.edges
    : graph.edges.filter(edge => {
      const targetNode = graph.nodes.find(n => n.id === edge.to)
      return targetNode && !targetNode.external
    })

  for (const edge of edges) {
    let arrow = '-->'

    if (distinguishTypes) {
      switch (edge.type) {
        case 'peerDependencies':
          arrow = '-..->'
          break
        case 'devDependencies':
          arrow = '--->'
          break
        default:
          arrow = '-->'
      }
    }

    const from = edge.from.replace(/@/g, '')
    const to = edge.to.replace(/@/g, '')
    mermaid += `  ${from}${arrow}${to}\n`
  }

  return mermaid
}
