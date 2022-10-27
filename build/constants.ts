import path from 'path'

/** 入口文件 */
export const INPUT = path.resolve(__dirname, '../packages/utils/index.ts')

/** 输出文件夹 */
export const OUTPUT = path.resolve(__dirname, '../dist')

/** 包描述文件 */
export const PKG = path.resolve(process.cwd(), 'package.json')