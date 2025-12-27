import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import type { PackageJson } from '../types'

/**
 * workspace 协议解析结果
 */
export interface WorkspaceProtocolResolution {
  /** 原始协议值 (如 "workspace:*") */
  original: string
  /** 解析后的版本范围 (如 "^1.0.0") */
  resolved: string
}

/**
 * catalog 协议解析结果
 */
export interface CatalogProtocolResolution {
  /** 原始协议值 (如 "catalog:react18") */
  original: string
  /** 解析后的版本范围 (如 "^18.3.1") */
  resolved: string
}

/**
 * 工作区信息 (用于解析 workspace 协议)
 */
export interface WorkspaceInfo {
  /** 包名 */
  name: string
  /** 版本号 */
  version: string
}

/**
 * Catalog 定义 (来自 pnpm-workspace.yaml 或 package.json)
 */
export interface CatalogDefinition {
  /** 默认 catalog */
  default?: Record<string, string>
  /** 命名 catalog */
  [name: string]: Record<string, string> | undefined
}

/**
 * 协议解析选项
 */
export interface ProtocolResolveOptions {
  /** 工作区信息列表 (用于解析 workspace 协议) */
  workspaces?: WorkspaceInfo[]
  /** Catalog 定义 (用于解析 catalog 协议) */
  catalogs?: CatalogDefinition
}

/**
 * 解析 workspace 协议
 *
 * 根据 pnpm/bun 的规范，workspace 协议会被替换为:
 * - `workspace:*` -> 精确版本 (如 "1.0.0")
 * - `workspace:^` -> caret 范围 (如 "^1.0.0")
 * - `workspace:~` -> tilde 范围 (如 "~1.0.0")
 * - `workspace:^1.0.0` -> 保持原样 (如 "^1.0.0")
 *
 * @param protocol - workspace 协议值
 * @param targetVersion - 目标包的版本号
 * @returns 解析后的版本范围
 *
 * @example
 * ```ts
 * resolveWorkspaceProtocol('workspace:*', '1.2.3')   // '1.2.3'
 * resolveWorkspaceProtocol('workspace:^', '1.2.3')   // '^1.2.3'
 * resolveWorkspaceProtocol('workspace:~', '1.2.3')   // '~1.2.3'
 * resolveWorkspaceProtocol('workspace:^2.0.0', '1.2.3') // '^2.0.0'
 * ```
 */
export function resolveWorkspaceProtocol(
  protocol: string,
  targetVersion: string
): string {
  if (!protocol.startsWith('workspace:')) {
    return protocol
  }

  const suffix = protocol.slice('workspace:'.length)

  switch (suffix) {
    case '*':
      return targetVersion
    case '^':
      return `^${targetVersion}`
    case '~':
      return `~${targetVersion}`
    default:
      // 如果是具体的版本范围 (如 workspace:^1.0.0)，保持范围符号
      return suffix
  }
}

/**
 * 解析 catalog 协议
 *
 * 根据 pnpm 的规范，catalog 协议会被替换为 catalog 中定义的版本:
 * - `catalog:` -> 使用默认 catalog
 * - `catalog:react18` -> 使用命名 catalog
 *
 * @param protocol - catalog 协议值
 * @param depName - 依赖名称
 * @param catalogs - catalog 定义
 * @returns 解析后的版本范围，如果找不到则返回 null
 *
 * @example
 * ```ts
 * const catalogs = {
 *   default: { react: '^18.2.0' },
 *   react18: { react: '^18.3.1' }
 * }
 *
 * resolveCatalogProtocol('catalog:', 'react', catalogs)       // '^18.2.0'
 * resolveCatalogProtocol('catalog:react18', 'react', catalogs) // '^18.3.1'
 * ```
 */
export function resolveCatalogProtocol(
  protocol: string,
  depName: string,
  catalogs: CatalogDefinition
): string | null {
  if (!protocol.startsWith('catalog:')) {
    return null
  }

  const catalogName = protocol.slice('catalog:'.length) || 'default'
  const catalog = catalogs[catalogName]

  if (!catalog) {
    return null
  }

  return catalog[depName] ?? null
}

/**
 * 检查版本字符串是否是协议格式
 */
export function isProtocolVersion(version: string): boolean {
  return version.startsWith('workspace:') || version.startsWith('catalog:')
}

/**
 * 处理 package.json 中的协议，返回转换后的副本
 *
 * 此函数会遍历 dependencies、devDependencies、peerDependencies、optionalDependencies，
 * 将其中的 workspace: 和 catalog: 协议替换为实际的版本范围。
 *
 * @param pkg - 原始 package.json 内容
 * @param options - 解析选项
 * @returns 处理后的 package.json 副本
 *
 * @example
 * ```ts
 * const pkg = {
 *   name: '@my/pkg',
 *   version: '1.0.0',
 *   dependencies: {
 *     '@my/core': 'workspace:^',
 *     'react': 'catalog:'
 *   }
 * }
 *
 * const resolved = resolveProtocols(pkg, {
 *   workspaces: [{ name: '@my/core', version: '2.0.0' }],
 *   catalogs: { default: { react: '^18.2.0' } }
 * })
 *
 * // resolved.dependencies = {
 * //   '@my/core': '^2.0.0',
 * //   'react': '^18.2.0'
 * // }
 * ```
 */
