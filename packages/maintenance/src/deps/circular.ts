import type { CircularDependencyResult, CircularChain } from './types'
import type { MonorepoWorkspace } from '../monorepo/types'

/**
 * 构建依赖映射
 */
function buildDependencyMap(workspaces: MonorepoWorkspace[]): Map<string, string[]> {
  const graph = new Map<string, string[]>()
  const internalPackageNames = new Set(workspaces.map(ws => ws.name))

  for (const ws of workspaces) {
    const deps: string[] = []

    const allDeps = {
      ...(ws.pkg.dependencies || {}),
      ...(ws.pkg.devDependencies || {}),
      ...(ws.pkg.peerDependencies || {})
    }

    for (const depName of Object.keys(allDeps)) {
      if (internalPackageNames.has(depName)) {
        deps.push(depName)
      }
    }

    graph.set(ws.name, deps)
  }

  return graph
}

/**
 * 检测循环依赖
 *
 * 使用 Tarjan 算法查找强连通分量（Strongly Connected Components）
 *
 * @param workspaces - 工作区列表
 * @returns 循环依赖检查结果
 *
 * @example
 * ```ts
 * import { Monorepo, checkCircularDependencies } from '@cat-kit/maintenance'
 *
 * const repo = new Monorepo()
 * const result = checkCircularDependencies(repo.workspaces)
 * if (result.hasCircular) {
 *   console.log('发现循环依赖:')
 *   result.cycles.forEach(cycle => {
 *     console.log(cycle.chain.join(' -> '))
 *   })
 * }
 * ```
 */
export function checkCircularDependencies(
  workspaces: MonorepoWorkspace[]
): CircularDependencyResult {
  const graph = buildDependencyMap(workspaces)

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
