import { WordArray } from './word-array'
import { Utf8 } from './enc'

/**
 * 分组加密算法的基类
 */
export abstract class BufferedBlockAlgorithm {
  minBufferSize = 0

  data!: WordArray

  dataBytes!: number

  blockSize!: number

  reset() {
    this.data = new WordArray([])
    this.dataBytes = 0
  }

  /**
   * 添加新数据到缓冲区
   * @param data
   * @example
   * bufferedBlockAlgorithm._append('data')
   * bufferedBlockAlgorithm._append(wordArray)
   */
  _append(data: WordArray | string) {
    if (typeof data === 'string') {
      data = Utf8.parse(data)
    }

    this.data.concat(data)

    this.dataBytes += data.sigBytes
  }

  /** 处理块抽象实现 */
  abstract _doProcessBlock(words: number[], offsetSize: number): void
  /**
   * 处理可用数据块。
   * 此方法调用 _doProcessBlock(offset) ，它必须由具体的子类型实现。
   * @param  doFlush 是否处理所有块和部分块。
   */
  _process(doFlush?: boolean): WordArray {
    let processedWords: number[] = []

    const { data, blockSize } = this
    const dataWords = data.words
    const dataSigBytes = data.sigBytes
    const blockSizeBytes = blockSize * 4

    // Count blocks ready
    let nBlocksReady = dataSigBytes / blockSizeBytes
    if (doFlush) {
      // Round up to include partial blocks
      nBlocksReady = Math.ceil(nBlocksReady)
    } else {
      // Round down to include only full blocks,
      // less the number of blocks that must remain in the buffer
      nBlocksReady = Math.max((nBlocksReady | 0) - this.minBufferSize, 0)
    }

    // Count words ready
    const nWordsReady = nBlocksReady * blockSize

    // Count bytes ready
    const nBytesReady = Math.min(nWordsReady * 4, dataSigBytes)

    // Process blocks
    if (nWordsReady) {
      for (let offset = 0; offset < nWordsReady; offset += blockSize) {
        // Perform concrete-algorithm logic
        this._doProcessBlock(dataWords, offset)
      }

      // Remove processed words
      processedWords = dataWords.splice(0, nWordsReady)
      data.sigBytes -= nBytesReady
    }

    // Return processed words
    return new WordArray(processedWords, nBytesReady)
  }
}

export abstract class Hasher extends BufferedBlockAlgorithm {
  constructor() {
    super()
    this.blockSize = 512 / 32
    this.reset()
  }

  abstract _doReset(): void

  override reset(): void {
    super.reset.call(this)
    this._doReset()
    // FIXME
  }

  /**
   * 更新数据
   * @param message 消息
   * @returns
   */
  update(message: string | WordArray) {
    this._append(message)
    this._process()
    return this
  }

  /** 最终处理 */
  abstract _doFinalize(): WordArray

  finalize(message?: string | WordArray) {
    message && this._append(message)
    return this._doFinalize()
  }
}

export abstract class HMAC extends BufferedBlockAlgorithm {}
