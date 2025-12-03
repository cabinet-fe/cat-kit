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
 * 读取 JSON 文件
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
 * 写入 JSON 文件
 */
export async function writeJson(
  filePath: string,
  data: unknown,
  options: WriteJsonOptions = {}
): Promise<void> {
  const {
    encoding = 'utf8',
    replacer,
    space = 2,
    eol = '\n'
  } = options

  const json = JSON.stringify(data, replacer, space) + eol
  await ensureDir(dirname(filePath))
  await writeFile(filePath, json, { encoding })
}

