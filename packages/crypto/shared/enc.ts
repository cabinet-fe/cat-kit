import { WordArray } from './word-array'
import type { Encoder } from './type'

function defineEncoder<Enc extends Encoder>(encoder: Enc): Enc {
  return encoder
}

export const Hex = defineEncoder({
  /**
   * 将wordArray转化为16进制字符串
   * @param wordArray
   * @returns 16进制字符串
   * @example
   * const hexString = Hex.stringify(wordArray)
   */
  stringify(wordArray: WordArray) {
    // Shortcuts
    const { words, sigBytes } = wordArray

    // Convert
    const hexChars: string[] = []
    for (let i = 0; i < sigBytes; i += 1) {
      const bite = (words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff
      hexChars.push((bite >>> 4).toString(16))
      hexChars.push((bite & 0x0f).toString(16))
    }

    return hexChars.join('')
  },

  /**
   * 将16进制字符串转化为wordArray
   * @param hexStr 16进制字符串
   * @returns wordArray
   * @example
   * const wordArray = Hex.parse(hexStr)
   */
  parse(hexStr: string) {
    // Shortcut
    const hexStrLength = hexStr.length

    // Convert
    const words: number[] = []
    for (let i = 0; i < hexStrLength; i += 2) {
      words[i >>> 3] |=
        parseInt(hexStr.slice(i, i + 2), 16) << (24 - (i % 8) * 4)
    }

    return new WordArray(words, hexStrLength / 2)
  }
})

export const Latin1 = defineEncoder({
  /**
   * 将wordArray转化为latin1字符串
   * @param wordArray
   * @returns
   * @example
   * const latin1String = Latin1.stringify(wordArray);
   */
  stringify(wordArray: WordArray) {
    // Shortcuts
    const { words, sigBytes } = wordArray

    // Convert
    const latin1Chars: string[] = []
    for (let i = 0; i < sigBytes; i += 1) {
      const bite = (words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff
      latin1Chars.push(String.fromCharCode(bite))
    }

    return latin1Chars.join('')
  },

  /**
   * 将latin1字符串转化为wordArray
   * @param latin1Str
   * @returns
   * @example
   * const wordArray = Latin1.parse(latin1String);
   */
  parse(latin1Str) {
    // Shortcut
    const latin1StrLength = latin1Str.length

    // Convert
    const words: number[] = []
    for (let i = 0; i < latin1StrLength; i += 1) {
      words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8)
    }

    return new WordArray(words, latin1StrLength)
  }
})

export const Utf8 = defineEncoder({
  /**
   * 将wordArray转化为UTF-8字符串
   * @param wordArray
   * @returns
   * @example
   * const utf8String = Utf8.stringify(wordArray)
   */
  stringify(wordArray) {
    try {
      return decodeURIComponent(escape(Latin1.stringify(wordArray)))
    } catch (e) {
      throw new Error('Malformed UTF-8 data')
    }
  },

  /**
   * 将UTF-8字符串转化为wordArray
   * @param utf8Str utf8字符串
   * @returns wordArray
   */
  parse(utf8Str) {
    return Latin1.parse(unescape(encodeURIComponent(utf8Str)))
  }
})
