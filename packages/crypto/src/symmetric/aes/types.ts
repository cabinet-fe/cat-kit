import type { CryptoOptions } from '../../base/types'

/**
 * AES 加密模式
 */
export enum AES_MODE {
  /** CBC 模式 - 密码块链接模式 */
  CBC = 'CBC',
  /** GCM 模式 - 伽罗瓦/计数器模式 */
  GCM = 'GCM'
}

/**
 * AES 填充方式
 */
export enum AES_PADDING {
  /** PKCS7 填充 */
  PKCS7 = 'PKCS7',
  /** 零填充 */
  Zero = 'Zero',
  /** 不填充 */
  None = 'None'
}

/**
 * AES 加密选项
 */
export interface AESOptions extends CryptoOptions {
  /** 加密模式 */
  mode: AES_MODE
  /** 填充方式 */
  padding: AES_PADDING
  /** GCM 模式的认证标签（仅解密时需要，加密时自动生成） */
  tag?: Uint8Array
  /** GCM 模式的附加认证数据（可选） */
  aad?: Uint8Array
}

/**
 * AES 密钥长度（位）
 */
export enum AES_KEY_SIZE {
  AES_128 = 128,
  AES_192 = 192,
  AES_256 = 256
}
