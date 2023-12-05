import 'crypto-js/md5'
import { algo } from 'crypto-js/core'
import WordArray from 'crypto-js/lib-typedarrays'
import { readFile } from '../web-api'

interface MD5Config {
  /** 文件块大小，默认为10MB */
  chunkSize?: number
}

function msgMD5(msg: string) {
  const md5 = algo.MD5.create()

  return md5.finalize(msg).toString()
}

async function fileMD5(file: Blob, cfg?: MD5Config) {
  // 每块大小为10MB
  const { chunkSize = 10485760 } = cfg || {}

  // 创建MD5哈希算法实例
  const md5 = algo.MD5.create()

  let i = 0
  while (i < chunkSize) {
    const { result } = await readFile(
      file.slice(i, i + chunkSize),
      'arrayBuffer'
    )
    // 将ArrayBuffer转换为WordArray
    const wordArray = WordArray.create(Array.from(new Uint32Array(result)))
    md5.update(wordArray)
    i += result.byteLength
  }

  return md5.finalize().toString()
}

/** MD5计算 */
export function MD5(msg: string): Promise<string>
export function MD5(file: Blob, cfg?: MD5Config): Promise<string>
export function MD5(content: Blob | string, cfg?: MD5Config) {
  if (content instanceof Blob) {
    return fileMD5(content, cfg)
  }
  return Promise.resolve(msgMD5(content))
}
