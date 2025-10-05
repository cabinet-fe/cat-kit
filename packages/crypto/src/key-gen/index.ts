// 代码来自于 https://github.com/ai/nanoid

import { isInNode } from '@cat-kit/core'
import { urlAlphabet } from './url-alphabet'

// Node.js 环境的池优化
const POOL_SIZE_MULTIPLIER = 128
let pool: Uint8Array
let poolOffset: number

/**
 * Node.js 环境的池填充
 */
function fillPool(bytes: number) {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER)
    crypto.getRandomValues(pool)
    poolOffset = 0
  } else if (poolOffset + bytes > pool.length) {
    crypto.getRandomValues(pool)
    poolOffset = 0
  }
  poolOffset += bytes
}

/**
 * 生成指定字节数的加密安全随机值
 * @param bytes 要生成的随机字节数
 * @returns 包含随机值的 Uint8Array
 *
 * @example
 * const randomBytes = random(32) // 生成 32 字节随机数据
 */
export function random(bytes: number): Uint8Array {
  // Node.js 环境使用池优化
  if (isInNode()) {
    // `|=` convert `bytes` to number to prevent `valueOf` abusing and pool pollution
    fillPool((bytes |= 0))
    return pool.subarray(poolOffset - bytes, poolOffset)
  }

  // 浏览器环境直接生成
  return crypto.getRandomValues(new Uint8Array(bytes))
}

/**
 * 使用自定义字母表和随机生成器创建 ID 生成函数
 * @param alphabet 用于生成 ID 的字符集
 * @param defaultSize ID 的默认长度
 * @param getRandom 自定义随机字节生成函数
 * @returns 返回一个 ID 生成函数，可选参数指定生成的 ID 长度
 */
export function customRandom(
  alphabet: string,
  defaultSize: number,
  getRandom: (bytes: number) => Uint8Array
): (size?: number) => string {
  // 首先，生成 ID 需要一个位掩码。位掩码使字节值更接近字母表大小。
  // 位掩码计算最接近且超过字母表大小的 `2^31 - 1` 数字。
  // 例如，字母表大小为 30 时，位掩码为 31 (00011111)。

  const mask = isInNode()
    ? (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
    : (2 << Math.log2(alphabet.length - 1)) - 1

  // 然而，位掩码解决方案并不完美，因为超出字母表大小的字节会被拒绝。
  // 因此，为了可靠地生成 ID，必须满足随机字节的冗余。

  // 注意：每次硬件随机生成器调用都很耗性能，
  // 因为系统调用熵收集需要大量时间。
  // 所以，为了避免额外的系统调用，会提前请求额外的字节。

  // 接下来，确定需要生成多少随机字节的步长。
  // 随机字节的数量由 ID 大小、掩码、字母表大小和魔数 1.6 决定
  // (根据基准测试，使用 1.6 时性能最佳)。

  const step = isInNode()
    ? Math.ceil((1.6 * mask * defaultSize) / alphabet.length)
    : -~((1.6 * mask * defaultSize) / alphabet.length)

  return (size = defaultSize) => {
    let id = ''
    while (true) {
      const bytes = getRandom(step)
      // `for (var i = 0; i < step; i++)` 的紧凑替代写法
      let j = step | 0
      while (j--) {
        // 添加 `|| ''` 会拒绝超出字母表大小的随机字节
        id += alphabet[bytes[j]! & mask] || ''
        if (id.length >= size) return id
      }
    }
  }
}

/**
 * 使用自定义字母表创建 ID 生成函数
 * @param alphabet 用于生成 ID 的字符集
 * @param size ID 的默认长度，默认为 21
 * @returns 返回一个 ID 生成函数，可选参数指定生成的 ID 长度
 * @example
 * const generateId = customAlphabet('0123456789abcdef', 16)
 * const id = generateId() // 生成 16 位十六进制 ID
 */
export function customAlphabet(
  alphabet: string,
  size = 21
): (size?: number) => string {
  return customRandom(alphabet, size | 0, random)
}

/**
 * 生成 URL 友好的唯一 ID
 * 使用加密安全的随机生成器和 URL 安全字符集生成 ID
 * @param size ID 的长度，默认为 21
 * @returns 生成的唯一 ID 字符串
 * @example
 * const id1 = nanoid() // 生成 21 位 ID
 * const id2 = nanoid(10) // 生成 10 位 ID
 */
export function nanoid(size = 21): string {
  // Node.js 环境使用池优化
  if (isInNode()) {
    // `|=` convert `size` to number to prevent `valueOf` abusing and pool pollution
    fillPool((size |= 0))
    let id = ''
    // We are reading directly from the random pool to avoid creating new array
    for (let i = poolOffset - size; i < poolOffset; i++) {
      // It is incorrect to use bytes exceeding the alphabet size.
      // The following mask reduces the random byte in the 0-255 value
      // range to the 0-63 value range. Therefore, adding hacks, such
      // as empty string fallback or magic numbers, is unnecessary because
      // the bitmask trims bytes down to the alphabet size.
      id += urlAlphabet[pool[i]! & 63]
    }
    return id
  }

  // 浏览器环境直接生成
  let id = ''
  const bytes = crypto.getRandomValues(new Uint8Array((size |= 0)))
  while (size--) {
    // 使用按位 与 运算符将随机字节的值从 255 "限制" 到 63，
    // 这样可以确保该值是 "chars" 字符串的有效索引。
    id += urlAlphabet[bytes[size]! & 63]
  }
  return id
}
