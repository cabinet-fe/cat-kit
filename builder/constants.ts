import path from 'path'
import { fileURLToPath } from 'url'

/** 存放包的目录名 */
export const PKG_DIR_NAME = 'packages/'

/** 入口文件 */
export const FE_INPUT = fileURLToPath(
  new URL('../packages/fe/index.ts', import.meta.url)
)

export const BE_INPUT = fileURLToPath(
  new URL('../packages/be/index.ts', import.meta.url)
)

/** 输出文件夹 */
export const OUTPUT = fileURLToPath(new URL('../dist', import.meta.url))

/** 包描述文件 */
export const PKG = path.resolve(process.cwd(), 'package.json')
