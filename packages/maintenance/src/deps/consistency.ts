import type { MonorepoConfig } from '../types'
import type { ConsistencyResult, InconsistentDependency } from './types'
import { loadPackages } from '../utils'

/**
 * 检查版本一致性
 *
 * 检测 monorepo 中相同依赖是否使用了不同的版本，
 * 这有助于发现潜在的版本冲突问题
 *
 * @param config - Monorepo 配置
 * @param options - 可选配置
 * @returns 一致性检查结果
 *
 * @example
 * ```ts
 * const result = await checkVersionConsistency(config)
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
export async function checkVersionConsistency(
  config: MonorepoConfig,
  options: {
    /** 忽略的依赖包（不检查版本一致性） */
    ignore?: string[]
  } = {}
): Promise<ConsistencyResult> {
  const { ignore = [] } = options
  const packages = await loadPackages(config)

  // 收集所有依赖及其版本
  const dependencyVersions = new Map<
    string,
    Map<string, string[]>
  >()

  for (const pkg of packages) {
    const allDeps = {
      ...pkg.packageJson.dependencies,
      ...pkg.packageJson.devDependencies
      // 注意：peerDependencies 通常使用版本范围，不参与一致性检查
    }

    for (const [depName, version] of Object.entries(allDeps)) {
      // 跳过忽略的依赖
      if (ignore.includes(depName)) {
        continue
      }

      // 确保 version 是字符串
      if (typeof version !== 'string') {
        continue
      }

      // 跳过 workspace 依赖
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

      versionMap.get(version)!.push(pkg.name)
    }
  }

  // 检测不一致的依赖
  const inconsistent: InconsistentDependency[] = []

  for (const [depName, versionMap] of dependencyVersions) {
    // 如果一个依赖有多个不同版本，说明不一致
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
