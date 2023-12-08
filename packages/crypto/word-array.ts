import * as WordArray from 'crypto-js/lib-typedarrays'

// WordArray是由32位数字组成的数组
// 由于字符的最小存储单元是一个字节，也就是8位，
// 因此转化的要点在于将8位的typedArray转化为32位的WordArray



/**
 * 将类型化数组转化为WordArray
 * @param u8a类型数组
 * @returns crypto-js 加密所需的WordArray
 */
export function u8aToWordArray(u8a: Uint8Array): WordArray {
  const words: number[] = []

  let i = 0
  while (i < u8a.length) {
    // 将8位的typedArray转化为32位的WordArray
    // 每4个8位的typedArray转化为一个32位的WordArray

    words[i >>> 2] |= u8a[i]! << (24 - (i % 4) * 8)
    i++
  }

  return WordArray.create(words, u8a.byteLength)
}

/**
 * 将ArrayBuffer转化为WordArray
 * @param buffer ArrayBuffer
 * @returns crypto-js 加密所需的WordArray
 */
export function arrBufToWordArray(buffer: ArrayBufferLike): WordArray {
  return u8aToWordArray(new Uint8Array(buffer))
}
