import { str2u8a } from '@cat-kit/core'
import { CipherResult } from '../../base/types'
import { AES_MODE, type AESOptions } from './types'
import { addPadding, removePadding } from './padding'

/**
 * 获取密钥的字节数组
 */
function getKeyBytes(key: string | Uint8Array): Uint8Array {
  if (typeof key === 'string') {
    return str2u8a(key)
  }
  return key
}

/**
 * 导入密钥
 */
async function importKey(
  keyData: Uint8Array,
  algorithm: string
): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    keyData as BufferSource,
    { name: algorithm },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 使用 Web Crypto API 进行 AES-CBC 加密
 */
async function encryptCBC(
  data: Uint8Array,
  options: AESOptions
): Promise<CipherResult> {
  const keyBytes = getKeyBytes(options.key)
  const key = await importKey(keyBytes, 'AES-CBC')

  // 添加填充
  const padded = addPadding(data, 16, options.padding)

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: options.iv as BufferSource
    },
    key,
    padded as BufferSource
  )

  return new CipherResult(new Uint8Array(encrypted))
}

/**
 * 使用 Web Crypto API 进行 AES-CBC 解密
 */
async function decryptCBC(
  data: Uint8Array,
  options: AESOptions
): Promise<Uint8Array> {
  const keyBytes = getKeyBytes(options.key)
  const key = await importKey(keyBytes, 'AES-CBC')

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: options.iv as BufferSource
    },
    key,
    data as BufferSource
  )

  const decryptedArray = new Uint8Array(decrypted)

  // 移除填充
  return removePadding(decryptedArray, options.padding)
}

/**
 * 使用 Web Crypto API 进行 AES-GCM 加密
 */
async function encryptGCM(
  data: Uint8Array,
  options: AESOptions
): Promise<CipherResult> {
  const keyBytes = getKeyBytes(options.key)
  const key = await importKey(keyBytes, 'AES-GCM')

  const algorithm: AesGcmParams = {
    name: 'AES-GCM',
    iv: options.iv as BufferSource,
    tagLength: 128 // 128 位认证标签
  }

  if (options.aad) {
    algorithm.additionalData = options.aad as BufferSource
  }

  const encrypted = await crypto.subtle.encrypt(
    algorithm,
    key,
    data as BufferSource
  )

  return new CipherResult(new Uint8Array(encrypted))
}

/**
 * 使用 Web Crypto API 进行 AES-GCM 解密
 */
async function decryptGCM(
  data: Uint8Array,
  options: AESOptions
): Promise<Uint8Array> {
  const keyBytes = getKeyBytes(options.key)
  const key = await importKey(keyBytes, 'AES-GCM')

  const algorithm: AesGcmParams = {
    name: 'AES-GCM',
    iv: options.iv as BufferSource,
    tagLength: 128
  }

  if (options.aad) {
    algorithm.additionalData = options.aad as BufferSource
  }

  const decrypted = await crypto.subtle.decrypt(
    algorithm,
    key,
    data as BufferSource
  )

  return new Uint8Array(decrypted)
}

/**
 * 使用 Web Crypto API 进行 AES 加密
 */
export async function webCryptoEncrypt(
  data: string | Uint8Array,
  options: AESOptions
): Promise<CipherResult> {
  const dataBytes = typeof data === 'string' ? str2u8a(data) : data

  if (options.mode === AES_MODE.CBC) {
    return await encryptCBC(dataBytes, options)
  } else if (options.mode === AES_MODE.GCM) {
    return await encryptGCM(dataBytes, options)
  }

  throw new Error(`不支持的加密模式: ${options.mode}`)
}

/**
 * 使用 Web Crypto API 进行 AES 解密
 */
export async function webCryptoDecrypt(
  data: Uint8Array,
  options: AESOptions
): Promise<Uint8Array> {
  if (options.mode === AES_MODE.CBC) {
    return await decryptCBC(data, options)
  } else if (options.mode === AES_MODE.GCM) {
    return await decryptGCM(data, options)
  }

  throw new Error(`不支持的解密模式: ${options.mode}`)
}
