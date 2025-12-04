import { readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { ensureDir } from './ensure-dir'

/**
 * 确保目录为空
 *
 * 如果目录不为空，则删除目录内容。如果目录不存在，则创建该目录。
 * 目录本身不会被删除。
 *
 * @example
 * ```typescript
 * // 确保目录为空
 * await emptyDir('./temp')
 *
 * // 清空缓存目录
 * await emptyDir('./cache')
 *
 * // 如果目录不存在，会自动创建
 * await emptyDir('./new-empty-dir')
 * ```
 *
 * @param dirPath - 目标目录路径
 * @throws {Error} 当路径存在但不是目录时抛出错误
 * @throws {Error} 当目录操作失败时抛出错误
 */
export async function emptyDir(dirPath: string): Promise<void> {
  // 确保目录存在（如果不存在则创建）
  await ensureDir(dirPath)

  // 读取目录内容
  const items = await readdir(dirPath)

  // 并行删除所有内容
  await Promise.all(
    items.map(item => rm(join(dirPath, item), { recursive: true, force: true }))
  )
}
