import type { ConsistencyResult, InconsistentDependency } from './types'
import type { MonorepoWorkspace } from '../monorepo/types'

/**
 * 检查版本一致性
 *
 * 检测 monorepo 中相同依赖是否使用了不同的版本
 *
 * @param workspaces - 工作区列表
 * @param options - 可选配置
 * @returns 一致性检查结果
 *
 * @example
 * ```ts
 * import { Monorepo, checkVersionConsistency } from '@cat-kit/maintenance'
 *
 * const repo = new Monorepo()
 * const result = checkVersionConsistency(repo.workspaces)
 * if (!result.consistent) {
 *   console.log('发现版本不一致:')
 *   result.inconsistent.forEach(dep => {
 *     console.log(`${dep.name}:`)
 *     dep.versions.forEach(v => {
 *       console.log(`  ${v.version} 被 ${v.usedBy.join(', ')} 使用`)
 *     })
 *   })
 * }
 * ```
 */
export function checkVersionConsistency(
  workspaces: MonorepoWorkspace[],
  options: {
    /** 忽略的依赖包（不检查版本一致性） */
    ignore?: string[]
  } = {}
): ConsistencyResult {
  const { ignore = [] } = options

  const dependencyVersions = new Map<
    string,
    Map<string, string[]>
  >()

  for (const ws of workspaces) {
    const allDeps = {
      ...ws.pkg.dependencies,
      ...ws.pkg.devDependencies
    }

    for (const [depName, version] of Object.entries(allDeps)) {
      if (ignore.includes(depName)) {
        continue
      }

      if (typeof version !== 'string') {
        continue
      }

      if (version.startsWith('workspace:')) {
        continue
      }

      if (!dependencyVersions.has(depName)) {
        dependencyVersions.set(depName, new Map())
      }

      const versionMap = dependencyVersions.get(depName)!
      if (!versionMap.has(version)) {
        versionMap.set(version, [])
      }

      versionMap.get(version)!.push(ws.name)
    }
  }

  const inconsistent: InconsistentDependency[] = []

  for (const [depName, versionMap] of dependencyVersions) {
    if (versionMap.size > 1) {
      const versions = Array.from(versionMap.entries()).map(([version, usedBy]) => ({
        version,
        usedBy
      }))

      inconsistent.push({
        name: depName,
        versions
      })
    }
  }

  return {
    consistent: inconsistent.length === 0,
    inconsistent
  }
}
