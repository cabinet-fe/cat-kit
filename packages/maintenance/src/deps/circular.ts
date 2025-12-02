import type { MonorepoConfig } from '../types'
import type { CircularDependencyResult, CircularChain } from './types'
import { loadPackages } from '../utils'

/**
 * 构建依赖映射
 */
function buildDependencyMap(packages: any[]): Map<string, string[]> {
  const graph = new Map<string, string[]>()

  for (const pkg of packages) {
    const deps: string[] = []

    // 只关心内部依赖（workspace 包）
    const allDeps = {
      ...pkg.packageJson.dependencies,
      ...pkg.packageJson.devDependencies,
      ...pkg.packageJson.peerDependencies
    }

    const internalPackageNames = new Set(packages.map(p => p.name))

    for (const depName of Object.keys(allDeps)) {
      if (internalPackageNames.has(depName)) {
        deps.push(depName)
      }
    }

    graph.set(pkg.name, deps)
  }

  return graph
}

/**
 * 检测循环依赖
 *
 * 使用 Tarjan 算法查找强连通分量（Strongly Connected Components）
 * 时间复杂度：O(V + E)，其中 V 是节点数，E 是边数
 *
 * @param config - Monorepo 配置
 * @returns 循环依赖检查结果
 *
 * @example
 * ```ts
 * const result = await checkCircularDependencies(config)
 * if (result.hasCircular) {
 *   console.log('发现循环依赖:')
 *   result.cycles.forEach(cycle => {
 *     console.log(cycle.chain.join(' -> '))
 *   })
 * }
 * ```
 */
export async function checkCircularDependencies(
  config: MonorepoConfig
): Promise<CircularDependencyResult> {
  const packages = await loadPackages(config)
  const graph = buildDependencyMap(packages)

  // Tarjan 算法状态
  let index = 0
  const stack: string[] = []
  const indices = new Map<string, number>()
  const lowlinks = new Map<string, number>()
  const onStack = new Set<string>()
  const cycles: CircularChain[] = []

  /**
   * Tarjan 算法核心递归函数
   */
  function strongConnect(node: string) {
    // 设置节点的索引和 lowlink
    indices.set(node, index)
    lowlinks.set(node, index)
    index++
    stack.push(node)
    onStack.add(node)

    // 遍历邻居节点
    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      if (!indices.has(neighbor)) {
        // 邻居未访问过，递归访问
        strongConnect(neighbor)
        lowlinks.set(node, Math.min(lowlinks.get(node)!, lowlinks.get(neighbor)!))
      } else if (onStack.has(neighbor)) {
        // 邻居在栈中，说明存在回边
        lowlinks.set(node, Math.min(lowlinks.get(node)!, indices.get(neighbor)!))
      }
    }

    // 如果 node 是强连通分量的根节点
    if (lowlinks.get(node) === indices.get(node)) {
      const component: string[] = []
      let w: string

      // 弹出栈，直到当前节点
      do {
        w = stack.pop()!
        onStack.delete(w)
        component.push(w)
      } while (w !== node)

      // 如果强连通分量大小 > 1，说明存在循环依赖
      if (component.length > 1) {
        cycles.push({
          chain: component.reverse(),
          startIndex: 0
        })
      }
    }
  }

  // 遍历所有节点
  for (const node of graph.keys()) {
    if (!indices.has(node)) {
      strongConnect(node)
    }
  }

  return {
    hasCircular: cycles.length > 0,
    cycles
  }
}
