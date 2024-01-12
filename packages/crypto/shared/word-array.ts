import { getSecureRandomValues } from './helper'
import type { IWordArray } from './type'

export class WordArray implements IWordArray {
  words: number[]

  sigBytes: number

  /**
   * WordArray
   * @param words word数值表示法
   * @param sigBytes 有效字节
   */
  constructor(words: number[], sigBytes?: number) {
    this.words = words
    this.sigBytes = sigBytes ?? words.length * 4
  }

  clamp() {
    const { words, sigBytes } = this
    words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8)
    words.length = Math.ceil(sigBytes / 4)
  }

  concat(wordArray: WordArray): WordArray {
    // 移除无效位
    this.clamp()
    const thisSigBytes = this.sigBytes

    if (thisSigBytes % 4) {
      // 一次拷贝一个字
      for (let i = 0; i < wordArray.sigBytes; i++) {
        let thatByte = (wordArray.words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff
        this.words[(thisSigBytes + i) >>> 2] |=
          thatByte << (24 - ((thisSigBytes + i) % 4) * 8)
      }
    } else {
      // 一次拷贝一个字
      for (let j = 0; j < wordArray.sigBytes; j += 4) {
        this.words[(thisSigBytes + j) >>> 2] = wordArray.words[j >>> 2]!
      }
    }
    this.sigBytes += wordArray.sigBytes
    // 链式
    return this
  }

  /**
   *  生成指定长度的随机wordArray
   * @param byteLen 字节长度
   * @returns
   */
  static random(byteLen: number): WordArray {
    const words: number[] = []

    for (let i = 0; i < byteLen; i += 4) {
      words.push(getSecureRandomValues())
    }

    return new WordArray(words, byteLen)
  }
}

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

  return new WordArray(words, u8a.byteLength)
}

/**
 * 将ArrayBuffer转化为WordArray
 * @param buffer ArrayBuffer
 * @returns crypto-js 加密所需的WordArray
 */
export function arrBufToWordArray(buffer: ArrayBufferLike): WordArray {
  return u8aToWordArray(new Uint8Array(buffer))
}
