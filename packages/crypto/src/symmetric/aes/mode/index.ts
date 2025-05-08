import { CBC } from './cbc'
import { GCM } from './gcm'

/**
 * AES加密模式类型
 */
export type AESModeType = typeof CBC | typeof GCM

/**
 * AES加密模式
 */
export const AES_MODE = {
  CBC,
  GCM
}

// 导出具体模式类
export { CBC, GCM }