export function resolveProtocols(
  pkg: PackageJson,
  options: ProtocolResolveOptions
): PackageJson {
  const { workspaces = [], catalogs = {} } = options

  // 创建工作区名称到版本的映射
  const workspaceVersionMap = new Map<string, string>()
  for (const ws of workspaces) {
    workspaceVersionMap.set(ws.name, ws.version)
  }

  // 深拷贝 package.json
  const result: PackageJson = JSON.parse(JSON.stringify(pkg))

  // 需要处理的依赖字段
  const depFields = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies'
  ] as const

  for (const field of depFields) {
    const deps = result[field]
    if (!deps || typeof deps !== 'object') continue

    for (const [depName, version] of Object.entries(deps)) {
      if (typeof version !== 'string') continue

      let resolved: string | null = null

      if (version.startsWith('workspace:')) {
        const targetVersion = workspaceVersionMap.get(depName)
        if (targetVersion) {
          resolved = resolveWorkspaceProtocol(version, targetVersion)
        }
      } else if (version.startsWith('catalog:')) {
        resolved = resolveCatalogProtocol(version, depName, catalogs)
      }

      if (resolved !== null) {
        deps[depName] = resolved
      }
    }
  }

  return result
}

/**
 * 包装发布流程，临时替换 package.json 中的协议
 *
 * 此函数会:
 * 1. 备份原始 package.json
 * 2. 写入处理后的 package.json
 * 3. 执行发布操作
 * 4. 恢复原始 package.json
 *
 * @param pkgDir - 包目录
 * @param options - 协议解析选项
 * @param publishFn - 实际的发布函数
 *
 * @example
 * ```ts
 * await withResolvedProtocols(
 *   '/path/to/pkg',
 *   { workspaces: [...] },
 *   async () => {
 *     // 此时 package.json 已被临时替换
 *     await execPublish()
 *   }
 * )
 * // 执行完毕后 package.json 已恢复
 * ```
 */
export async function withResolvedProtocols<T>(
  pkgDir: string,
  options: ProtocolResolveOptions,
  publishFn: () => Promise<T>
): Promise<T> {
  const pkgPath = join(pkgDir, 'package.json')

  // 读取原始内容（保留原始格式用于恢复）
  const originalContent = await readFile(pkgPath, 'utf8')
  const pkg = JSON.parse(originalContent) as PackageJson

  // 检查是否需要处理协议
  const hasProtocol = checkHasProtocol(pkg)

  if (!hasProtocol) {
    // 不需要处理协议，直接执行发布
    return publishFn()
  }

  // 解析协议
  const resolved = resolveProtocols(pkg, options)

  // 检测原始文件的缩进风格
  const indent = detectIndent(originalContent)
  const eol = originalContent.includes('\r\n') ? '\r\n' : '\n'

  try {
    // 写入处理后的 package.json
    await writeFile(
      pkgPath,
      JSON.stringify(resolved, null, indent) + eol,
      'utf8'
    )

    // 执行发布
    return await publishFn()
  } finally {
    // 无论成功与否，都恢复原始 package.json
    await writeFile(pkgPath, originalContent, 'utf8')
  }
}

/**
 * 批量包装发布流程，临时替换多个包的 package.json 中的协议
 *
 * 此函数会:
 * 1. 备份所有包的原始 package.json
 * 2. 写入处理后的 package.json
 * 3. 执行发布操作
 * 4. 恢复所有原始 package.json
 *
 * @param pkgDirs - 包目录列表
 * @param options - 协议解析选项
 * @param publishFn - 实际的发布函数
 *
 * @example
 * ```ts
 * await withResolvedProtocolsBatch(
 *   ['/path/to/pkg1', '/path/to/pkg2'],
 *   { workspaces: [...] },
 *   async () => {
 *     // 此时所有 package.json 已被临时替换
 *     await execPublish()
 *   }
 * )
 * // 执行完毕后所有 package.json 已恢复
 * ```
 */
export async function withResolvedProtocolsBatch<T>(
  pkgDirs: string[],
  options: ProtocolResolveOptions,
  publishFn: () => Promise<T>
): Promise<T> {
  // 存储需要恢复的文件
  const backups: Array<{ path: string; content: string }> = []

  try {
    // 遍历所有包目录，处理协议
    for (const pkgDir of pkgDirs) {
      const pkgPath = join(pkgDir, 'package.json')

      // 读取原始内容
      const originalContent = await readFile(pkgPath, 'utf8')
      const pkg = JSON.parse(originalContent) as PackageJson

      // 检查是否需要处理协议
      if (!checkHasProtocol(pkg)) {
        continue
      }

      // 备份原始内容
      backups.push({ path: pkgPath, content: originalContent })

      // 解析协议
      const resolved = resolveProtocols(pkg, options)

      // 检测原始文件的缩进风格
      const indent = detectIndent(originalContent)
      const eol = originalContent.includes('\r\n') ? '\r\n' : '\n'

      // 写入处理后的 package.json
      await writeFile(
        pkgPath,
        JSON.stringify(resolved, null, indent) + eol,
        'utf8'
      )
    }

    // 执行发布
    return await publishFn()
  } finally {
    // 无论成功与否，都恢复所有备份的 package.json
    await Promise.all(
      backups.map(({ path, content }) => writeFile(path, content, 'utf8'))
    )
  }
}

/**
 * 检查 package.json 是否包含需要处理的协议
 */
function checkHasProtocol(pkg: PackageJson): boolean {
  const depFields = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies'
  ] as const

  for (const field of depFields) {
    const deps = pkg[field]
    if (!deps || typeof deps !== 'object') continue

    for (const version of Object.values(deps)) {
      if (typeof version === 'string' && isProtocolVersion(version)) {
        return true
      }
    }
  }

  return false
}

/**
 * 检测 JSON 文件的缩进风格
 */
function detectIndent(content: string): number {
  // 查找第一个缩进的行
  const match = content.match(/\n(\s+)/)
  if (!match?.[1]) return 2
  return match[1].length
}
