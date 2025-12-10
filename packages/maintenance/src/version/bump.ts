import { writeJson, readJson } from '../utils'
import { join, basename } from 'node:path'
import type { PackageJson } from '../types'
import type { BumpOptions, BumpResult, BumpType } from './types'
import { incrementVersion, isValidSemver, parseSemver } from './semver'
import { SemverError, ConfigError } from '../errors'

/**
 * 解析包路径
 * @param pkgPath - package.json 的路径或包含 package.json 的目录
 * @returns package.json 的绝对路径
 */
function resolvePackageJsonPath(pkgPath: string): string {
  // 如果路径以 package.json 结尾，直接返回
  if (basename(pkgPath) === 'package.json') {
    return pkgPath
  }
  // 否则假设是目录，拼接 package.json
  return join(pkgPath, 'package.json')
}

/**
 * 根据当前版本号智能推断默认的递增类型
 *
 * - 如果当前是预发布版本，返回 'prerelease'
 * - 如果当前是稳定版本，返回 'patch'
 *
 * @param version - 当前版本号
 * @returns 推断的递增类型
 */
function inferBumpType(version: string): BumpType {
  try {
    const parsed = parseSemver(version)
    // 如果有预发布标识，使用 prerelease
    if (parsed.prerelease && parsed.prerelease.length > 0) {
      return 'prerelease'
    }
  } catch {
    // 解析失败，使用默认值
  }
  // 稳定版本或解析失败，默认使用 patch
  return 'patch'
}

/**
 * 更新单个包的版本号
 *
 * 支持通过指定版本号或递增类型来更新包版本。
 * 当不指定 type 时，会根据当前版本智能推断：
 * - 预发布版本（如 1.0.0-alpha.0）→ 自动使用 prerelease
 * - 稳定版本（如 1.2.3）→ 自动使用 patch
 *
 * @param pkgPath - package.json 的路径或包含 package.json 的目录
 * @param options - 版本更新选项（可选，默认为空对象）
 * @returns 版本更新结果
 * @throws {SemverError} 当版本号格式无效时
 * @throws {ConfigError} 当包配置无效时
 *
 * @example
 * ```ts
 * import { bumpVersion } from '@cat-kit/maintenance'
 * import { resolve } from 'node:path'
 *
 * // 自动递增版本（智能推断类型）
 * // 1.0.0 → 1.0.1（稳定版本自动 patch）
 * // 1.0.0-alpha.0 → 1.0.0-alpha.1（预发布版本自动递增）
 * const result = await bumpVersion(resolve('packages/core'), {})
 *
 * // 显式指定递增类型
 * const result = await bumpVersion(resolve('packages/core'), {
 *   type: 'minor'
 * })
 *
 * // 直接设置特定版本号
 * const result = await bumpVersion('packages/core/package.json', {
 *   version: '2.0.0'
 * })
 *
 * // 创建预发布版本（preid 默认为 'alpha'）
 * const result = await bumpVersion('packages/core', {
 *   type: 'prerelease'
 * })
 * ```
 */
export async function bumpVersion(
  pkgPath: string,
  options: BumpOptions = {}
): Promise<BumpResult> {
  const { type, version: targetVersion, preid } = options

  if (!pkgPath || !pkgPath.trim()) {
    throw new ConfigError('包路径不能为空')
  }

  const packageJsonPath = resolvePackageJsonPath(pkgPath)
  const packageJson = await readJson<PackageJson>(packageJsonPath)

  if (!packageJson.name) {
    throw new ConfigError(
      `package.json 缺少 name 字段`,
      packageJsonPath
    )
  }

  const oldVersion = packageJson.version || '0.0.0'

  // 确定新版本号
  let newVersion: string

  if (targetVersion) {
    // 使用指定的版本号
    if (!isValidSemver(targetVersion)) {
      throw new SemverError(`无效的版本号: ${targetVersion}`, targetVersion)
    }
    newVersion = targetVersion
  } else {
    // 确定递增类型：显式指定 > 智能推断
    const effectiveType = type ?? inferBumpType(oldVersion)
    // 基于当前版本号递增
    newVersion = incrementVersion(oldVersion, effectiveType, preid)
  }

  // 更新 version 字段
  packageJson.version = newVersion

  // 写回文件
  await writeJson(packageJsonPath, packageJson, { space: 2, eol: '\n' })

  return {
    version: newVersion,
    updated: [
      {
        name: packageJson.name,
        oldVersion,
        newVersion
      }
    ]
  }
}

