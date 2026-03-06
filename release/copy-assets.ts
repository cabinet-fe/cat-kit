import { cp, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

interface CopyAssetsOptions {
  /** 包根目录（绝对路径） */
  pkgDir: string
  /** 输出目录名，默认 'dist' */
  outDir?: string
  /** 需要复制的相对路径列表（相对于 src/） */
  assets: string[]
}

/**
 * 将 src/ 下的非 TS 资源复制到 dist/，保持目录结构
 *
 * @throws 源文件不存在时抛出错误
 */
export async function copyAssetsToDist(options: CopyAssetsOptions): Promise<void> {
  const { pkgDir, outDir = 'dist', assets } = options
  const srcBase = resolve(pkgDir, 'src')
  const distBase = resolve(pkgDir, outDir)

  await Promise.all(
    assets.map(async (asset) => {
      const src = resolve(srcBase, asset)
      const dest = resolve(distBase, asset)

      await rm(dest, { recursive: true, force: true })
      await cp(src, dest, { recursive: true })
    })
  )
}
