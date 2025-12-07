import type { PackageInfo, CircularDependencyResult, CircularChain } from './types'

/**
 * 构建依赖映射
 */
function buildDependencyMap(packages: PackageInfo[]): Map<string, string[]> {
  const graph = new Map<string, string[]>()
  const internalPackageNames = new Set(packages.map(p => p.name))

  for (const p of packages) {
    const deps: string[] = []

    const allDeps = {
      ...(p.pkg.dependencies || {}),
      ...(p.pkg.devDependencies || {}),
      ...(p.pkg.peerDependencies || {})
    }

    for (const depName of Object.keys(allDeps)) {
      if (internalPackageNames.has(depName)) {
        deps.push(depName)
      }
    }

    graph.set(p.name, deps)
  }

  return graph
}

/**
 * 检测循环依赖
 *
 * 使用 Tarjan 算法查找强连通分量（Strongly Connected Components）
 *
 * @param packages - 包列表，每个包需要包含 name 和 pkg（package.json 内容）
 * @returns 循环依赖检查结果
 *
 * @example
 * ```ts
 * import { checkCircularDependencies } from '@cat-kit/maintenance'
 *
 * const packages = [
 *   { name: '@my/core', pkg: corePackageJson },
 *   { name: '@my/utils', pkg: utilsPackageJson }
 * ]
 *
 * const result = checkCircularDependencies(packages)
 * if (result.hasCircular) {
 *   console.log('发现循环依赖:')
 *   result.cycles.forEach(cycle => {
 *     console.log(cycle.chain.join(' -> '))
 *   })
 * }
 * ```
 */
export function checkCircularDependencies(
  packages: PackageInfo[]
): CircularDependencyResult {
  const graph = buildDependencyMap(packages)

  let index = 0
  const stack: string[] = []
  const indices = new Map<string, number>()
  const lowlinks = new Map<string, number>()
  const onStack = new Set<string>()
  const cycles: CircularChain[] = []

  function strongConnect(node: string) {
    indices.set(node, index)
    lowlinks.set(node, index)
    index++
    stack.push(node)
    onStack.add(node)

    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      const nodeLowlink = lowlinks.get(node)!
      if (!indices.has(neighbor)) {
        strongConnect(neighbor)
        const neighborLowlink = lowlinks.get(neighbor)!
        lowlinks.set(node, Math.min(nodeLowlink, neighborLowlink))
      } else if (onStack.has(neighbor)) {
        const neighborIndex = indices.get(neighbor)!
        lowlinks.set(node, Math.min(nodeLowlink, neighborIndex))
      }
    }

    if (lowlinks.get(node) === indices.get(node)) {
      const component: string[] = []
      let w: string

      do {
        const popped = stack.pop()
        if (!popped) break
        w = popped
        onStack.delete(w)
        component.push(w)
      } while (w !== node)

      if (component.length > 1) {
        cycles.push({
          chain: component.reverse(),
          startIndex: 0
        })
      }
    }
  }

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
