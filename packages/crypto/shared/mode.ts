class BlockCipherMode {
  _cipher: any
  iv?: number[]

  prevBlock?: number[]

  /**
   * 创建模式
   * @param cipher 算法实例
   * @param iv 向量
   */
  constructor(cipher, iv: number[]) {
    this._cipher = cipher
    this.iv = iv
  }

  xorBlock(words: number[], offset: number, blockSize: number) {
    const _words = words
    let block: number[]

    const { iv } = this

    if (iv) {
      block = iv
      // iv用过一次后移除
      this.iv = undefined
    } else {
      block = this.prevBlock!
    }

    for (let i = 0; i < blockSize; i += 1) {
      _words[offset + i] ^= block[i]!
    }
  }
}

class EncryptCBCMode extends BlockCipherMode {
  constructor(cipher, iv) {
    super(cipher, iv)
  }

  processBlock(words: number[], offset: number) {
    const cipher = this._cipher
    const { blockSize } = cipher

    this.xorBlock(words, offset, blockSize)
    cipher.encryptBlock(words, offset)

    this.prevBlock = words.slice(offset, offset + blockSize)
  }
}

class DecryptCBCMode extends BlockCipherMode {
  constructor(cipher, iv: number[]) {
    super(cipher, iv)
  }

  processBlock(words: number[], offset: number) {
    // Shortcuts
    const cipher = this._cipher
    const { blockSize } = cipher

    // Remember this block to use with next block
    const thisBlock = words.slice(offset, offset + blockSize)

    // Decrypt and XOR
    cipher.decryptBlock(words, offset)
    this.xorBlock(words, offset, blockSize)

    // This block becomes the previous block
    this.prevBlock = thisBlock
  }
}
