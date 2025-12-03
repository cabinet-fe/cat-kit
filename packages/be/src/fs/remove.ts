import { rm } from 'node:fs/promises'

export interface RemoveOptions {
  /**
   * 是否忽略不存在的路径
   * @default false
   */
  force?: boolean
}

/**
 * 删除文件或目录
 * @param targetPath - 要删除的路径
 * @param options - 删除行为控制（是否忽略不存在）
 */
export async function removePath(
  targetPath: string,
  options: RemoveOptions = {}
): Promise<void> {
  const { force = false } = options
  await rm(targetPath, { recursive: true, force })
}
