/**
 * 数据输入类型
 * 支持字符串、ArrayBuffer、Uint8Array 和 File 类型
 */
export type DataInput = string | ArrayBuffer | Uint8Array | File

/**
 * 加密/解密选项基础接口
 */
export interface CryptoOptions {
  /** 密钥 */
  key: string | Uint8Array
  /** 初始化向量 */
  iv: Uint8Array
}

/**
 * 哈希结果类，提供多种格式输出
 */
export class HashResult {
  constructor(public readonly data: Uint8Array) {}

  /**
   * 转换为十六进制字符串
   */
  hex(): string {
    return Array.from(this.data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * 转换为 Base64 字符串
   */
  base64(): string {
    return btoa(String.fromCharCode(...Array.from(this.data)))
  }

  /**
   * 获取原始字节数组
   */
  bytes(): Uint8Array {
    return this.data
  }
}

/**
 * 密文结果类，提供多种格式输出
 */
export class CipherResult {
  constructor(public readonly data: Uint8Array) {}

  /**
   * 转换为十六进制字符串
   */
  toHex(): string {
    return Array.from(this.data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * 转换为 Base64 字符串
   */
  toBase64(): string {
    return btoa(String.fromCharCode(...Array.from(this.data)))
  }

  /**
   * 获取原始字节数组
   */
  toBytes(): Uint8Array {
    return this.data
  }
}

/**
 * 哈希器接口，用于增量哈希计算
 */
export interface Hasher {
  /**
   * 更新哈希器状态
   * @param data 要哈希的数据
   */
  update(data: DataInput): void

  /**
   * 完成哈希计算并返回结果
   */
  finish(): HashResult
}
