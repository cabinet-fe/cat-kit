import type { SemverVersion, BumpType } from './types'
import { SemverError } from '../errors'

/**
 * 解析 semver 版本号
 * @param version - 版本字符串（如 "1.2.3-alpha.1+build.123"）
 * @returns 解析后的版本对象
 * @throws {SemverError} 当版本格式无效时
 * @example
 * ```ts
 * const ver = parseSemver('1.2.3-alpha.1')
 * // { major: 1, minor: 2, patch: 3, prerelease: ['alpha', '1'], raw: '1.2.3-alpha.1' }
 * ```
 */
export function parseSemver(version: string): SemverVersion {
  // 移除前导 v
  const cleaned = version.replace(/^v/, '')

  // 匹配 semver 格式：major.minor.patch[-prerelease][+build]
  const regex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-.]+))?(?:\+([0-9A-Za-z-.]+))?$/
  const match = cleaned.match(regex)

  if (!match) {
    throw new SemverError(`无效的 semver 版本号: ${version}`, version)
  }

  return {
    major: parseInt(match[1]!, 10),
    minor: parseInt(match[2]!, 10),
    patch: parseInt(match[3]!, 10),
    prerelease: match[4] ? match[4].split('.') : undefined,
    build: match[5],
    raw: version
  }
}

/**
 * 验证版本号格式是否有效
 * @param version - 版本字符串
 * @returns 是否为有效的 semver 版本号
 * @example
 * ```ts
 * isValidSemver('1.2.3')         // true
 * isValidSemver('1.2.3-alpha.1') // true
 * isValidSemver('invalid')       // false
 * ```
 */
export function isValidSemver(version: string): boolean {
  try {
    parseSemver(version)
    return true
  } catch {
    return false
  }
}

/**
 * 比较预发布版本标识符
 * @param a - 预发布标识符数组 A
 * @param b - 预发布标识符数组 B
 * @returns 1 if a > b, -1 if a < b, 0 if equal
 */
function comparePrereleaseIdentifiers(a: string[], b: string[]): number {
  const len = Math.max(a.length, b.length)

  for (let i = 0; i < len; i++) {
    const identA = a[i]
    const identB = b[i]

    // 如果一个数组已经结束，较短的更小
    if (identA === undefined) return -1
    if (identB === undefined) return 1

    // 尝试作为数字比较
    const numA = parseInt(identA, 10)
    const numB = parseInt(identB, 10)

    const isNumA = !isNaN(numA) && identA === String(numA)
    const isNumB = !isNaN(numB) && identB === String(numB)

    if (isNumA && isNumB) {
      // 两者都是数字，数字比较
      if (numA !== numB) {
        return numA > numB ? 1 : -1
      }
    } else if (isNumA) {
      // 数字总是小于字符串
      return -1
    } else if (isNumB) {
      // 字符串总是大于数字
      return 1
    } else {
      // 两者都是字符串，字符串比较
      if (identA !== identB) {
        return identA > identB ? 1 : -1
      }
    }
  }

  return 0
}

/**
 * 比较两个版本号
 * @param v1 - 版本号 1（字符串或版本对象）
 * @param v2 - 版本号 2（字符串或版本对象）
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 * @example
 * ```ts
 * compareSemver('2.0.0', '1.0.0')         // 1
 * compareSemver('1.0.0', '2.0.0')         // -1
 * compareSemver('1.0.0', '1.0.0')         // 0
 * compareSemver('1.0.0-alpha', '1.0.0')   // -1 (预发布版本小于正式版本)
 * ```
 */
export function compareSemver(
  v1: string | SemverVersion,
  v2: string | SemverVersion
): number {
  const ver1 = typeof v1 === 'string' ? parseSemver(v1) : v1
  const ver2 = typeof v2 === 'string' ? parseSemver(v2) : v2

  // 比较主版本号
  if (ver1.major !== ver2.major) {
    return ver1.major > ver2.major ? 1 : -1
  }

  // 比较次版本号
  if (ver1.minor !== ver2.minor) {
    return ver1.minor > ver2.minor ? 1 : -1
  }

  // 比较修订号
  if (ver1.patch !== ver2.patch) {
    return ver1.patch > ver2.patch ? 1 : -1
  }

  // 比较预发布版本
  // 有预发布版本的小于没有预发布版本的
  if (ver1.prerelease && !ver2.prerelease) return -1
  if (!ver1.prerelease && ver2.prerelease) return 1
  if (ver1.prerelease && ver2.prerelease) {
    return comparePrereleaseIdentifiers(ver1.prerelease, ver2.prerelease)
  }

  return 0
}

/**
 * 递增版本号
 * @param version - 当前版本号
 * @param type - 递增类型
 * @param preid - 预发布标识（用于 pre* 类型，默认 'pre'）
 * @returns 新版本号字符串
 * @throws {SemverError} 当递增类型无效时
 * @example
 * ```ts
 * incrementVersion('1.2.3', 'major')           // '2.0.0'
 * incrementVersion('1.2.3', 'minor')           // '1.3.0'
 * incrementVersion('1.2.3', 'patch')           // '1.2.4'
 * incrementVersion('1.2.3', 'premajor', 'alpha') // '2.0.0-alpha.0'
 * incrementVersion('1.2.3-alpha.0', 'prerelease') // '1.2.3-alpha.1'
 * ```
 */
export function incrementVersion(
  version: string,
  type: BumpType,
  preid: string = 'pre'
): string {
  const ver = parseSemver(version)

  switch (type) {
    case 'major':
      return `${ver.major + 1}.0.0`

    case 'minor':
      return `${ver.major}.${ver.minor + 1}.0`

    case 'patch':
      return `${ver.major}.${ver.minor}.${ver.patch + 1}`

    case 'premajor':
      return `${ver.major + 1}.0.0-${preid}.0`

    case 'preminor':
      return `${ver.major}.${ver.minor + 1}.0-${preid}.0`

    case 'prepatch':
      return `${ver.major}.${ver.minor}.${ver.patch + 1}-${preid}.0`

    case 'prerelease':
      if (ver.prerelease) {
        // 递增预发布版本号
        const newPrerelease = [...ver.prerelease]
        const last = newPrerelease[newPrerelease.length - 1]!
        const num = parseInt(last, 10)

        if (!isNaN(num)) {
          // 如果最后一项是数字，递增它
          newPrerelease[newPrerelease.length - 1] = String(num + 1)
        } else {
          // 如果不是数字，添加 .0
          newPrerelease.push('0')
        }

        return `${ver.major}.${ver.minor}.${ver.patch}-${newPrerelease.join('.')}`
      } else {
        // 如果没有预发布版本，创建一个
        return `${ver.major}.${ver.minor}.${ver.patch}-${preid}.0`
      }

    default:
      throw new SemverError(`未知的版本递增类型: ${type}`)
  }
}
