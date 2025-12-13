import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'



/**
 * 读取 JSON 文件并解析为对象
 *
 * @param filePath - JSON 文件路径
 * @returns 解析后的数据
 * @throws {Error} 当文件不存在或 JSON 格式错误时抛出错误
 *
 * @example
 * ```ts
 * const pkg = await readJson<{ name: string; version: string }>('./package.json')
 * console.log(pkg.name)
 * ```
 */
export async function readJson<T = Record<string, unknown>>(
  filePath: string
): Promise<T> {
  const content = await readFile(filePath, 'utf8')
  return JSON.parse(content)
}

/**
 * 写入 JSON 文件选项
 */
export interface WriteJsonOptions {
  /** 缩进空格数，默认 2 */
  space?: number
  /** 文件末尾换行符，默认 '\n' */
  eol?: string
}

/**
 * 将数据序列化为 JSON 文件
 *
 * 如果目录不存在会自动创建。文件末尾会自动添加换行符。
 *
 * @param filePath - 目标文件路径
 * @param data - 待写入的数据
 * @param options - 缩进等选项
 * @throws {Error} 当文件写入失败时抛出错误
 *
 * @example
 * ```ts
 * await writeJson('./config.json', { port: 3000, debug: false })
 *
 * // 自定义格式
 * await writeJson('./data.json', data, { space: 4, eol: '\r\n' })
 * ```
 */
export async function writeJson(
  filePath: string,
  data: unknown,
  options: WriteJsonOptions = {}
): Promise<void> {
  const { space = 2, eol = '\n' } = options
  const json = JSON.stringify(data, null, space) + eol

  // 确保父目录存在
  const dir = dirname(filePath)
  await mkdir(dir, { recursive: true })

  await writeFile(filePath, json, 'utf8')
}
