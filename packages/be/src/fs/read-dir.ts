import { readdir } from 'node:fs/promises'
import { resolve, relative } from 'node:path'

/**
 * 目录条目信息
 */
export interface DirEntry {
  /** 绝对路径 */
  path: string
  /** 相对于根目录的路径 */
  relativePath: string
  /** 文件名或目录名 */
  name: string
  /** 目录深度（从根目录开始，根目录为 0） */
  depth: number
  /** 是否为文件 */
  isFile: boolean
  /** 是否为目录 */
  isDirectory: boolean
  /** 是否为符号链接 */
  isSymbolicLink: boolean
}

/**
 * 读取目录选项
 */
export interface ReadDirOptions {
  /**
   * 是否递归读取子目录
   * @default false
   */
  recursive?: boolean
  /**
   * 过滤函数，返回 `true` 表示保留该条目
   */
  filter?: (entry: DirEntry) => boolean
  /**
   * 是否只返回文件路径
   *
   * - 当为 `true` 时，返回文件路径数组（string[]）
   * - 当为 `false` 时，返回包含文件和目录的详细信息数组（DirEntry[]）
   *
   * @default false
   */
  onlyFiles?: boolean
}

/**
 * 读取目录内容
 *
 * 支持递归读取、过滤和多种返回格式。
 *
 * @example
 * ```typescript
 * // 返回文件路径数组
 * const files = await readDir('./src', {
 *   recursive: true,
 *   onlyFiles: true,
 *   filter: entry => entry.name.endsWith('.ts')
 * })
 *
 * // 返回包含文件和目录的详细信息数组
 * const entries = await readDir('./src', {
 *   recursive: true
 * })
 * ```
 *
 * @param dir - 起始目录路径
 * @param options - 过滤、递归和返回格式选项
 * @returns 当 `onlyFiles` 为 `true` 时返回文件路径数组，否则返回包含元数据的条目数组
 * @throws {Error} 当目录不存在或无法读取时抛出错误
 */
export function readDir(
  dir: string,
  options?: ReadDirOptions & { onlyFiles?: false }
): Promise<DirEntry[]>
export function readDir(
  dir: string,
  options: ReadDirOptions & { onlyFiles: true }
): Promise<string[]>
export async function readDir(
  dir: string,
  options: ReadDirOptions = {}
): Promise<DirEntry[] | string[]> {
  const {
    recursive = false,
    filter,
    onlyFiles = false
  } = options

  const root = resolve(dir)
  const entries: DirEntry[] = []

  async function walk(currentDir: string, depth: number): Promise<void> {
    const dirents = await readdir(currentDir, { withFileTypes: true })

    for (const dirent of dirents) {
      const absolutePath = resolve(currentDir, dirent.name)
      const relativePath = relative(root, absolutePath) || dirent.name

      const entry: DirEntry = {
        path: absolutePath,
        relativePath,
        name: dirent.name,
        depth,
        isFile: dirent.isFile(),
        isDirectory: dirent.isDirectory(),
        isSymbolicLink: dirent.isSymbolicLink()
      }

      const passesFilter = filter ? filter(entry) : true

      if (passesFilter) {
        entries.push(entry)
      }

      if (recursive && entry.isDirectory) {
        await walk(absolutePath, depth + 1)
      }
    }
  }

  await walk(root, 0)

  if (onlyFiles) {
    return entries
      .filter(entry => entry.isFile)
      .map(entry => entry.path)
  }

  return entries
}
