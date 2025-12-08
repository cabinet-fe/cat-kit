import { writeJson, readJson } from '../utils'
import { join, basename } from 'node:path'
import type { PackageJson } from '../types'
import type { BumpOptions, BumpResult } from './types'
import { incrementVersion, isValidSemver } from './semver'
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
 * 更新单个包的版本号
 *
 * 支持通过指定版本号或递增类型来更新包版本。
 *
 * @param pkgPath - package.json 的路径或包含 package.json 的目录
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
 * // 递增 minor 版本号
 * const result = await bumpVersion(resolve('packages/core'), {
 *   type: 'minor'
 * })
 * console.log(`更新到版本: ${result.version}`)
 *
 * // 设置特定版本号
 * const result = await bumpVersion('packages/core/package.json', {
 *   type: 'patch',
 *   version: '1.2.3'
 * })
 *
 * // 创建预发布版本
 * const result = await bumpVersion('packages/core', {
 *   type: 'prerelease',
 *   preid: 'alpha'
 * })
 * ```
 */
export async function bumpVersion(
  pkgPath: string,
  options: BumpOptions
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
    // 基于当前版本号递增
    newVersion = incrementVersion(oldVersion, type, preid)
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
