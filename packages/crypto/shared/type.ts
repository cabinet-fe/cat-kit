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


export interface HashConfig {
   /** 文件块大小(单位：字节)，默认为10MB(1024 * 1024 * 10) */
   chunkSize?: number
   /** 进度 */
   onProgress?(progress: number): void
}