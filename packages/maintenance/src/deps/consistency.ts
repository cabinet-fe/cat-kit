import type { PackageInfo, ConsistencyResult, InconsistentDependency } from './types'

/**
 * 检查版本一致性
 *
 * 检测多个包中相同依赖是否使用了不同的版本
 *
 * @param packages - 包列表，每个包需要包含 name 和 pkg（package.json 内容）
 * @param options - 可选配置
 * @returns 一致性检查结果
 *
 * @example
 * ```ts
 * import { checkVersionConsistency } from '@cat-kit/maintenance'
 *
 * const packages = [
 *   { name: '@my/core', pkg: corePackageJson },
 *   { name: '@my/utils', pkg: utilsPackageJson }
 * ]
 *
 * const result = checkVersionConsistency(packages)
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
  packages: PackageInfo[],
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

  for (const p of packages) {
    const allDeps = {
      ...p.pkg.dependencies,
      ...p.pkg.devDependencies
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

      versionMap.get(version)!.push(p.name)
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
