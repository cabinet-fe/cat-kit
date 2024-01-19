import type { Dirent } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 文件对象
 */
export interface DirFile {
  type: 'file'
  /** 文件名称 */
  name: string
  /** 文件的绝对路径 */
  path: string
  /** 扩展名 */
  ext: string
  /** 目录名称 */
  dirName: string
  /** 在目录树中的深度 */
  depth: number
}

/**
 * 目录对象
 */
export type DirWithoutChildren = {
  type: 'dir'
  /** 目录名称 */
  name: string
  /** 目录的绝对路径 */
  path: string
  /** 在目录树中的深度 */
  depth: number
}

export type Dir = DirWithoutChildren & {
  children: (Dir | DirFile)[]
}

export type DirWithOnlyDir = DirWithoutChildren & {
  children: DirWithOnlyDir[]
}

type GetDirType<
  FileType extends 'all' | 'file' | 'dir' = 'all',
  R extends boolean = false
> = R extends true
  ? FileType extends 'all'
    ? DirFile | Dir
    : FileType extends 'file'
      ? DirFile
      : DirWithOnlyDir
  : FileType extends 'all'
    ? DirFile | DirWithoutChildren
    : FileType extends 'file'
      ? DirFile
      : DirWithoutChildren

/**
 * 读取目录配置
 */
export interface ReadDirOptions<
  FileType extends 'all' | 'file' | 'dir' = 'all',
  R extends boolean = false
> {
  /**
   * 是否递归
   * @default false
   */
  recursive?: R
  /**
   * 排除的项, 可以是字符串或者正则表达式
   * @default ['node_modules']
   */
  exclude?: (string | RegExp)[]
  /**
   * 包含的项, 可以是字符串或者正则表达式
   * @default []
   */
  include?: (string | RegExp)[]
  /**
   * 读取的类型, all表示全部, file表示仅文件, dir表示目录, 当指定为file时, recursive选项不再生效
   * @default 'all'
   */
  readType?: FileType
  /**
   * 读取到每一项时产生的回调内容
   * @param item 每一项
   * @returns
   */
  callback?: (item: GetDirType<FileType, R>) => void
}

const extRE = /\.[A-z\d]+$/

/**
 * 读取目录
 * @param dir 目录路径, 只能是绝对路径
 * @param options 读取选项
 */
export function readDir<
  F extends 'all' | 'dir' | 'file',
  R extends boolean = false,
  Result = Array<GetDirType<F, R>>
>(dir: string | URL, options?: ReadDirOptions<F, R>): Promise<Result> {
  const {
    recursive = false,
    exclude = ['node_modules'],
    include = [],
    readType = 'all',
    callback
  } = options || {}

  const excludeStr = new Set<string>()
  const excludeRE: RegExp[] = []

  const includeStr = new Set<string>()
  const includeRE: RegExp[] = []

  exclude.forEach(item => {
    if (typeof item === 'string') {
      excludeStr.add(item)
    } else {
      excludeRE.push(item)
    }
  })

  include.forEach(item => {
    if (typeof item === 'string') {
      includeStr.add(item)
    } else {
      includeRE.push(item)
    }
  })

  // 包含选项是否为空
  const isIncludeEmpty = include.length === 0

  const filter = (dirent: Dirent) => {

    // 排除的项
    const excluded =
      excludeStr.has(dirent.name) ||
      excludeRE.some(item => item.test(join(dirent.path, dirent.name)))
    // 如果未指定包含项
    if (isIncludeEmpty) {
      return !excluded
    }
    return (
      !excluded &&
      (includeStr.has(dirent.name) ||
        includeRE.some(item => item.test(join(dirent.path, dirent.name))))
    )
  }

  const recur = async (dir: string, depth = 1) => {
    let direntList = (
      await readdir(dir, {
        withFileTypes: true,
        encoding: 'utf-8'
      })
    )
   direntList = direntList.filter(filter)

    const dirs = await Promise.all(
      direntList.map(async dirent => {
        const path = join(dir, dirent.name)

        // 目录
        if (dirent.isDirectory()) {
          // TODO类型修正
          const item: any = {
            name: dirent.name,
            type: 'dir',
            path,
            depth
          }
          if (recursive) {
            item.children = await recur(path, depth + 1)
          }
          callback?.(item)
          return item
        }

        // 文件
        const file: DirFile = {
          name: dirent.name,
          type: 'file',
          ext: dirent.name.match(extRE)?.[0] ?? '',
          path,
          depth,
          dirName: basename(dirname(path))
        }
        callback?.(file as any)
        return file
      })
    )

    return dirs.filter(
      dir => readType === 'all' || dir.type === readType
    ) as Result
  }

  if (dir instanceof URL) {
    if (dir.protocol === 'file:') {
      return recur(fileURLToPath(dir))
    }
    return Promise.resolve([] as Result)
  }

  return recur(dir)
}
