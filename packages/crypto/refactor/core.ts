// 重新实现crypto-js中的Base对象
export class Base {
  constructor(...args: any[]) {}

  clone() {
    const result = this.constructor() as Base
    return Object.assign(result, this)
  }

  mixIn(properties: Record<string, any>) {
    return Object.assign(this, properties)
  }
}

export class WordArray extends Base {
  words: number[] = []

  sigBytes: number

  /**
   *  WordArray
   * @param words word数值表示法
   * @param sigBytes 有效字节
   */
  constructor(words: number[], sigBytes?: number) {
    super()
    this.words = words
    this.sigBytes = sigBytes ?? words.length * 4
  }

  override toString(encoder: Encoder = Hex): string {
    return encoder.stringify(this)
  }

  /** 移除无效位 */
  clamp() {
    const { words, sigBytes } = this

    words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8)
    words.length = Math.ceil(sigBytes / 4)
  }

  /**
   * 拼接wordArray
   * @param wordArray 另一个wordArray
   * @returns 返回当前wordArray自身
   */
  concat(wordArray: WordArray): WordArray {
    // 移除无效位
    this.clamp()

    // 拼接
    if (this.sigBytes % 4) {
      // Copy one byte at a time
      for (var i = 0; i < wordArray.sigBytes; i++) {
        var thatByte = (wordArray.words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff
        this.words[(this.sigBytes + i) >>> 2] |=
          thatByte << (24 - ((this.sigBytes + i) % 4) * 8)
      }
    } else {
      // Copy one word at a time
      for (var j = 0; j < wordArray.sigBytes; j += 4) {
        this.words[(this.sigBytes + j) >>> 2] = wordArray.words[j >>> 2]!
      }
    }
    this.sigBytes += wordArray.sigBytes

    // 链式
    return this
  }

  static random = (byteLen: number) => {
    const words: number[] = []

    const r = m_w => {
      let _m_w = m_w
      let _m_z = 0x3ade68b1
      const mask = 0xffffffff

      return () => {
        _m_z = (0x9069 * (_m_z & 0xffff) + (_m_z >> 0x10)) & mask
        _m_w = (0x4650 * (_m_w & 0xffff) + (_m_w >> 0x10)) & mask
        let result = ((_m_z << 0x10) + _m_w) & mask
        result /= 0x100000000
        result += 0.5
        return result * (Math.random() > 0.5 ? 1 : -1)
      }
    }

    for (let i = 0, rcache; i < byteLen; i += 4) {
      const _r = r((rcache || Math.random()) * 0x100000000)

      rcache = _r() * 0x3ade67b7
      words.push((_r() * 0x100000000) | 0)
    }

    return new WordArray(words, byteLen)
  }

  static create = (words: number[], sigBytes?: number) => {
    return new WordArray(words, sigBytes)
  }
}

// 编码------------------------------------------------------------

