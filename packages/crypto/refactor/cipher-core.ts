/* eslint-disable no-use-before-define */

import { Base, WordArray, BufferedBlockAlgorithm } from './core'
import { Base64 } from './enc-base64.js'
import { EvpKDFAlgo } from './evpkdf.js'

/**
 * Abstract base cipher template.
 *
 * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
 * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
 * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
 * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
 */

export class Cipher extends BufferedBlockAlgorithm {
  static _ENC_XFORM_MODE = 1
  static _DEC_XFORM_MODE = 2

  /**
   * 密钥的size.
   * @default 4(16字节, 128位)
   */
  static keySize = 128 / 32

   /**
   * 初始化向量的size.
   * @default 4(16字节, 128位)
   */
  static ivSize = 128 / 32
}


/**
 * Abstract base stream cipher template.
 *
 * @property {number} blockSize
 *
 *     The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
 */
export class StreamCipher extends Cipher {}

/**
 * Abstract base block cipher mode template.
 */
export class BlockCipherMode extends Base {}

function xorBlock(words, offset, blockSize) {}

/**
 * Cipher Block Chaining mode.
 */

/**
 * Abstract base CBC mode.
 */
export class CBC extends BlockCipherMode {}
/**
 * CBC encryptor.
 */
CBC.Encryptor = class extends CBC {
  /**
   * Processes the data block at offset.
   *
   * @param {Array} words The data words to operate on.
   * @param {number} offset The offset where the block starts.
   *
   * @example
   *
   *     mode.processBlock(data.words, offset);
   */
  processBlock(words, offset) {}
}
/**
 * CBC decryptor.
 */
CBC.Decryptor = class extends CBC {
  /**
   * Processes the data block at offset.
   *
   * @param {Array} words The data words to operate on.
   * @param {number} offset The offset where the block starts.
   *
   * @example
   *
   *     mode.processBlock(data.words, offset);
   */
  processBlock(words, offset) {}
}

/**
 * PKCS #5/7 padding strategy.
 */
export const Pkcs7 = {
  /**
   * Pads data using the algorithm defined in PKCS #5/7.
   *
   * @param {WordArray} data The data to pad.
   * @param {number} blockSize The multiple that the data should be padded to.
   *
   * @static
   *
   * @example
   *
   *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
   */
  pad(data, blockSize) {},

  /**
   * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
   *
   * @param {WordArray} data The data to unpad.
   *
   * @static
   *
   * @example
   *
   *     CryptoJS.pad.Pkcs7.unpad(wordArray);
   */
  unpad(data) {
    const _data = data

    // Get number of padding bytes from last byte
    const nPaddingBytes = _data.words[(_data.sigBytes - 1) >>> 2] & 0xff

    // Remove padding
    _data.sigBytes -= nPaddingBytes
  }
}

/**
 * Abstract base block cipher template.
 *
 * @property {number} blockSize
 *
 *    The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
 */
