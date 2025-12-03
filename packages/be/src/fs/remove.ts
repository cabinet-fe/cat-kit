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
 */
export async function remove(
  targetPath: string,
  options: RemoveOptions = {}
): Promise<void> {
  const { force = false } = options
  await rm(targetPath, { recursive: true, force })
}

