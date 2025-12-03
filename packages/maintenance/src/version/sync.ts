import type { MonorepoConfig, PackageJson } from '../types'
import { loadPackages, readJson } from '../utils'

// 懒加载 @cat-kit/be 的 writeJson
let beWriteJson: ((filePath: string, data: unknown, options?: { space?: number; eol?: string }) => Promise<void>) | null = null
let beWriteJsonLoaded = false

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  // 懒加载 @cat-kit/be 的 writeJson
  if (!beWriteJsonLoaded) {
    try {
      const beModule = await import('@cat-kit/be/src')
      if (beModule.writeJson && typeof beModule.writeJson === 'function') {
        beWriteJson = beModule.writeJson
      }
    } catch {
      // 忽略导入错误，使用自定义实现
    }
    beWriteJsonLoaded = true
  }

  // 如果成功加载了 @cat-kit/be 的 writeJson，使用它
  if (beWriteJson) {
    return await beWriteJson(filePath, data, { space: 2, eol: '\n' })
  }

  // 回退到自定义实现
  const { writeFile } = await import('node:fs/promises')
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

// Cat-Kit 包列表（用于识别内部包）
// 这个列表可以从 monorepo 的包列表动态生成
const CAT_KIT_PACKAGES = [
  '@cat-kit/core',
  '@cat-kit/fe',
  '@cat-kit/http',
  '@cat-kit/be',
  '@cat-kit/excel',
  '@cat-kit/maintenance'
]

/**
 * 同步 peerDependencies 中的版本约束
 *
 * 此函数复用了 build/release.ts 中的 peerDependencies 同步逻辑（L48-54）
 * 它会遍历所有包，将 peerDependencies 中的 cat-kit 包版本更新为 >=version
 *
 * @param config - Monorepo 配置
 * @param version - 目标版本号
 *
 * @example
 * ```ts
 * // 将所有包的 peerDependencies 中的 cat-kit 包版本更新为 >=1.2.3
 * await syncPeerDependencies(config, '1.2.3')
 * ```
 */
export async function syncPeerDependencies(
  config: MonorepoConfig,
  version: string
): Promise<void> {
  const packages = await loadPackages(config)

  // 构建内部包名称集合（用于快速查找）
  const internalPackages = new Set(packages.map(pkg => pkg.name))

  // 遍历所有包，更新 peerDependencies
  for (const pkg of packages) {
    const packageJson = await readJson<PackageJson>(pkg.packageJsonPath)
    let modified = false

    // 检查是否有 peerDependencies 需要更新
    if (packageJson.peerDependencies) {
      for (const dep of Object.keys(packageJson.peerDependencies)) {
        // 只更新内部包（cat-kit 包）
        if (internalPackages.has(dep) || CAT_KIT_PACKAGES.includes(dep)) {
          packageJson.peerDependencies[dep] = `>=${version}`
          modified = true
        }
      }
    }

    // 如果有修改，写回文件
    if (modified) {
      await writeJsonFile(pkg.packageJsonPath, packageJson)
    }
  }
}

/**
 * 同步 dependencies 中的工作空间版本约束
 *
 * 将 dependencies 中使用 workspace:* 的包替换为具体版本号
 *
 * @param config - Monorepo 配置
 * @param version - 目标版本号
 */
export async function syncDependencies(
  config: MonorepoConfig,
  version: string
): Promise<void> {
  const packages = await loadPackages(config)
  const internalPackages = new Set(packages.map(pkg => pkg.name))

  for (const pkg of packages) {
    const packageJson = await readJson<PackageJson>(pkg.packageJsonPath)
    let modified = false

    // 更新 dependencies
    if (packageJson.dependencies) {
      for (const [dep, currentVersion] of Object.entries(
        packageJson.dependencies
      )) {
        if (
          typeof currentVersion === 'string' &&
          internalPackages.has(dep) &&
          currentVersion.startsWith('workspace:')
        ) {
          packageJson.dependencies[dep] = `^${version}`
          modified = true
        }
      }
    }

    if (modified) {
      await writeJsonFile(pkg.packageJsonPath, packageJson)
    }
  }
}
