import { writeJson, readJson } from '../utils'
import { join } from 'node:path'
import type { PackageJson } from '../types'
import type { PackageVersionConfig } from './types'

/**
 * 同步 peerDependencies 中的版本约束
 *
 * 此函数复用了 build/release.ts 中的 peerDependencies 同步逻辑
 * 它会遍历指定包，将 peerDependencies 中的内部包版本更新为 >=version
 *
 * @param packages - 包配置列表
 * @param version - 目标版本号
 * @param options - 同步选项
 *
 * @example
 * ```ts
 * import { syncPeerDependencies } from '@cat-kit/maintenance'
 * import { resolve } from 'node:path'
 *
 * const packages = [
 *   { dir: resolve(process.cwd(), 'packages/core') },
 *   { dir: resolve(process.cwd(), 'packages/fe') }
 * ]
 *
 * // 将包的 peerDependencies 中的内部包版本更新为 >=1.2.3
 * await syncPeerDependencies(packages, '1.2.3')
 *
 * // 只同步特定的包
 * await syncPeerDependencies(packages, '1.2.3', {
 *   only: ['@cat-kit/core', '@cat-kit/fe']
 * })
 * ```
 */
export async function syncPeerDependencies(
  packages: PackageVersionConfig[],
  version: string,
  options: {
    /** 只同步指定的包名（不指定则同步所有 peerDependencies） */
    only?: string[]
  } = {}
): Promise<void> {
  const { only } = options

  // 构建内部包名称集合（用于快速查找）
  const packageNames = new Set<string>()
  for (const pkgConfig of packages) {
    const packageJsonPath = join(pkgConfig.dir, 'package.json')
    const packageJson = await readJson<PackageJson>(packageJsonPath)
    if (packageJson.name) {
      packageNames.add(packageJson.name)
    }
  }

  // 遍历所有包，更新 peerDependencies
  for (const pkgConfig of packages) {
    const packageJsonPath = join(pkgConfig.dir, 'package.json')
    const packageJson = await readJson<PackageJson>(packageJsonPath)
    let modified = false

    // 检查是否有 peerDependencies 需要更新
    if (packageJson.peerDependencies) {
      for (const dep of Object.keys(packageJson.peerDependencies)) {
        // 只更新内部包
        const shouldSync = packageNames.has(dep) && (!only || only.includes(dep))

        if (shouldSync) {
          packageJson.peerDependencies[dep] = `>=${version}`
          modified = true
        }
      }
    }

    // 如果有修改，写回文件
    if (modified) {
      await writeJson(packageJsonPath, packageJson, {
        space: 2,
        eol: '\n'
      })
    }
  }
}

/**
 * 同步 dependencies 中的工作空间版本约束
 *
 * 将 dependencies 中使用 workspace:* 的包替换为具体版本号
 *
 * @param packages - 包配置列表
 * @param version - 目标版本号
 * @param options - 同步选项
 *
 * @example
 * ```ts
 * import { syncDependencies } from '@cat-kit/maintenance'
 * import { resolve } from 'node:path'
 *
 * const packages = [
 *   { dir: resolve(process.cwd(), 'packages/core') },
 *   { dir: resolve(process.cwd(), 'packages/fe') }
 * ]
 *
 * // 将 workspace:* 替换为 ^1.2.3
 * await syncDependencies(packages, '1.2.3')
 * ```
 */
export async function syncDependencies(
  packages: PackageVersionConfig[],
  version: string,
  options: {
    /** 只同步指定的包名 */
    only?: string[]
  } = {}
): Promise<void> {
  const { only } = options

  // 构建内部包名称集合
  const packageNames = new Set<string>()
  for (const pkgConfig of packages) {
    const packageJsonPath = join(pkgConfig.dir, 'package.json')
    const packageJson = await readJson<PackageJson>(packageJsonPath)
    if (packageJson.name) {
      packageNames.add(packageJson.name)
    }
  }

  for (const pkgConfig of packages) {
    const packageJsonPath = join(pkgConfig.dir, 'package.json')
    const packageJson = await readJson<PackageJson>(packageJsonPath)
    let modified = false

    // 更新 dependencies
    if (packageJson.dependencies) {
      for (const [dep, currentVersion] of Object.entries(
        packageJson.dependencies
      )) {
        if (
          typeof currentVersion === 'string' &&
          packageNames.has(dep) &&
          currentVersion.startsWith('workspace:')
        ) {
          const shouldSync = !only || only.includes(dep)
          if (shouldSync) {
            packageJson.dependencies[dep] = `^${version}`
            modified = true
          }
        }
      }
    }

    if (modified) {
      await writeJson(packageJsonPath, packageJson, {
        space: 2,
        eol: '\n'
      })
    }
  }
}
