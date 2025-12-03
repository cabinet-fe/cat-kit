import { readdir } from 'node:fs/promises'
import { resolve, relative } from 'node:path'

export interface DirEntry {
  /**
   * 绝对路径
   */
  path: string
  /**
   * 相对于根目录的路径
   */
  relativePath: string
  name: string
  depth: number
  isFile: boolean
  isDirectory: boolean
  isSymbolicLink: boolean
}

interface ReadDirOptionsBase {
  /**
   * 是否递归读取
   * @default false
   */
  recursive?: boolean
  /**
   * 过滤函数，返回 true 表示保留
   */
  filter?: (entry: DirEntry) => boolean
  /**
   * 是否包含文件
   * @default true
   */
  includeFiles?: boolean
  /**
   * 是否包含目录
   * @default true
   */
  includeDirs?: boolean
  /**
   * 返回的路径是否为绝对路径
   * @default true
   */
  absolute?: boolean
}

export interface ReadDirOptionsWithPaths extends ReadDirOptionsBase {
  returnType?: 'path'
}

export interface ReadDirOptionsWithEntries extends ReadDirOptionsBase {
  returnType: 'entry'
}

export type ReadDirOptions =
  | ReadDirOptionsWithPaths
  | ReadDirOptionsWithEntries

export function readDir(
  dir: string,
  options?: ReadDirOptionsWithPaths
): Promise<string[]>
export function readDir(
  dir: string,
  options: ReadDirOptionsWithEntries
): Promise<DirEntry[]>
export async function readDir(
  dir: string,
  options: ReadDirOptions = {}
): Promise<Array<string | DirEntry>> {
  const {
    recursive = false,
    filter,
    includeDirs = true,
    includeFiles = true,
    absolute = true,
    returnType = 'path'
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
      const shouldInclude =
        passesFilter &&
        ((entry.isFile && includeFiles) || (entry.isDirectory && includeDirs))

      if (shouldInclude) {
        entries.push(entry)
      }

      if (recursive && entry.isDirectory) {
        await walk(absolutePath, depth + 1)
      }
    }
  }

  await walk(root, 0)

  if (returnType === 'entry') {
    return entries
  }

  return entries.map(entry => (absolute ? entry.path : entry.relativePath))
}

