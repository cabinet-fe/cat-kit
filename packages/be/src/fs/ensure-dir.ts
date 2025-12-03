import { stat, mkdir } from 'node:fs/promises'

/**
 * 确保目录存在
 * @param dirPath - 目标目录
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    const stats = await stat(dirPath)

    if (!stats.isDirectory()) {
      throw new Error(`Path "${dirPath}" exists but is not a directory`)
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }

    await mkdir(dirPath, { recursive: true })
  }
}