export class BlockCipher extends Cipher {
  constructor(xformMode, key, cfg) {
    /**
     * Configuration options.
     *
     * @property {Mode} mode The block mode to use. Default: CBC
     * @property {Padding} padding The padding strategy to use. Default: Pkcs7
     */
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

  reset() {
    let modeCreator

    // Reset cipher
    super.reset.call(this)

    // Shortcuts
    const { cfg } = this
    const { iv, mode } = cfg

    // Reset block mode
    if (this._xformMode === this.constructor._ENC_XFORM_MODE) {
      modeCreator = mode.createEncryptor
    } /* if (this._xformMode == this._DEC_XFORM_MODE) */ else {
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
    if (this._xformMode === this.constructor._ENC_XFORM_MODE) {
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

/**
 * A collection of cipher parameters.
 *
 * @property {WordArray} ciphertext The raw ciphertext.
 * @property {WordArray} key The key to this ciphertext.
 * @property {WordArray} iv The IV used in the ciphering operation.
 * @property {WordArray} salt The salt used with a key derivation function.
 * @property {Cipher} algorithm The cipher algorithm.
 * @property {Mode} mode The block mode used in the ciphering operation.
 * @property {Padding} padding The padding scheme used in the ciphering operation.
 * @property {number} blockSize The block size of the cipher.
 * @property {Format} formatter
 *    The default formatting strategy to convert this cipher params object to a string.
 */
export class CipherParams extends Base {
  /**
   * Initializes a newly created cipher params object.
   *
   * @param {Object} cipherParams An object with any of the possible cipher parameters.
   *
   * @example
   *
   *     var cipherParams = CryptoJS.lib.CipherParams.create({
   *         ciphertext: ciphertextWordArray,
   *         key: keyWordArray,
   *         iv: ivWordArray,
   *         salt: saltWordArray,
   *         algorithm: CryptoJS.algo.AES,
   *         mode: CryptoJS.mode.CBC,
   *         padding: CryptoJS.pad.PKCS7,
   *         blockSize: 4,
   *         formatter: CryptoJS.format.OpenSSL
   *     });
   */
  constructor(cipherParams) {
    super()

    this.mixIn(cipherParams)
  }

  /**
   * Converts this cipher params object to a string.
   *
   * @param {Format} formatter (Optional) The formatting strategy to use.
   *
   * @return {string} The stringified cipher params.
   *
   * @throws Error If neither the formatter nor the default formatter is set.
   *
   * @example
   *
   *     var string = cipherParams + '';
   *     var string = cipherParams.toString();
   *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
   */
  toString(formatter) {
    return (formatter || this.formatter).stringify(this)
  }
}

/**
 * OpenSSL formatting strategy.
 */
export const OpenSSLFormatter = {
  /**
   * Converts a cipher params object to an OpenSSL-compatible string.
   *
   * @param {CipherParams} cipherParams The cipher params object.
   *
   * @return {string} The OpenSSL-compatible string.
   *
   * @static
   *
   * @example
   *
   *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
   */
  stringify(cipherParams) {
    let wordArray

    // Shortcuts
    const { ciphertext, salt } = cipherParams

    // Format
    if (salt) {
      wordArray = WordArray.create([0x53616c74, 0x65645f5f])
        .concat(salt)
        .concat(ciphertext)
    } else {
      wordArray = ciphertext
    }

    return wordArray.toString(Base64)
  },

  /**
   * Converts an OpenSSL-compatible string to a cipher params object.
   *
   * @param {string} openSSLStr The OpenSSL-compatible string.
   *
   * @return {CipherParams} The cipher params object.
   *
   * @static
   *
   * @example
   *
   *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
   */
  parse(openSSLStr) {
    let salt

    // Parse base64
    const ciphertext = Base64.parse(openSSLStr)

    // Shortcut
    const ciphertextWords = ciphertext.words

    // Test for salt
    if (
      ciphertextWords[0] === 0x53616c74 &&
      ciphertextWords[1] === 0x65645f5f
    ) {
      // Extract salt
      salt = WordArray.create(ciphertextWords.slice(2, 4))

      // Remove salt from ciphertext
      ciphertextWords.splice(0, 4)
      ciphertext.sigBytes -= 16
    }

    return CipherParams.create({ ciphertext, salt })
  }
}

/**
 * A cipher wrapper that returns ciphertext as a serializable cipher params object.
 */
export class SerializableCipher extends Base {
  /**
   * Encrypts a message.
   *
   * @param {Cipher} cipher The cipher algorithm to use.
   * @param {WordArray|string} message The message to encrypt.
   * @param {WordArray} key The key.
   * @param {Object} cfg (Optional) The configuration options to use for this operation.
   *
   * @return {CipherParams} A cipher params object.
   *
   * @static
   *
   * @example
   *
   *     var ciphertextParams = CryptoJS.lib.SerializableCipher
   *       .encrypt(CryptoJS.algo.AES, message, key);
   *     var ciphertextParams = CryptoJS.lib.SerializableCipher
   *       .encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
   *     var ciphertextParams = CryptoJS.lib.SerializableCipher
   *       .encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
   */
  static encrypt(cipher, message, key, cfg) {
    // Apply config defaults
    const _cfg = Object.assign(new Base(), this.cfg, cfg)

    // Encrypt
    const encryptor = cipher.createEncryptor(key, _cfg)
    const ciphertext = encryptor.finalize(message)

    // Shortcut
    const cipherCfg = encryptor.cfg

    // Create and return serializable cipher params
    return CipherParams.create({
      ciphertext,
      key,
      iv: cipherCfg.iv,
      algorithm: cipher,
      mode: cipherCfg.mode,
      padding: cipherCfg.padding,
      blockSize: encryptor.blockSize,
      formatter: _cfg.format
    })
  }

  /**
   * Decrypts serialized ciphertext.
   *
   * @param {Cipher} cipher The cipher algorithm to use.
   * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
   * @param {WordArray} key The key.
   * @param {Object} cfg (Optional) The configuration options to use for this operation.
   *
   * @return {WordArray} The plaintext.
   *
   * @static
   *
   * @example
   *
   *     var plaintext = CryptoJS.lib.SerializableCipher
   *       .decrypt(CryptoJS.algo.AES, formattedCiphertext, key,
   *         { iv: iv, format: CryptoJS.format.OpenSSL });
   *     var plaintext = CryptoJS.lib.SerializableCipher
   *       .decrypt(CryptoJS.algo.AES, ciphertextParams, key,
   *         { iv: iv, format: CryptoJS.format.OpenSSL });
   */
  static decrypt(cipher, ciphertext, key, cfg) {
    let _ciphertext = ciphertext

    // Apply config defaults
    const _cfg = Object.assign(new Base(), this.cfg, cfg)

    // Convert string to CipherParams
    _ciphertext = this._parse(_ciphertext, _cfg.format)

    // Decrypt
    const plaintext = cipher
      .createDecryptor(key, _cfg)
      .finalize(_ciphertext.ciphertext)

    return plaintext
  }

  /**
   * Converts serialized ciphertext to CipherParams,
   * else assumed CipherParams already and returns ciphertext unchanged.
   *
   * @param {CipherParams|string} ciphertext The ciphertext.
   * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
   *
   * @return {CipherParams} The unserialized ciphertext.
   *
   * @static
   *
   * @example
   *
   *     var ciphertextParams = CryptoJS.lib.SerializableCipher
   *       ._parse(ciphertextStringOrParams, format);
   */
  static _parse(ciphertext, format) {
    if (typeof ciphertext === 'string') {
      return format.parse(ciphertext, this)
    }
    return ciphertext
  }
}
/**
 * Configuration options.
 *
 * @property {Formatter} format
 *
 *    The formatting strategy to convert cipher param objects to and from a string.
 *    Default: OpenSSL
 */
SerializableCipher.cfg = Object.assign(new Base(), { format: OpenSSLFormatter })

/**
 * OpenSSL key derivation function.
 */
export const OpenSSLKdf = {
  /**
   * Derives a key and IV from a password.
   *
   * @param {string} password The password to derive from.
   * @param {number} keySize The size in words of the key to generate.
   * @param {number} ivSize The size in words of the IV to generate.
   * @param {WordArray|string} salt
   *     (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
   *
   * @return {CipherParams} A cipher params object with the key, IV, and salt.
   *
   * @static
   *
   * @example
   *
   *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
   *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
   */
  execute(password, keySize, ivSize, salt, hasher) {
    let _salt = salt

    // Generate random salt
    if (!_salt) {
      _salt = WordArray.random(64 / 8)
    }

    // Derive key and IV
    let key
    if (!hasher) {
      key = EvpKDFAlgo.create({ keySize: keySize + ivSize }).compute(
        password,
        _salt
      )
    } else {
      key = EvpKDFAlgo.create({ keySize: keySize + ivSize, hasher }).compute(
        password,
        _salt
      )
    }

    // Separate key and IV
    const iv = WordArray.create(key.words.slice(keySize), ivSize * 4)
    key.sigBytes = keySize * 4

    // Return params
    return CipherParams.create({ key, iv, salt: _salt })
  }
}

/**
 * A serializable cipher wrapper that derives the key from a password,
 * and returns ciphertext as a serializable cipher params object.
 */
export class PasswordBasedCipher extends SerializableCipher {
  /**
   * Encrypts a message using a password.
   *
   * @param {Cipher} cipher The cipher algorithm to use.
   * @param {WordArray|string} message The message to encrypt.
   * @param {string} password The password.
   * @param {Object} cfg (Optional) The configuration options to use for this operation.
   *
   * @return {CipherParams} A cipher params object.
   *
   * @static
   *
   * @example
   *
   *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher
   *       .encrypt(CryptoJS.algo.AES, message, 'password');
   *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher
   *       .encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
   */
  static encrypt(cipher, message, password, cfg) {
    // Apply config defaults
    const _cfg = Object.assign(new Base(), this.cfg, cfg)

    // Derive key and other params
    const derivedParams = _cfg.kdf.execute(
      password,
      cipher.keySize,
      cipher.ivSize,
      _cfg.salt,
      _cfg.hasher
    )

    // Add IV to config
    _cfg.iv = derivedParams.iv

    // Encrypt
    const ciphertext = SerializableCipher.encrypt.call(
      this,
      cipher,
      message,
      derivedParams.key,
      _cfg
    )

    // Mix in derived params
    ciphertext.mixIn(derivedParams)

    return ciphertext
  }

  /**
   * Decrypts serialized ciphertext using a password.
   *
   * @param {Cipher} cipher The cipher algorithm to use.
   * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
   * @param {string} password The password.
   * @param {Object} cfg (Optional) The configuration options to use for this operation.
   *
   * @return {WordArray} The plaintext.
   *
   * @static
   *
   * @example
   *
   *     var plaintext = CryptoJS.lib.PasswordBasedCipher
   *       .decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password',
   *         { format: CryptoJS.format.OpenSSL });
   *     var plaintext = CryptoJS.lib.PasswordBasedCipher
   *       .decrypt(CryptoJS.algo.AES, ciphertextParams, 'password',
   *         { format: CryptoJS.format.OpenSSL });
   */
  static decrypt(cipher, ciphertext, password, cfg) {
    let _ciphertext = ciphertext

    // Apply config defaults
    const _cfg = Object.assign(new Base(), this.cfg, cfg)

    // Convert string to CipherParams
    _ciphertext = this._parse(_ciphertext, _cfg.format)

    // Derive key and other params
    const derivedParams = _cfg.kdf.execute(
      password,
      cipher.keySize,
      cipher.ivSize,
      _ciphertext.salt,
      _cfg.hasher
    )

    // Add IV to config
    _cfg.iv = derivedParams.iv

    // Decrypt
    const plaintext = SerializableCipher.decrypt.call(
      this,
      cipher,
      _ciphertext,
      derivedParams.key,
      _cfg
    )

    return plaintext
  }
}
/**
 * Configuration options.
 *
 * @property {KDF} kdf
 *     The key derivation function to use to generate a key and IV from a password.
 *     Default: OpenSSL
 */
PasswordBasedCipher.cfg = Object.assign(SerializableCipher.cfg, {
  kdf: OpenSSLKdf
})
