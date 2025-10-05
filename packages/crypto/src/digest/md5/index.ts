import type { DataInput } from '../../base/types'
import { HashResult } from '../../base/types'
import { toUint8Array } from '../../base/utils'
import { MD5Hasher } from './hasher'

/**
 * MD5 哈希选项
 */
export interface MD5Options {
  /** 分块大小（字节），用于处理大文件，默认 2MB */
  chunkSize?: number
}

/**
 * 计算 MD5 哈希值
 * @param data 要哈希的数据
 * @param options 选项
 * @returns 哈希结果
 *
 * @example
 * // 普通字符串
 * const hash1 = md5('hello world').hex()
 *
 * // 文件
 * const hash2 = md5(file, { chunkSize: 2 * 1024 * 1024 }).hex()
 */
export function md5(data: DataInput, options?: MD5Options): HashResult {
  // 如果是 File 对象，返回一个可以增量处理的 Promise
  if (data instanceof File) {
    throw new Error(
      '对于 File 对象，请使用 md5.hasher() 创建哈希器并手动处理分块'
    )
  }

  const hasher = new MD5Hasher()
  hasher.update(data)
  return hasher.finish()
}

/**
 * 创建一个 MD5 哈希器实例
 * 用于增量处理数据，特别适合处理大文件
 *
 * @example
 * const hasher = md5.hasher()
 * hasher.update('hello')
 * hasher.update(' ')
 * hasher.update('world')
 * const hash = hasher.finish().hex()
 */
md5.hasher = function (): MD5Hasher {
  return new MD5Hasher()
}

export { MD5Hasher }
