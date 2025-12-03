import type { MonorepoConfig, PackageJson } from '../types'
import type { DependencyGraph, DependencyNode, DependencyEdge } from './types'
import { loadPackages } from '../utils'

/**
 * 获取依赖类型
 * @param packageJson - package.json 对象
 * @param depName - 依赖名称
 * @returns 依赖类型
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
  return 'dependencies' // 默认
}

/**
 * 构建依赖关系图
 *
 * 此函数复用了 build/repo.ts 的拓扑排序思路（L43-49），
 * 构建包含所有内部和外部依赖的完整依赖图
 *
 * @param config - Monorepo 配置
 * @returns 依赖关系图
 *
 * @example
 * ```ts
 * const graph = await buildDependencyGraph(config)
 * console.log(`包含 ${graph.nodes.length} 个节点和 ${graph.edges.length} 条边`)
 * ```
 */
export async function buildDependencyGraph(
  config: MonorepoConfig
): Promise<DependencyGraph> {
  const packages = await loadPackages(config)

  const nodes: DependencyNode[] = []
  const edges: DependencyEdge[] = []
  const externalDeps = new Set<string>()
  const internalPackageNames = new Set(packages.map(pkg => pkg.name))

  // 构建内部包节点
  for (const pkg of packages) {
    nodes.push({
      id: pkg.name,
      version: pkg.version,
      external: false
    })

    // 收集所有依赖
    const allDeps = {
      ...(pkg.packageJson.dependencies || {}),
      ...(pkg.packageJson.devDependencies || {}),
      ...(pkg.packageJson.peerDependencies || {})
    }

    for (const depName of Object.keys(allDeps)) {
      // 如果是内部依赖，添加边
      if (internalPackageNames.has(depName)) {
        edges.push({
          from: pkg.name,
          to: depName,
          type: getDependencyType(pkg.packageJson, depName)
        })
      } else {
        // 记录外部依赖
        externalDeps.add(depName)
      }
    }
  }

  // 添加外部依赖节点
  for (const depName of externalDeps) {
    nodes.push({
      id: depName,
      version: '*', // 外部依赖版本未知
      external: true
    })

    // 为外部依赖添加边
    for (const pkg of packages) {
      const allDeps = {
        ...(pkg.packageJson.dependencies || {}),
        ...(pkg.packageJson.devDependencies || {}),
        ...(pkg.packageJson.peerDependencies || {})
      }

      if (allDeps[depName]) {
        edges.push({
          from: pkg.name,
          to: depName,
          type: getDependencyType(pkg.packageJson, depName)
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
 * const graph = await buildDependencyGraph(config)
 * const mermaid = visualizeDependencyGraph(graph, { includeExternal: false })
 * console.log(mermaid)
 * // graph TD
 * //   @cat-kit/fe-->@cat-kit/core
 * //   @cat-kit/http-->@cat-kit/core
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

  // 过滤边
  const edges = includeExternal
    ? graph.edges
    : graph.edges.filter(edge => {
        const targetNode = graph.nodes.find(n => n.id === edge.to)
        return targetNode && !targetNode.external
      })

  // 生成边的表示
  for (const edge of edges) {
    let arrow = '-->'

    if (distinguishTypes) {
      switch (edge.type) {
        case 'peerDependencies':
          arrow = '-..->' // 虚线箭头表示 peer 依赖
          break
        case 'devDependencies':
          arrow = '--->' // 粗箭头表示 dev 依赖
          break
        default:
          arrow = '-->' // 实线箭头表示普通依赖
      }
    }

    // 转义特殊字符
    const from = edge.from.replace(/@/g, '')
    const to = edge.to.replace(/@/g, '')

    mermaid += `  ${from}${arrow}${to}\n`
  }

  return mermaid
}
