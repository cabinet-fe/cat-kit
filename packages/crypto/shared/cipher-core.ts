import { BufferedBlockAlgorithm } from './algo'
import { XFORM_MODE } from './constants'
import type { CipherConfig, IWordArray } from './type'

abstract class Cipher extends BufferedBlockAlgorithm {
  _xformMode: number

  _key: IWordArray

  cfg?: CipherConfig

  constructor(xformMode: XFORM_MODE, key: IWordArray, cfg?: CipherConfig) {
    super()

    this.cfg = cfg
    this._xformMode = xformMode
    this._key = key

    this.reset()
  }

  abstract _doReset(): void
  abstract _doFinalize(): IWordArray

  override reset() {
    super.reset()
    this._doReset()
  }

  process(msg: string | IWordArray) {
    this._append(msg)
    return this._process()
  }

  finalize(msg?: string | IWordArray) {
    if (msg) {
      this._append(msg)
    }
    return this._doFinalize()
  }
}

abstract class StreamCipher extends Cipher {
  _doFinalize() {
    return this._process(true)
  }
}

export class BlockCipher extends Cipher {
  constructor(xformMode: number, key: IWordArray, cfg: CipherConfig) {
    super(
      xformMode,
      key,
      Object.assign(
        {
          mode: CBC,
          padding: Pkcs7
        },
        cfg
      )
    )

    this.blockSize = 128 / 32
  }

  override reset() {
    let modeCreator

    // Reset cipher
    super.reset.call(this)

    // Shortcuts
    const { iv, mode } = this.cfg || {}

    // Reset block mode
    if (this._xformMode === XFORM_MODE._DEC_XFORM_MODE) {
      modeCreator = mode.createEncryptor
    } else {
      modeCreator = mode.createDecryptor
      // Keep at least one block in the buffer for unpadding
      this._minBufferSize = 1
    }

    this._mode = modeCreator.call(mode, this, iv && iv.words)
    this._mode.__creator = modeCreator
  }

  _doProcessBlock(words, offset) {
    this._mode.processBlock(words, offset)
  }

  _doFinalize() {
    let finalProcessedBlocks

    // Shortcut
    const { padding } = this.cfg

    // Finalize
    if (this._xformMode === XFORM_MODE._ENC_XFORM_MODE) {
      // Pad data
      padding.pad(this._data, this.blockSize)

      // Process final blocks
      finalProcessedBlocks = this._process(!!'flush')
    } /* if (this._xformMode == this._DEC_XFORM_MODE) */ else {
      // Process final blocks
      finalProcessedBlocks = this._process(!!'flush')

      // Unpad data
      padding.unpad(finalProcessedBlocks)
    }

    return finalProcessedBlocks
  }
}
