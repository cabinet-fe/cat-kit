import { join, resolve, sep } from 'node:path'
import { readdir, stat } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { readJson } from '@cat-kit/be'
import type { MonorepoConfig, PackageInfo, PackageJson } from './types'
import { ConfigError, GitError } from './errors'

/**
 * 加载 monorepo 中的所有包
 * @param config - Monorepo 配置
 * @returns 包信息列表
 */
/**
 * 加载 monorepo 中的所有包
 * @param config - Monorepo 配置
 * @returns 包信息列表
 * @throws {ConfigError} 当配置无效或无法读取 package.json 时
 */
export async function loadPackages(
  config: MonorepoConfig
): Promise<PackageInfo[]> {
  const rootPkgPath = join(config.rootDir, 'package.json')
  const rootPkg = await readJson<PackageJson>(rootPkgPath)

  const workspaces = config.workspaces || rootPkg.workspaces || []
  if (workspaces.length === 0) {
    throw new ConfigError(
      '未找到 workspace 配置，请在 MonorepoConfig 中指定 workspaces 或在根 package.json 中配置',
      rootPkgPath
    )
  }

  const packageDirs: string[] = []

  // 解析 workspace glob 模式
  for (const workspace of workspaces) {
    // 简单的 glob 解析（支持 * 通配符）
    if (workspace.includes('*')) {
      // 使用跨平台的 glob 匹配
      const matches = await matchGlob(workspace, config.rootDir)
      packageDirs.push(...matches)
    } else {
      packageDirs.push(workspace)
    }
  }

  // 加载所有包的信息
  const packages = await Promise.all(
    packageDirs.map(async dir => {
      const absoluteDir = resolve(config.rootDir, dir)
      const pkgJsonPath = join(absoluteDir, 'package.json')

      try {
        const packageJson = await readJson<PackageJson>(pkgJsonPath)

        if (!packageJson.name) {
          throw new ConfigError(`package.json 缺少 name 字段`, pkgJsonPath)
        }

        return {
          name: packageJson.name,
          version: packageJson.version || '0.0.0',
          dir: absoluteDir,
          packageJsonPath: pkgJsonPath,
          packageJson,
          private: packageJson.private || false
        } satisfies PackageInfo
      } catch (error) {
        // 跳过无效的包目录（静默失败，不抛出错误）
        if (error instanceof ConfigError && error.code === 'CONFIG_ERROR') {
          return null
        }
        // 其他错误也跳过，但记录
        return null
      }
    })
  )

  // 过滤掉 null 值（无效的包）
  return packages.filter((pkg): pkg is PackageInfo => pkg !== null)
}

/**
 * 简单的 glob 模式匹配（支持 * 通配符）
 *
 * 注意：glob 模式使用 `/` 作为路径分隔符，但会正确处理跨平台路径
 *
 * @param pattern - glob 模式（如 "packages/*"）
 * @param cwd - 工作目录
 * @returns 匹配的目录路径列表（相对于 cwd）
 */
async function matchGlob(pattern: string, cwd: string): Promise<string[]> {
  // glob 模式使用 `/` 作为分隔符，但需要转换为平台特定的分隔符
  const normalizedPattern = pattern.replace(/\//g, sep)
  const parts = normalizedPattern.split(sep).filter(p => p.length > 0)
  const results: string[] = []

  async function match(
    currentPath: string,
    patternParts: string[],
    depth: number
  ): Promise<void> {
    if (patternParts.length === 0) {
      // 检查当前路径是否为目录
      try {
        const stats = await stat(currentPath)
        if (stats.isDirectory()) {
          results.push(currentPath)
        }
      } catch {
        // 忽略不存在的路径
      }
      return
    }

    const [part, ...rest] = patternParts

    // 确保 part 存在（实际上由于前面的检查，这里 part 一定存在）
    if (!part) {
      return
    }

    if (part === '*') {
      // 通配符：匹配所有目录
      try {
        const entries = await readdir(currentPath, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isDirectory()) {
            await match(join(currentPath, entry.name), rest, depth + 1)
          }
        }
      } catch {
        // 忽略无法读取的目录
      }
    } else {
      // 字面量：精确匹配
      const nextPath = join(currentPath, part)
      try {
        const stats = await stat(nextPath)
        if (stats.isDirectory()) {
          await match(nextPath, rest, depth + 1)
        }
      } catch {
        // 忽略不存在的路径
      }
    }
  }

  await match(cwd, parts, 0)

  // 返回相对于 cwd 的路径
  return results.map(path => {
    const relative = path.replace(cwd + sep, '')
    return relative === path ? path.replace(cwd, '') : relative
  })
}

/**
 * 执行 git 命令
 * @param cwd - 工作目录
 * @param args - git 命令参数
 * @returns 命令输出
 * @throws {GitError} 当 git 命令执行失败时
 */
export async function execGit(cwd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('git', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    })

    let stdout = ''
    let stderr = ''

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    proc.on('error', error => {
      const command = `git ${args.join(' ')}`
      reject(new GitError(`执行 git 命令失败: ${command}`, command, error))
    })

    proc.on('close', exitCode => {
      if (exitCode !== 0) {
        const command = `git ${args.join(' ')}`
        const errorMessage = stderr || `Git 命令退出码: ${exitCode}`
        reject(
          new GitError(
            `执行 git 命令失败: ${command}`,
            command,
            new Error(errorMessage)
          )
        )
      } else {
        resolve(stdout.trim())
      }
    })
  })
}

/**
 * 并行处理工具
 *
 * 支持并发控制和进度回调，适用于需要限制并发数的异步任务处理
 *
 * @param items - 待处理项目列表
 * @param processor - 处理函数
 * @param options - 选项
 * @returns 处理结果列表
 *
 * @example
 * ```ts
 * const results = await parallelProcess(
 *   [1, 2, 3, 4, 5],
 *   async (item) => item * 2,
 *   { concurrency: 2, onProgress: (completed, total) => console.log(`${completed}/${total}`) }
 * )
 * ```
 */
export async function parallelProcess<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: {
    /** 并发数（默认 5） */
    concurrency?: number
    /** 进度回调 */
    onProgress?: (completed: number, total: number) => void
  } = {}
): Promise<R[]> {
  const { concurrency = 5, onProgress } = options

  if (concurrency <= 0) {
    throw new Error('并发数必须大于 0')
  }

  if (items.length === 0) {
    return []
  }

  const results: R[] = []
  let completed = 0

  // 分批处理
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => processor(item, i + batchIndex))
    )
    results.push(...batchResults)

    completed += batch.length
    onProgress?.(completed, items.length)
  }

  return results
}
