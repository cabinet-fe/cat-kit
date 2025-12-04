import { writeJson } from 'fs-extra'
import type { MonorepoConfig, PackageJson } from '../types'
import type { BumpOptions, BumpResult } from './types'
import { loadPackages, readJson } from '../utils'
import { incrementVersion, isValidSemver } from './semver'
import { SemverError } from '../errors'
import { syncPeerDependencies } from './sync'

/**
 * 批量更新包版本号
 *
 * 此函数复用了 build/release.ts 中的版本更新逻辑，支持：
 * - 批量更新所有或指定包的版本号
 * - 自动同步 peerDependencies 中的版本约束
 * - 支持多种版本递增类型（major/minor/patch/prerelease 等）
 *
 * @param config - Monorepo 配置
 * @param options - 版本更新选项
 * @returns 版本更新结果
 * @throws {SemverError} 当版本号格式无效时
 *
 * @example
 * ```ts
 * // 递增所有包的 minor 版本号
 * const result = await bumpVersion(config, {
 *   type: 'minor',
 *   syncPeer: true
 * })
 *
 * // 设置特定版本号
 * const result = await bumpVersion(config, {
 *   type: 'patch',
 *   version: '1.2.3',
 *   packages: ['@cat-kit/core']
 * })
 *
 * // 创建预发布版本
 * const result = await bumpVersion(config, {
 *   type: 'prerelease',
 *   preid: 'alpha'
 * })
 * ```
 */
export async function bumpVersion(
  config: MonorepoConfig,
  options: BumpOptions
): Promise<BumpResult> {
  const {
    type,
    version: targetVersion,
    preid,
    packages: targetPackages,
    syncPeer = true
  } = options

  // 加载所有包
  const allPackages = await loadPackages(config)

  // 过滤要更新的包
  const packagesToUpdate = targetPackages
    ? allPackages.filter(pkg => targetPackages.includes(pkg.name))
    : allPackages.filter(pkg => !pkg.private) // 默认不更新私有包

  if (packagesToUpdate.length === 0) {
    throw new SemverError('未找到要更新的包')
  }

  // 确定新版本号
  let newVersion: string

  if (targetVersion) {
    // 使用指定的版本号
    if (!isValidSemver(targetVersion)) {
      throw new SemverError(`无效的版本号: ${targetVersion}`, targetVersion)
    }
    newVersion = targetVersion
  } else {
    // 基于第一个包的当前版本号递增
    const firstPkg = packagesToUpdate[0]!
    newVersion = incrementVersion(firstPkg.version, type, preid)
  }

  const updated: BumpResult['updated'] = []

  // 更新每个包的 version 字段
  // 复用 build/release.ts 的逻辑（L43-57）
  for (const pkg of packagesToUpdate) {
    const packageJson = await readJson<PackageJson>(pkg.packageJsonPath)
    const oldVersion = packageJson.version || '0.0.0'

    // 更新 version 字段
    packageJson.version = newVersion

    // 写回文件
    await writeJson(pkg.packageJsonPath, packageJson, { spaces: 2, EOL: '\n' })

    updated.push({
      name: pkg.name,
      oldVersion,
      newVersion
    })
  }

  // 同步 peerDependencies
  if (syncPeer) {
    await syncPeerDependencies(config, newVersion)
  }

  return {
    version: newVersion,
    updated
  }
}
