import { AESCore } from './core'
import type { AESMode } from './modes'
import type { AESPadding } from './padding'

/**
 * AES-CBC模式实现
 */
export class AES_CBC implements AESMode {
  constructor(private padding: AESPadding) {}

  async encrypt(
    data: Uint8Array,
    key: Uint8Array,
    iv?: Uint8Array
  ): Promise<Uint8Array> {
    if (!iv) {
      throw new Error('CBC模式需要提供初始化向量(iv)')
    }

    // 检查是否在浏览器环境
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      return this.encryptWithSubtle(data, key, iv)
    } else {
      return this.encryptWithJS(data, key, iv)
    }
  }

  async decrypt(
    data: Uint8Array,
    key: Uint8Array,
    iv?: Uint8Array
  ): Promise<Uint8Array> {
    if (!iv) {
      throw new Error('CBC模式需要提供初始化向量(iv)')
    }

    // 检查是否在浏览器环境
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      return this.decryptWithSubtle(data, key, iv)
    } else {
      return this.decryptWithJS(data, key, iv)
    }
  }

  private async encryptWithSubtle(
    data: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array
  ): Promise<Uint8Array> {
    // 使用Web Crypto API
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC', length: key.length * 8 },
      false,
      ['encrypt']
    )

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      cryptoKey,
      data
    )

    return new Uint8Array(encrypted)
  }

  private async decryptWithSubtle(
    data: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array
  ): Promise<Uint8Array> {
    // 使用Web Crypto API
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC', length: key.length * 8 },
      false,
      ['decrypt']
    )

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      cryptoKey,
      data
    )

    return new Uint8Array(decrypted)
  }

  private async encryptWithJS(
    data: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array
  ): Promise<Uint8Array> {
    // 使用AESCore实现纯JS的AES-CBC加密
    const aesCore = new AESCore(key)
    const paddedData = this.padding.pad(data, 16)
    const blocks = Math.ceil(paddedData.length / 16)
    const result = new Uint8Array(blocks * 16)

    // 初始化向量
    let previousBlock = new Uint8Array<ArrayBufferLike>(iv.buffer)

    // 逐块加密
    for (let i = 0; i < blocks; i++) {
      const start = i * 16
      const end = start + 16
      const block = paddedData.slice(start, end)

      // 与前一个密文块或IV进行XOR
      for (let j = 0; j < 16; j++) {
        if (previousBlock[j] !== undefined) {
          block[j] ^= previousBlock[j]
        }
      }

      // 加密
      const encryptedBlock = aesCore.encryptBlock(block)
      result.set(encryptedBlock, start)

      // 保存当前密文块作为下一轮的IV
      previousBlock = encryptedBlock
    }

    return result
  }

  private async decryptWithJS(
    data: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array
  ): Promise<Uint8Array> {
    // 使用AESCore实现纯JS的AES-CBC解密
    const aesCore = new AESCore(key)
    const blocks = Math.ceil(data.length / 16)
    const result = new Uint8Array(blocks * 16)

    // 初始化向量
    let previousBlock = new Uint8Array(iv)

    // 逐块解密
    for (let i = 0; i < blocks; i++) {
      const start = i * 16
      const end = start + 16
      const block = data.slice(start, end)

      // 保存当前密文块
      const currentBlock = new Uint8Array(block)

      // 解密
      const decryptedBlock = aesCore.decryptBlock(block)

      // 与前一个密文块或IV进行XOR
      for (let j = 0; j < 16; j++) {
        if (previousBlock[j] !== undefined && decryptedBlock[j] !== undefined) {
          decryptedBlock[j] ^= previousBlock[j]
        }
      }

      result.set(decryptedBlock, start)

      // 更新前一个密文块
      previousBlock = currentBlock
    }

    // 去除填充
    return this.padding.unpad(result)
  }
}
