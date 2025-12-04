import { rename, stat, cp, rm } from 'node:fs/promises'
import { dirname } from 'node:path'
import { ensureDir } from './ensure-dir'

/**
 * 移动路径选项
 */
export interface MoveOptions {
  /**
   * 如果目标路径已存在，是否覆盖
   * @default false
   */
  overwrite?: boolean
}

/**
 * 移动文件或目录到新位置
 *
 * 将源路径的文件或目录移动到目标路径。源路径和目标路径类型必须一致：
 * 要么都是文件，要么都是目录。
 *
 * @example
 * ```typescript
 * // 移动文件
 * await movePath('./old/file.txt', './new/file.txt')
 *
 * // 移动目录
 * await movePath('./old-dir', './new-dir')
 *
 * // 覆盖已存在的目标
 * await movePath('./source', './target', { overwrite: true })
 * ```
 *
 * @param src - 源路径（文件或目录）
 * @param dest - 目标路径（必须与源路径类型一致）
 * @param options - 移动选项
 * @throws {Error} 当源路径不存在时抛出错误
 * @throws {Error} 当源路径和目标路径类型不一致时抛出错误
 * @throws {Error} 当目标路径已存在且 overwrite 为 false 时抛出错误
 */
export async function movePath(
  src: string,
  dest: string,
  options: MoveOptions = {}
): Promise<void> {
  const { overwrite = false } = options

  // 检查源路径是否存在
  const srcStats = await stat(src).catch(() => null)
  if (!srcStats) {
    throw new Error(`源路径 "${src}" 不存在`)
  }

  const srcIsDirectory = srcStats.isDirectory()

  // 检查目标路径是否存在
  const destStats = await stat(dest).catch(() => null)

  if (destStats) {
    const destIsDirectory = destStats.isDirectory()

    // 检查类型是否一致
    if (srcIsDirectory !== destIsDirectory) {
      const srcType = srcIsDirectory ? '目录' : '文件'
      const destType = destIsDirectory ? '目录' : '文件'
      throw new Error(`源路径是${srcType}，但目标路径是${destType}，类型不一致`)
    }

    // 目标已存在且不允许覆盖
    if (!overwrite) {
      throw new Error(`目标路径 "${dest}" 已存在`)
    }

    // 删除已存在的目标
    await rm(dest, { recursive: true, force: true })
  }

  // 确保目标父目录存在
  await ensureDir(dirname(dest))

  // 尝试使用 rename（同一文件系统上更高效）
  try {
    await rename(src, dest)
  } catch (error) {
    // 如果 rename 失败（可能是跨文件系统），则使用复制+删除
    if ((error as NodeJS.ErrnoException).code === 'EXDEV') {
      await cp(src, dest, { recursive: true })
      await rm(src, { recursive: true, force: true })
    } else {
      throw error
    }
  }
}
