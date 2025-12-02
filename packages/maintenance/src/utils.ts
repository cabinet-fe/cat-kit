import path from 'path'
import { readFile } from 'fs/promises'
import type { MonorepoConfig, PackageInfo, PackageJson } from './types'
import { ConfigError, GitError } from './errors'

/**
 * 读取 JSON 文件
 * @param filePath - 文件路径
 * @returns 解析后的 JSON 对象
 */
export async function readJson<T = any>(filePath: string): Promise<T> {
  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch (error) {
    throw new ConfigError(
      `无法读取 JSON 文件: ${filePath}`,
      filePath,
      error
    )
  }
}

/**
 * 加载 monorepo 中的所有包
 * @param config - Monorepo 配置
 * @returns 包信息列表
 */
export async function loadPackages(config: MonorepoConfig): Promise<PackageInfo[]> {
  const rootPkgPath = path.join(config.rootDir, 'package.json')
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
      // 使用 Bun.Glob 来匹配目录
      const glob = new Bun.Glob(workspace)
      const matches = await Array.fromAsync(glob.scan({ cwd: config.rootDir, onlyFiles: false }))
      packageDirs.push(...matches)
    } else {
      packageDirs.push(workspace)
    }
  }

  // 加载所有包的信息
  const packages = await Promise.all(
    packageDirs.map(async (dir) => {
      const absoluteDir = path.resolve(config.rootDir, dir)
      const pkgJsonPath = path.join(absoluteDir, 'package.json')

      try {
        const packageJson = await readJson<PackageJson>(pkgJsonPath)

        if (!packageJson.name) {
          throw new ConfigError(
            `package.json 缺少 name 字段`,
            pkgJsonPath,
            undefined
          )
        }

        return {
          name: packageJson.name,
          version: packageJson.version,
          dir: absoluteDir,
          packageJsonPath: pkgJsonPath,
          packageJson,
          private: packageJson.private || false
        }
      } catch (error) {
        // 跳过无效的包目录
        return null
      }
    })
  )

  // 过滤掉 null 值（无效的包）
  return packages.filter((pkg): pkg is PackageInfo => pkg !== null)
}

/**
 * 执行 git 命令
 * @param cwd - 工作目录
 * @param args - git 命令参数
 * @returns 命令输出
 */
export async function execGit(cwd: string, args: string[]): Promise<string> {
  try {
    const proc = Bun.spawn(['git', ...args], {
      cwd,
      stdout: 'pipe',
      stderr: 'pipe'
    })

    const output = await new Response(proc.stdout).text()
    const exitCode = await proc.exited

    if (exitCode !== 0) {
      const error = await new Response(proc.stderr).text()
      throw new Error(error)
    }

    return output.trim()
  } catch (error) {
    throw new GitError(
      `执行 git 命令失败: git ${args.join(' ')}`,
      `git ${args.join(' ')}`,
      error
    )
  }
}

/**
 * 并行处理工具
 * @param items - 待处理项目列表
 * @param processor - 处理函数
 * @param options - 选项
 * @returns 处理结果列表
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
  const results: R[] = []
  let completed = 0

  // 分批处理
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map((item, index) => processor(item, i + index))
    )
    results.push(...batchResults)

    completed += batch.length
    onProgress?.(completed, items.length)
  }

  return results
}