interface Encoder {
  stringify(wordArray: WordArray): string
  parse(str: string): WordArray
}

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
  stringify(wordArray: WordArray): string {
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
  parse(hexStr: string): WordArray {
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
  stringify(wordArray: WordArray): string {
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

export class BufferedBlockAlgorithm extends Base {
  _minBufferSize: number
  _data?: WordArray
  _nDataBytes?: number

  constructor() {
    super()
    this._minBufferSize = 0
  }

  /**
   *  重置分组加密算法的缓冲数据至初始状态
   */
  reset() {
    this._data = new WordArray([])
    this._nDataBytes = 0
  }

  /**
   * 添加新数据到缓冲区
   * @param data
   * @example
   * bufferedBlockAlgorithm._append('data')
   * bufferedBlockAlgorithm._append(wordArray)
   */
  _append(data: WordArray | string) {
    let m_data = data

    // Convert string to WordArray, else assume WordArray already
    if (typeof m_data === 'string') {
      m_data = Utf8.parse(m_data)
    }

    // Append
    this._data?.concat(m_data)

    this._nDataBytes += m_data.sigBytes
  }

  /**
   * Processes available data blocks.
   *
   * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
   *
   * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
   *
   * @return {WordArray} The processed data.
   *
   * @example
   *
   * var processedData = bufferedBlockAlgorithm._process();
   * var processedData = bufferedBlockAlgorithm._process(!!'flush');
   */
  _process(doFlush) {
    let processedWords

    // Shortcuts
    const { _data: data, blockSize } = this
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
      nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0)
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

  /**
   * Creates a copy of this object.
   *
   * @return {Object} The clone.
   *
   * @example
   *
   *     var clone = bufferedBlockAlgorithm.clone();
   */
  /**
   *
   * @returns
   */
  override clone() {
    const clone = super.clone.call(this)
    clone._data = this._data.clone()

    return clone
  }
}

/**
 * Abstract hasher template.
 *
 * @property {number} blockSize
 *
 *     The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
 */
export class Hasher extends BufferedBlockAlgorithm {
  constructor(cfg) {
    super()

    this.blockSize = 512 / 32

    /**
     * Configuration options.
     */
    this.cfg = Object.assign(new Base(), cfg)

    // Set initial values
    this.reset()
  }

  /**
   * Creates a shortcut function to a hasher's object interface.
   *
   * @param {Hasher} SubHasher The hasher to create a helper for.
   *
   * @return {Function} The shortcut function.
   *
   * @static
   *
   * @example
   *
   *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
   */
  static _createHelper(SubHasher) {
    return (message, cfg) => new SubHasher(cfg).finalize(message)
  }

  /**
   * Creates a shortcut function to the HMAC's object interface.
   *
   * @param {Hasher} SubHasher The hasher to use in this HMAC helper.
   *
   * @return {Function} The shortcut function.
   *
   * @static
   *
   * @example
   *
   *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
   */
  static _createHmacHelper(SubHasher) {
    return (message, key) => new HMAC(SubHasher, key).finalize(message)
  }

  /**
   * Resets this hasher to its initial state.
   *
   * @example
   *
   *     hasher.reset();
   */
  override reset() {
    // Reset data buffer
    super.reset.call(this)

    // Perform concrete-hasher logic
    this._doReset()
  }

  /**
   * Updates this hasher with a message.
   *
   * @param {WordArray|string} messageUpdate The message to append.
   *
   * @return {Hasher} This hasher.
   *
   * @example
   *
   *     hasher.update('message');
   *     hasher.update(wordArray);
   */
  update(messageUpdate) {
    // Append
    this._append(messageUpdate)

    // Update the hash
    this._process()

    // Chainable
    return this
  }

  /**
   * Finalizes the hash computation.
   * Note that the finalize operation is effectively a destructive, read-once operation.
   *
   * @param {WordArray|string} messageUpdate (Optional) A final message update.
   *
   * @return {WordArray} The hash.
   *
   * @example
   *
   *     var hash = hasher.finalize();
   *     var hash = hasher.finalize('message');
   *     var hash = hasher.finalize(wordArray);
   */
  finalize(messageUpdate) {
    // Final message update
    if (messageUpdate) {
      this._append(messageUpdate)
    }

    // Perform concrete-hasher logic
    const hash = this._doFinalize()

    return hash
  }
}

export class HMAC extends Base {
  /**
   * Initializes a newly created HMAC.
   *
   * @param {Hasher} SubHasher The hash algorithm to use.
   * @param {WordArray|string} key The secret key.
   *
   * @example
   *
   *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
   */
  constructor(SubHasher, key) {
    super()

    const hasher = new SubHasher()
    this._hasher = hasher

    // Convert string to WordArray, else assume WordArray already
    let _key = key
    if (typeof _key === 'string') {
      _key = Utf8.parse(_key)
    }

    // Shortcuts
    const hasherBlockSize = hasher.blockSize
    const hasherBlockSizeBytes = hasherBlockSize * 4

    // Allow arbitrary length keys
    if (_key.sigBytes > hasherBlockSizeBytes) {
      _key = hasher.finalize(key)
    }

    // Clamp excess bits
    _key.clamp()

    // Clone key for inner and outer pads
    const oKey = _key.clone()
    this._oKey = oKey
    const iKey = _key.clone()
    this._iKey = iKey

    // Shortcuts
    const oKeyWords = oKey.words
    const iKeyWords = iKey.words

    // XOR keys with pad constants
    for (let i = 0; i < hasherBlockSize; i += 1) {
      oKeyWords[i] ^= 0x5c5c5c5c
      iKeyWords[i] ^= 0x36363636
    }
    oKey.sigBytes = hasherBlockSizeBytes
    iKey.sigBytes = hasherBlockSizeBytes

    // Set initial values
    this.reset()
  }

  /**
   * Resets this HMAC to its initial state.
   *
   * @example
   *
   *     hmacHasher.reset();
   */
  reset() {
    // Shortcut
    const hasher = this._hasher

    // Reset
    hasher.reset()
    hasher.update(this._iKey)
  }

  /**
   * Updates this HMAC with a message.
   *
   * @param {WordArray|string} messageUpdate The message to append.
   *
   * @return {HMAC} This HMAC instance.
   *
   * @example
   *
   *     hmacHasher.update('message');
   *     hmacHasher.update(wordArray);
   */
  update(messageUpdate) {
    this._hasher.update(messageUpdate)

    // Chainable
    return this
  }

  /**
   * Finalizes the HMAC computation.
   * Note that the finalize operation is effectively a destructive, read-once operation.
   *
   * @param {WordArray|string} messageUpdate (Optional) A final message update.
   *
   * @return {WordArray} The HMAC.
   *
   * @example
   *
   *     var hmac = hmacHasher.finalize();
   *     var hmac = hmacHasher.finalize('message');
   *     var hmac = hmacHasher.finalize(wordArray);
   */
  finalize(messageUpdate) {
    // Shortcut
    const hasher = this._hasher

    // Compute HMAC
    const innerHash = hasher.finalize(messageUpdate)
    hasher.reset()
    const hmac = hasher.finalize(this._oKey.clone().concat(innerHash))

    return hmac
  }
}
