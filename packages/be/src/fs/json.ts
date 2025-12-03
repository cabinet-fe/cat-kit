import { readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import { ensureDir } from './ensure-dir'

export interface ReadJsonOptions {
  encoding?: BufferEncoding
  reviver?: Parameters<typeof JSON.parse>[1]
}

export interface WriteJsonOptions {
  encoding?: BufferEncoding
  replacer?: Parameters<typeof JSON.stringify>[1]
  space?: Parameters<typeof JSON.stringify>[2]
  eol?: string
}

/**
 * 读取 JSON 文件并解析为对象
 * @param filePath - JSON 文件路径
 * @param options - 读取编码与自定义 reviver
 * @returns 解析后的数据
 */
export async function readJson<T = unknown>(
  filePath: string,
  options: ReadJsonOptions = {}
): Promise<T> {
  const { encoding = 'utf8', reviver } = options
  const content = await readFile(filePath, { encoding })
  return JSON.parse(content, reviver)
}

/**
 * 将数据序列化为 JSON 文件
 * @param filePath - 目标文件路径
 * @param data - 待写入的数据
 * @param options - 编码、replacer、缩进等选项
 */
export async function writeJson(
  filePath: string,
  data: unknown,
  options: WriteJsonOptions = {}
): Promise<void> {
  const { encoding = 'utf8', replacer, space = 2, eol = '\n' } = options

  const json = JSON.stringify(data, replacer, space) + eol
  await ensureDir(dirname(filePath))
  await writeFile(filePath, json, { encoding })
}
