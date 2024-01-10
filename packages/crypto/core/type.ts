/** 文字数组 */
export interface IWordArray {
  /** 文字的32位数字数组 */
  words: number[]
  /** 有效字节 */
  sigBytes: number

  /** 移除无效位 */
  clamp(): void

  /**
   * 拼接wordArray
   * @param wordArray 另一个wordArray
   */
  concat(wordArray: IWordArray): IWordArray
}

/** 编码器 */
export interface Encoder {
  parse(str: string): IWordArray
  stringify(wordArray: IWordArray): string
}