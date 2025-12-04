import { writeJson, readJson } from '@cat-kit/be'
import { join } from 'node:path'
import type { PackageJson } from '../types'
import type { BumpOptions, BumpResult, PackageVersionConfig } from './types'
import { incrementVersion, isValidSemver } from './semver'
import { SemverError, ConfigError } from '../errors'
import { syncPeerDependencies } from './sync'

/**
 * 批量更新包版本号
 *
 * 此函数复用了 build/release.ts 中的版本更新逻辑，支持：
 * - 批量更新指定包的版本号
 * - 可选同步 peerDependencies 中的版本约束
 * - 支持多种版本递增类型（major/minor/patch/prerelease 等）
 *
 * @param packages - 包配置列表
 * @param options - 版本更新选项
 * @returns 版本更新结果
 * @throws {SemverError} 当版本号格式无效时
 * @throws {ConfigError} 当包配置无效时
 *
 * @example
 * ```ts
 * import { bumpVersion } from '@cat-kit/maintenance'
 * import { resolve } from 'node:path'
 *
 * // 递增多个包的 minor 版本号
 * const packages = [
 *   { dir: resolve(process.cwd(), 'packages/core') },
 *   { dir: resolve(process.cwd(), 'packages/fe') }
 * ]
 *
 * const result = await bumpVersion(packages, {
 *   type: 'minor',
 *   syncPeer: true
 * })
 *
 * console.log(`更新到版本: ${result.version}`)
 * result.updated.forEach(pkg => {
 *   console.log(`${pkg.name}: ${pkg.oldVersion} → ${pkg.newVersion}`)
 * })
 *
 * // 设置特定版本号
 * const result = await bumpVersion(packages, {
 *   type: 'patch',
 *   version: '1.2.3'
 * })
 *
 * // 创建预发布版本
 * const result = await bumpVersion(packages, {
 *   type: 'prerelease',
 *   preid: 'alpha'
 * })
 * ```
 */
export async function bumpVersion(
  packages: PackageVersionConfig[],
  options: BumpOptions
): Promise<BumpResult> {
  const { type, version: targetVersion, preid, syncPeer = false } = options

  if (packages.length === 0) {
    throw new ConfigError('包列表不能为空')
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
    const firstPkgPath = join(packages[0]!.dir, 'package.json')
    const firstPkg = await readJson<PackageJson>(firstPkgPath)
    const currentVersion = firstPkg.version || '0.0.0'
    newVersion = incrementVersion(currentVersion, type, preid)
  }

  const updated: BumpResult['updated'] = []

  // 更新每个包的 version 字段
  for (const pkgConfig of packages) {
    const packageJsonPath = join(pkgConfig.dir, 'package.json')
    const packageJson = await readJson<PackageJson>(packageJsonPath)

    if (!packageJson.name) {
      throw new ConfigError(
        `package.json 缺少 name 字段`,
        packageJsonPath
      )
    }

    const oldVersion = packageJson.version || '0.0.0'

    // 更新 version 字段
    packageJson.version = newVersion

    // 写回文件
    await writeJson(packageJsonPath, packageJson, { space: 2, eol: '\n' })

    updated.push({
      name: packageJson.name,
      oldVersion,
      newVersion
    })
  }

  // 同步 peerDependencies
  if (syncPeer) {
    await syncPeerDependencies(packages, newVersion)
  }

  return {
    version: newVersion,
    updated
  }
}
