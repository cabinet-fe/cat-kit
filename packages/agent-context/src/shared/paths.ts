import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function getPackageRootDir(): string {
  return resolve(__dirname, '../..')
}

/**
 * 优先返回 dist/（发布产物），不存在时回退到 src/（本地开发）
 */
export function getResourcesDir(): string {
  const root = getPackageRootDir()
  const distDir = resolve(root, 'dist')

  if (existsSync(resolve(distDir, 'workflows'))) {
    return distDir
  }

  return resolve(root, 'src')
}
