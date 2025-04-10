import type { AESMode } from './modes'

/**
 * AES-GCM模式实现
 */
export class AES_GCM implements AESMode {
  async encrypt(
    data: Uint8Array,
    key: Uint8Array,
    iv?: Uint8Array
  ): Promise<Uint8Array> {
    if (!iv) {
      throw new Error('GCM模式需要提供初始化向量(iv)')
    }

    // 检查是否在浏览器环境且是HTTPS
    if (location?.protocol === 'https:' && crypto?.subtle) {
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
      throw new Error('GCM模式需要提供初始化向量(iv)')
    }

    // 检查是否在浏览器环境且是HTTPS
    if (
      typeof window !== 'undefined' &&
      window.location?.protocol === 'https:' &&
      window.crypto?.subtle
    ) {
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
      { name: 'AES-GCM', length: key.length * 8 },
      false,
      ['encrypt']
    )

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
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
      { name: 'AES-GCM', length: key.length * 8 },
      false,
      ['decrypt']
    )

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
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
    // 由于GCM模式复杂度较高，这里仍然抛出错误
    // 实际项目中应该实现完整的GCM模式
    throw new Error('纯JS的AES-GCM加密尚未实现，请在HTTPS环境中使用')
  }

  private async decryptWithJS(
    data: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array
  ): Promise<Uint8Array> {
    // 由于GCM模式复杂度较高，这里仍然抛出错误
    // 实际项目中应该实现完整的GCM模式
    throw new Error('纯JS的AES-GCM解密尚未实现，请在HTTPS环境中使用')
  }
}
