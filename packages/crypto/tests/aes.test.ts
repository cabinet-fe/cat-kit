import { describe, it, expect } from 'vitest'
import { AES, AES_MODE, AES_PADDING } from '../src/symmetric/aes'
import { random } from '../src/key-gen'
import { u8a2str } from '@cat-kit/core'

describe('AES 加密模块', () => {
  describe('AES-CBC 加密/解密', () => {
    it('应该正确加密和解密字符串', async () => {
      const key = 'abcdabcdabcdabcd' // 16 字节
      const iv = random(16)
      const plaintext = 'hello world'

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const decrypted = await AES.decrypt(encrypted, options)
      const result = u8a2str(decrypted)

      expect(result).toBe(plaintext)
    })

    it('应该支持不同的密钥长度', async () => {
      const plaintexts = ['test message']

      // AES-128 (16 字节)
      const key128 = 'abcdabcdabcdabcd'
      const options128 = {
        key: key128,
        iv: random(16),
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }
      const encrypted128 = await AES.encrypt(plaintexts[0]!, options128)
      const decrypted128 = await AES.decryptToString(encrypted128, options128)
      expect(decrypted128).toBe(plaintexts[0])

      // AES-192 (24 字节)
      const key192 = 'abcdabcdabcdabcdabcdabcd'
      const options192 = {
        key: key192,
        iv: random(16),
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }
      const encrypted192 = await AES.encrypt(plaintexts[0]!, options192)
      const decrypted192 = await AES.decryptToString(encrypted192, options192)
      expect(decrypted192).toBe(plaintexts[0])

      // AES-256 (32 字节)
      const key256 = 'abcdabcdabcdabcdabcdabcdabcdabcd'
      const options256 = {
        key: key256,
        iv: random(16),
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }
      const encrypted256 = await AES.encrypt(plaintexts[0]!, options256)
      const decrypted256 = await AES.decryptToString(encrypted256, options256)
      expect(decrypted256).toBe(plaintexts[0])
    })

    it('应该支持 PKCS7 填充', async () => {
      const key = random(16)
      const iv = random(16)
      const plaintext = 'test' // 不是 16 的倍数

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const decrypted = await AES.decryptToString(encrypted, options)

      expect(decrypted).toBe(plaintext)
    })

    it('应该支持 Zero 填充', async () => {
      const key = random(16)
      const iv = random(16)
      const plaintext = 'test message'

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.Zero
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const decrypted = await AES.decrypt(encrypted, options)
      const result = u8a2str(decrypted)

      // Zero 填充可能会保留尾部的零字节
      expect(result.startsWith(plaintext)).toBe(true)
    })

    it('应该支持 Uint8Array 输入', async () => {
      const key = random(16)
      const iv = random(16)
      const plaintext = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const decrypted = await AES.decrypt(encrypted, options)

      expect(decrypted).toEqual(plaintext)
    })

    it('应该支持中文字符', async () => {
      const key = random(16)
      const iv = random(16)
      const plaintext = '你好世界，这是测试消息！'

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const decrypted = await AES.decryptToString(encrypted, options)

      expect(decrypted).toBe(plaintext)
    })

    it('应该处理长文本', async () => {
      const key = random(16)
      const iv = random(16)
      const plaintext = 'a'.repeat(1000)

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const decrypted = await AES.decryptToString(encrypted, options)

      expect(decrypted).toBe(plaintext)
    })
  })

  describe('输出格式', () => {
    it('应该支持 toHex() 输出', async () => {
      const key = random(16)
      const iv = random(16)
      const plaintext = 'test'

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const hex = encrypted.toHex()

      expect(typeof hex).toBe('string')
      expect(/^[0-9a-f]+$/.test(hex)).toBe(true)
      expect(hex.length % 2).toBe(0)
    })

    it('应该支持 toBase64() 输出', async () => {
      const key = random(16)
      const iv = random(16)
      const plaintext = 'test'

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const base64 = encrypted.toBase64()

      expect(typeof base64).toBe('string')
      expect(base64.length).toBeGreaterThan(0)
    })

    it('应该支持 toBytes() 输出', async () => {
      const key = random(16)
      const iv = random(16)
      const plaintext = 'test'

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const bytes = encrypted.toBytes()

      expect(bytes).toBeInstanceOf(Uint8Array)
      expect(bytes.length).toBeGreaterThan(0)
    })
  })

  describe('错误处理', () => {
    it('应该拒绝无效的密钥长度', async () => {
      const invalidKey = 'short' // 不是 16/24/32 字节
      const iv = random(16)

      const options = {
        key: invalidKey,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      await expect(AES.encrypt('test', options)).rejects.toThrow()
    })

    it('应该拒绝 CBC 模式的无效 IV 长度', async () => {
      const key = random(16)
      const invalidIv = random(8) // 应该是 16 字节

      const options = {
        key,
        iv: invalidIv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      await expect(AES.encrypt('test', options)).rejects.toThrow()
    })

    it('应该在使用错误密钥解密时失败', async () => {
      const key1 = random(16)
      const key2 = random(16)
      const iv = random(16)
      const plaintext = 'test'

      const encryptOptions = {
        key: key1,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const decryptOptions = {
        key: key2, // 不同的密钥
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, encryptOptions)

      // 使用错误的密钥解密应该失败或产生乱码
      await expect(async () => {
        const decrypted = await AES.decryptToString(encrypted, decryptOptions)
        // 解密结果不应该等于原文
        expect(decrypted).not.toBe(plaintext)
      }).rejects.toThrow()
    })
  })

  describe('安全性测试', () => {
    it('相同明文使用不同 IV 应该产生不同密文', async () => {
      const key = random(16)
      const iv1 = random(16)
      const iv2 = random(16)
      const plaintext = 'test message'

      const options1 = {
        key,
        iv: iv1,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const options2 = {
        key,
        iv: iv2,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted1 = await AES.encrypt(plaintext, options1)
      const encrypted2 = await AES.encrypt(plaintext, options2)

      expect(encrypted1.toHex()).not.toBe(encrypted2.toHex())
    })

    it('相同明文使用不同密钥应该产生不同密文', async () => {
      const key1 = random(16)
      const key2 = random(16)
      const iv = random(16)
      const plaintext = 'test message'

      const options1 = {
        key: key1,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const options2 = {
        key: key2,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted1 = await AES.encrypt(plaintext, options1)
      const encrypted2 = await AES.encrypt(plaintext, options2)

      expect(encrypted1.toHex()).not.toBe(encrypted2.toHex())
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串', async () => {
      const key = random(16)
      const iv = random(16)
      const plaintext = ''

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const decrypted = await AES.decryptToString(encrypted, options)

      expect(decrypted).toBe(plaintext)
    })

    it('应该处理正好 16 字节的数据', async () => {
      const key = random(16)
      const iv = random(16)
      const plaintext = 'a'.repeat(16) // 正好一个块

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const decrypted = await AES.decryptToString(encrypted, options)

      expect(decrypted).toBe(plaintext)
    })

    it('应该处理多个块的数据', async () => {
      const key = random(16)
      const iv = random(16)
      const plaintext = 'a'.repeat(100) // 多个块

      const options = {
        key,
        iv,
        mode: AES_MODE.CBC,
        padding: AES_PADDING.PKCS7
      }

      const encrypted = await AES.encrypt(plaintext, options)
      const decrypted = await AES.decryptToString(encrypted, options)

      expect(decrypted).toBe(plaintext)
    })
  })
})
