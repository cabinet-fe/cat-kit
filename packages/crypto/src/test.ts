import { AES, PKCS7Padding } from './aes'
import { AES_CBC } from './aes/modes'
import { MD5 } from './md5'

// 测试AES加密
async function testAES() {
  console.log('测试AES加密...')

  // 测试AES-CBC模式
  const aesCBC = new AES({
    mode: new AES_CBC(PKCS7Padding)
  })

  const key = 'abcdefghijklmnop' // 16字节密钥 (AES-128)
  const iv = '1234567890abcdef' // 16字节初始化向量
  const message = 'Hello, World! This is a test message for AES encryption.'

  console.log('原始消息:', message)

  // 加密
  const encrypted = (await aesCBC.encrypt(message, {
    key,
    iv,
    output: 'hex'
  })) as string

  console.log('加密后 (CBC):', encrypted)

  // 解密
  const decrypted = await aesCBC.decrypt(encrypted, {
    key,
    iv
  })

  const decryptedText = new TextDecoder().decode(decrypted)
  console.log('解密后 (CBC):', decryptedText)
  console.log('解密结果是否正确:', decryptedText === message)

  // GCM模式需要在HTTPS环境中测试
  console.log('\nGCM模式需要在HTTPS环境中测试')
}

// 测试MD5哈希
async function testMD5() {
  console.log('\n测试MD5哈希...')

  const md5 = new MD5()
  const testStrings = [
    '',
    'a',
    'abc',
    'message digest',
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ]

  // 已知的MD5哈希值
  const expectedHashes = [
    'd41d8cd98f00b204e9800998ecf8427e',
    '0cc175b9c0f1b6a831c399e269772661',
    '900150983cd24fb0d6963f7d28e17f72',
    'f96b697d7cb7938d525a2f31aaf161d0',
    'c3fcd3d76192e4007dfb496cca67e13b',
    'd174ab98d277d9f5a5611c2c9f419d9f'
  ]

  for (let i = 0; i < testStrings.length; i++) {
    const str = testStrings[i]
    if (str !== undefined) {
      const hash = await md5.hash(str)
      console.log(`MD5("${str}"): ${hash}`)
      console.log(`正确性: ${hash === expectedHashes[i] ? '✓' : '✗'}`)
    }
  }
}

// 运行测试
async function runTests() {
  try {
    await testAES()
    await testMD5()
    console.log('\n所有测试完成!')
  } catch (error) {
    console.error('测试过程中发生错误:', error)
  }
}

runTests()
