/**
 * @cat-kit/crypto 使用示例
 * 这个文件展示了如何使用 crypto 模块的各种功能
 */

// ============= 生成器示例 =============
import { nanoid, random, customAlphabet } from './src/key-gen'

// 生成唯一 ID
const id = nanoid() // 默认 21 位
const shortId = nanoid(10) // 10 位

// 生成随机字节
const randomBytes = random(32)
console.log('随机字节:', randomBytes)

// 自定义字符集
const customId = customAlphabet('0123456789ABCDEF', 16)
console.log('自定义 ID:', customId())

// ============= MD5 摘要示例 =============
import { md5 } from './src/digest/md5'

// 简单字符串哈希
const hash1 = md5('hello world')
console.log('MD5 (hex):', hash1.hex())
console.log('MD5 (base64):', hash1.base64())

// 增量计算
const hasher = md5.hasher()
hasher.update('hello')
hasher.update(' ')
hasher.update('world')
const hash2 = hasher.finish()
console.log('增量 MD5:', hash2.hex())

// 文件哈希示例（需要在浏览器环境中运行）
async function hashFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const hasher = md5.hasher()
    const reader = new FileReader()
    const chunkSize = 2 * 1024 * 1024 // 2MB
    let offset = 0

    function readChunk() {
      if (offset >= file.size) {
        resolve(hasher.finish().hex())
        return
      }
      const nextOffset = Math.min(offset + chunkSize, file.size)
      reader.readAsArrayBuffer(file.slice(offset, nextOffset))
      offset = nextOffset
    }

    reader.onload = e => {
      hasher.update(e.target!.result as ArrayBuffer)
      readChunk()
    }

    reader.onerror = reject
    readChunk()
  })
}

// ============= AES 加密示例 =============
import { AES, AES_MODE, AES_PADDING } from './src/symmetric/aes'

async function aesExamples() {
  // CBC 模式加密
  const key128 = 'abcdabcdabcdabcd' // 16 字节 = 128 位
  const iv = random(16)

  const cbcOptions = {
    key: key128,
    iv,
    mode: AES_MODE.CBC,
    padding: AES_PADDING.PKCS7
  }

  // 加密
  const cipherText = await AES.encrypt('hello world', cbcOptions)
  console.log('密文 (hex):', cipherText.toHex())
  console.log('密文 (base64):', cipherText.toBase64())

  // 解密
  const decrypted = await AES.decrypt(cipherText, cbcOptions)
  console.log('解密结果:', new TextDecoder().decode(decrypted))

  // 或者直接解密为字符串
  const text = await AES.decryptToString(cipherText, cbcOptions)
  console.log('解密文本:', text)

  // GCM 模式（需要 HTTPS 或 Node.js 环境）
  const key256 = 'abcdabcdabcdabcdabcdabcdabcdabcd' // 32 字节 = 256 位
  const ivGcm = random(12) // GCM 推荐 12 字节

  const gcmOptions = {
    key: key256,
    iv: ivGcm,
    mode: AES_MODE.GCM,
    padding: AES_PADDING.None,
    aad: new Uint8Array([1, 2, 3]) // 可选的附加认证数据
  }

  try {
    const gcmCipher = await AES.encrypt('sensitive data', gcmOptions)
    const gcmDecrypted = await AES.decryptToString(gcmCipher, gcmOptions)
    console.log('GCM 解密:', gcmDecrypted)
  } catch (error) {
    console.log('GCM 模式需要 HTTPS 环境或 Node.js')
  }

  // 不同密钥长度
  const key192 = 'abcdabcdabcdabcdabcdabcd' // 24 字节 = 192 位
  const options192 = {
    key: key192,
    iv: random(16),
    mode: AES_MODE.CBC,
    padding: AES_PADDING.PKCS7
  }

  const cipher192 = await AES.encrypt('AES-192', options192)
  console.log('AES-192 密文:', cipher192.toHex())
}

// 运行 AES 示例
aesExamples().catch(console.error)

// ============= 组合使用示例 =============

/**
 * 完整的加密工作流：生成密钥、加密数据、计算哈希
 */
async function fullWorkflow() {
  // 1. 生成密钥和 IV
  const key = random(32) // 256 位密钥
  const iv = random(16)

  // 2. 加密敏感数据
  const sensitiveData = 'user-password-123'
  const encrypted = await AES.encrypt(sensitiveData, {
    key,
    iv,
    mode: AES_MODE.CBC,
    padding: AES_PADDING.PKCS7
  })

  // 3. 计算密文哈希（用于验证完整性）
  const hash = md5(encrypted.toBytes()).hex()

  // 4. 生成唯一 ID（用于存储）
  const recordId = nanoid(16)

  console.log('记录 ID:', recordId)
  console.log('加密数据:', encrypted.toBase64())
  console.log('数据哈希:', hash)

  // 5. 解密验证
  const decrypted = await AES.decryptToString(encrypted, {
    key,
    iv,
    mode: AES_MODE.CBC,
    padding: AES_PADDING.PKCS7
  })

  console.log('解密成功:', decrypted === sensitiveData)
}

fullWorkflow().catch(console.error)
