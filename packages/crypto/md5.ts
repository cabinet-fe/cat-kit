import CryptoJS from 'crypto-js/core'
import _ from 'crypto-js/md5'
import { readFile } from '@cat-kit/fe'
import { arrBufToWordArray } from './word-array'

interface MD5Config {
  /** 文件块大小，默认为10MB */
  chunkSize?: number
}

function msgMD5(msg: string) {
  const md5 = CryptoJS.algo.MD5.create()

  return md5.finalize(msg).toString()
}

async function fileMD5(file: Blob, cfg?: MD5Config) {
  // 每块大小为10MB
  const { chunkSize = 10485760 } = cfg || {}

  // 创建MD5哈希算法实例

  const md5 = CryptoJS.algo.MD5.create()

  let i = 0
  while (i < file.size) {
    const { result } = await readFile(
      file.slice(i, i + chunkSize),
      'arrayBuffer'
    )

    // 将ArrayBuffer转换为WordArray
    md5.update(arrBufToWordArray(result))
    i += chunkSize
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
