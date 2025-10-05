import { describe, it, expect } from 'vitest'
import { nanoid, random } from '../src/key-gen'
import { md5 } from '../src/digest/md5'
import { AES, AES_MODE, AES_PADDING } from '../src/symmetric/aes'
import { u8a2str } from '@cat-kit/core'

describe('集成测试', () => {
  describe('完整加密工作流', () => {
    it('应该完成从密钥生成到加密解密的完整流程', async () => {
      // 1. 生成密钥和 IV
      const key = random(32) // 256 位密钥
      const iv = random(16)

      // 2. 生成唯一 ID
      const recordId = nanoid(16)
      expect(recordId.length).toBe(16)

      // 3. 加密敏感数据
      const sensitiveData = 'user-password-123'
      const encrypted = await AES.encrypt(sensitiveData, {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      })

      // 4. 计算密文哈希（用于验证完整性）
      const hash = md5(encrypted.toBytes()).hex()
      expect(hash.length).toBe(32)

      // 5. 解密验证
      const decrypted = await AES.decryptToString(encrypted, {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      })

      expect(decrypted).toBe(sensitiveData)

      // 6. 验证哈希一致性
      const hash2 = md5(encrypted.toBytes()).hex()
      expect(hash).toBe(hash2)
    })

    it('应该支持数据完整性验证流程', async () => {
      const key = random(16)
      const iv = random(16)
      const data = 'important data'

      // 1. 计算原始数据的哈希
      const originalHash = md5(data).hex()

      // 2. 加密数据
      const encrypted = await AES.encrypt(data, {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      })

      // 3. 计算密文的哈希
      const encryptedHash = md5(encrypted.toBytes()).hex()

      // 4. 解密数据
      const decrypted = await AES.decryptToString(encrypted, {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      })

      // 5. 验证解密后的数据哈希
      const decryptedHash = md5(decrypted).hex()

      expect(decrypted).toBe(data)
      expect(originalHash).toBe(decryptedHash)
      expect(originalHash).not.toBe(encryptedHash)
    })

    it('应该支持批量数据加密', async () => {
      const key = random(16)
      const dataList = [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com'
      ]

      const results: Array<{
        id: string
        encrypted: string
        hash: string
      }> = []

      for (const data of dataList) {
        const iv = random(16) // 每条数据使用不同的 IV
        const id = nanoid(10)

        const encrypted = await AES.encrypt(data, {
          key,
          iv,
          mode: AES_MODE.CBC,
          padding: AES_PADDING.PKCS7
        })

        const hash = md5(encrypted.toBytes()).hex()

        results.push({
          id,
          encrypted: encrypted.toBase64(),
          hash
        })

        // 验证解密
        const decrypted = await AES.decryptToString(encrypted, {
          key,
          iv,
          mode: AES_MODE.CBC,
          padding: AES_PADDING.PKCS7
        })
        expect(decrypted).toBe(data)
      }

      // 验证所有 ID 都是唯一的
      const ids = results.map(r => r.id)
      expect(new Set(ids).size).toBe(dataList.length)

      // 验证所有哈希都是唯一的
      const hashes = results.map(r => r.hash)
      expect(new Set(hashes).size).toBe(dataList.length)
    })
  })

  describe('性能测试', () => {
    it('应该快速生成大量 ID', () => {
      const start = Date.now()
      const ids = new Set<string>()

      for (let i = 0; i < 10000; i++) {
        ids.add(nanoid())
      }

      const duration = Date.now() - start

      expect(ids.size).toBe(10000) // 所有 ID 都是唯一的
      expect(duration).toBeLessThan(1000) // 应该在 1 秒内完成
    })

    it('应该高效计算多个哈希', () => {
      const start = Date.now()
      const texts = Array.from({ length: 1000 }, (_, i) => `test-${i}`)
      const hashes = texts.map(text => md5(text).hex())

      const duration = Date.now() - start

      expect(new Set(hashes).size).toBe(1000) // 所有哈希都是唯一的
      expect(duration).toBeLessThan(500) // 应该在 500ms 内完成
    })

    it('应该高效生成随机数', () => {
      const start = Date.now()

      for (let i = 0; i < 1000; i++) {
        random(32)
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(500) // 应该在 500ms 内完成
    })
  })

  describe('边界和错误处理', () => {
    it('应该正确处理空数据的加密和哈希', async () => {
      const key = random(16)
      const iv = random(16)
      const emptyData = ''

      // 空数据加密
      const encrypted = await AES.encrypt(emptyData, {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      })
      const decrypted = await AES.decryptToString(encrypted, {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      })
      expect(decrypted).toBe(emptyData)

      // 空数据哈希
      const hash = md5(emptyData).hex()
      expect(hash).toBe('d41d8cd98f00b204e9800998ecf8427e')
    })

    it('应该处理极大的数据', async () => {
      const largeData = 'x'.repeat(10000)

      // 哈希大数据
      const hash = md5(largeData).hex()
      expect(hash.length).toBe(32)

      // 加密大数据
      const key = random(16)
      const iv = random(16)
      const encrypted = await AES.encrypt(largeData, {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      })
      const decrypted = await AES.decryptToString(encrypted, {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      })
      expect(decrypted).toBe(largeData)
    })

    it('应该处理特殊字符和 Unicode', async () => {
      const specialData = '🎉🎊 测试 @#$%^&*() 日本語 한글'

      // 哈希
      const hash = md5(specialData).hex()
      expect(hash.length).toBe(32)

      // 加密解密
      const key = random(16)
      const iv = random(16)
      const encrypted = await AES.encrypt(specialData, {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      })
      const decrypted = await AES.decryptToString(encrypted, {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      })
      expect(decrypted).toBe(specialData)
    })
  })

  describe('实际应用场景', () => {
    it('密码加密存储场景', async () => {
      const password = 'MySecretPassword123!'
      const salt = random(16)

      // 1. 使用盐值派生密钥（简化版，实际应使用 PBKDF2 等）
      const keyMaterial = md5(password + salt.toString()).bytes()
      const key = keyMaterial
      const iv = random(16)

      // 2. 加密密码
      const encrypted = await AES.encrypt(password, {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      })

      // 3. 存储格式
      const stored = {
        salt: Array.from(salt),
        iv: Array.from(iv),
        encrypted: encrypted.toBase64()
      }

      // 4. 验证（解密）
      const recoveredSalt = new Uint8Array(stored.salt)
      const recoveredIv = new Uint8Array(stored.iv)
      const recoveredKey = md5(password + recoveredSalt.toString()).bytes()

      const decrypted = await AES.decryptToString(
        new Uint8Array(Buffer.from(stored.encrypted, 'base64')),
        {
          key: recoveredKey,
          iv: recoveredIv,
          mode: AES_MODE.CBC,
          padding: AES_PADDING.PKCS7
        }
      )

      expect(decrypted).toBe(password)
    })

    it('文件完整性校验场景', () => {
      // 模拟文件内容
      const fileContent = 'This is a very important file content.'

      // 1. 生成文件 ID
      const fileId = nanoid(16)

      // 2. 计算文件哈希
      const checksum = md5(fileContent).hex()

      // 3. 使用哈希器增量计算（模拟分片）
      const hasher = md5.hasher()
      const chunkSize = 10
      for (let i = 0; i < fileContent.length; i += chunkSize) {
        hasher.update(fileContent.slice(i, i + chunkSize))
      }
      const incrementalChecksum = hasher.finish().hex()

      // 4. 验证
      expect(checksum).toBe(incrementalChecksum)
      expect(fileId.length).toBe(16)
    })

    it('会话令牌生成场景', () => {
      // 1. 生成会话 ID
      const sessionId = nanoid(32)

      // 2. 生成 CSRF 令牌
      const csrfToken = nanoid(24)

      // 3. 生成刷新令牌
      const refreshToken = nanoid(48)

      // 4. 验证格式
      expect(sessionId.length).toBe(32)
      expect(csrfToken.length).toBe(24)
      expect(refreshToken.length).toBe(48)

      // 5. 验证唯一性
      expect(sessionId).not.toBe(csrfToken)
      expect(sessionId).not.toBe(refreshToken)
      expect(csrfToken).not.toBe(refreshToken)
    })
  })
})
